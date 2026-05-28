export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getSystemPrompt, ROUTING_PROMPT_JA, ROUTING_PROMPT_EN } from '@/lib/system-prompts'
import { Language } from '@/lib/i18n'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

interface ChatRequestBody {
  message: string
  sessionId?: string
  language: Language
  userName?: string
}

async function routeToSpecialty(message: string, language: Language): Promise<{ specialty: string; isEmergency: boolean }> {
  const routingPrompt = language === 'ja' ? ROUTING_PROMPT_JA : ROUTING_PROMPT_EN // EN prompt works for all non-JA languages

  try {
    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          { role: 'system', content: routingPrompt },
          { role: 'user', content: message },
        ],
        max_tokens: 200,
        response_format: { type: 'json_object' },
      }),
    })

    if (!response?.ok) {
      return { specialty: 'general', isEmergency: false }
    }

    const data = await response.json()
    const content = data?.choices?.[0]?.message?.content ?? '{}'
    try {
      const parsed = JSON.parse(content)
      return {
        specialty: parsed?.specialty ?? 'general',
        isEmergency: parsed?.isEmergency === true,
      }
    } catch {
      return { specialty: 'general', isEmergency: false }
    }
  } catch {
    return { specialty: 'general', isEmergency: false }
  }
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatRequestBody = await request.json()
    const { message, language, userName } = body ?? {}
    let { sessionId } = body ?? {}

    if (!message || typeof message !== 'string') {
      return new Response(JSON.stringify({ error: 'Message is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Get authenticated user if any
    const authSession = await getServerSession(authOptions)
    const userId = (authSession?.user as any)?.id ?? null

    // Create or get session
    if (!sessionId) {
      const session = await prisma.chatSession.create({
        data: { language: language ?? 'ja', userId },
      })
      sessionId = session?.id
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: sessionId ?? '',
        role: 'user',
        content: message,
      },
    })

    // Auto-set session title from first message
    try {
      const msgCount = await prisma.chatMessage.count({ where: { sessionId: sessionId ?? '' } })
      if (msgCount === 1) {
        await prisma.chatSession.update({
          where: { id: sessionId ?? '' },
          data: { title: message.slice(0, 60) },
        })
      }
    } catch {}

    // Route to specialty
    const routing = await routeToSpecialty(message, language ?? 'ja')
    const specialty = routing?.specialty ?? 'general'
    const isEmergencyFromRouting = routing?.isEmergency === true

    // Get conversation history
    const history = await prisma.chatMessage.findMany({
      where: { sessionId: sessionId ?? '' },
      orderBy: { createdAt: 'asc' },
      take: 20,
    })

    const systemPrompt = getSystemPrompt(specialty, language ?? 'ja', userName)

    const messages = [
      { role: 'system', content: systemPrompt },
      ...(history ?? []).map((msg: any) => ({
        role: msg?.role === 'user' ? 'user' as const : 'assistant' as const,
        content: msg?.content ?? '',
      })),
    ]

    // Stream from LLM
    const llmResponse = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages,
        stream: true,
        max_tokens: 2000,
        response_format: { type: 'json_object' },
      }),
    })

    if (!llmResponse?.ok) {
      const errText = await llmResponse?.text?.().catch(() => 'Unknown error')
      return new Response(
        JSON.stringify({ error: `LLM API error: ${errText}` }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const stream = new ReadableStream({
      async start(controller) {
        const reader = llmResponse?.body?.getReader()
        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''
        let partialRead = ''

        try {
          while (true) {
            const result = await reader?.read()
            if (!result || result?.done) break
            partialRead += decoder.decode(result?.value, { stream: true })
            let lines = partialRead.split('\n')
            partialRead = lines?.pop() ?? ''

            for (const line of (lines ?? [])) {
              if (line?.startsWith('data: ')) {
                const data = line.slice(6)
                if (data === '[DONE]') {
                  // Parse buffered JSON
                  let parsed: any = {}
                  try {
                    parsed = JSON.parse(buffer)
                  } catch {
                    parsed = { message: buffer, specialty: specialty, confidence: 0.7, references: '', isEmergency: isEmergencyFromRouting }
                  }

                  const finalSpecialty = parsed?.specialty ?? specialty
                  const finalIsEmergency = parsed?.isEmergency === true || isEmergencyFromRouting

                  // Save assistant message to DB
                  try {
                    await prisma.chatMessage.create({
                      data: {
                        sessionId: sessionId ?? '',
                        role: 'assistant',
                        content: parsed?.message ?? buffer,
                        specialty: finalSpecialty,
                        confidence: typeof parsed?.confidence === 'number' ? parsed.confidence : 0.7,
                        references: parsed?.references ?? '',
                        isEmergency: finalIsEmergency,
                      },
                    })
                    // Save health record for logged-in users
                    if (userId && sessionId) {
                      try {
                        await prisma.healthRecord.create({
                          data: {
                            userId,
                            category: finalSpecialty,
                            symptom: (body?.message ?? '').slice(0, 200),
                            summary: (parsed?.message ?? '').slice(0, 500),
                            sessionId,
                          },
                        })
                      } catch {}
                    }
                  } catch (dbErr: any) {
                    console.error('DB save error:', dbErr)
                  }

                  const finalData = JSON.stringify({
                    status: 'completed',
                    result: {
                      message: parsed?.message ?? buffer,
                      specialty: finalSpecialty,
                      confidence: parsed?.confidence ?? 0.7,
                      references: parsed?.references ?? '',
                      isEmergency: finalIsEmergency,
                      sessionId: sessionId,
                    },
                  })
                  controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
                  return
                }

                try {
                  const chunkParsed = JSON.parse(data)
                  buffer += chunkParsed?.choices?.[0]?.delta?.content ?? ''
                  const progressData = JSON.stringify({
                    status: 'processing',
                    message: buffer,
                  })
                  controller.enqueue(encoder.encode(`data: ${progressData}\n\n`))
                } catch {
                  // Skip invalid JSON chunks
                }
              }
            }
          }

          // Handle case where stream ends without [DONE]
          if (buffer) {
            let parsed: any = {}
            try {
              parsed = JSON.parse(buffer)
            } catch {
              parsed = { message: buffer, specialty: specialty, confidence: 0.7, references: '', isEmergency: isEmergencyFromRouting }
            }

            try {
              await prisma.chatMessage.create({
                data: {
                  sessionId: sessionId ?? '',
                  role: 'assistant',
                  content: parsed?.message ?? buffer,
                  specialty: parsed?.specialty ?? specialty,
                  confidence: typeof parsed?.confidence === 'number' ? parsed.confidence : 0.7,
                  references: parsed?.references ?? '',
                  isEmergency: parsed?.isEmergency === true || isEmergencyFromRouting,
                },
              })
            } catch (dbErr: any) {
              console.error('DB save error:', dbErr)
            }

            const finalData = JSON.stringify({
              status: 'completed',
              result: {
                message: parsed?.message ?? buffer,
                specialty: parsed?.specialty ?? specialty,
                confidence: parsed?.confidence ?? 0.7,
                references: parsed?.references ?? '',
                isEmergency: parsed?.isEmergency === true || isEmergencyFromRouting,
                sessionId: sessionId,
              },
            })
            controller.enqueue(encoder.encode(`data: ${finalData}\n\n`))
          }
        } catch (error: any) {
          console.error('Stream error:', error)
          const errorData = JSON.stringify({
            status: 'error',
            message: error?.message ?? 'Stream error',
          })
          controller.enqueue(encoder.encode(`data: ${errorData}\n\n`))
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    })
  } catch (error: any) {
    console.error('Chat API error:', error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
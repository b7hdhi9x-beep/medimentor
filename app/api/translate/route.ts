export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'

const LANG_NAMES: Record<string, string> = {
  ja: 'Japanese',
  en: 'English',
  es: 'Spanish',
  zh: 'Chinese',
  ko: 'Korean',
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { text, targetLang } = body ?? {}

    if (!text || !targetLang) {
      return new Response(JSON.stringify({ error: 'text and targetLang are required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const targetName = LANG_NAMES[targetLang] ?? 'English'

    const response = await fetch('https://apps.abacus.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.ABACUSAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4.1-mini',
        messages: [
          {
            role: 'system',
            content: `You are a translator. Translate the following text to ${targetName}. Return ONLY the translated text, nothing else. Preserve the original tone, emoji, and formatting. If the text is already in ${targetName}, return it as-is.`,
          },
          { role: 'user', content: text },
        ],
        max_tokens: 2000,
      }),
    })

    if (!response?.ok) {
      return new Response(JSON.stringify({ error: 'Translation API error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const data = await response.json()
    const translation = data?.choices?.[0]?.message?.content ?? ''

    return new Response(JSON.stringify({ translation }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('[Translate API Error]', error?.message)
    return new Response(JSON.stringify({ error: 'Translation failed' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}

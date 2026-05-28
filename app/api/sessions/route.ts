export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Create new session
export async function POST(request: NextRequest) {
  try {
    const body = await request?.json().catch(() => ({}))
    const language = body?.language ?? 'ja'

    const authSession = await getServerSession(authOptions)
    const userId = (authSession?.user as any)?.id ?? null

    const session = await prisma.chatSession.create({
      data: {
        language,
        userId,
      },
    })

    return new Response(JSON.stringify({ sessionId: session?.id }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Session creation error:', error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Failed to create session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Get user's sessions list
export async function GET(request: NextRequest) {
  try {
    const authSession = await getServerSession(authOptions)
    const userId = (authSession?.user as any)?.id

    if (!userId) {
      return new Response(JSON.stringify({ sessions: [] }), {
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sessions = await prisma.chatSession.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      take: 30,
      include: {
        messages: {
          take: 1,
          where: { role: 'user' },
          orderBy: { createdAt: 'asc' },
          select: { content: true },
        },
        _count: { select: { messages: true } },
      },
    })

    const formatted = sessions.map((s: any) => ({
      id: s.id,
      title: s.title || s.messages?.[0]?.content?.slice(0, 50) || 'New conversation',
      messageCount: s._count?.messages ?? 0,
      updatedAt: s.updatedAt,
      language: s.language,
    }))

    return new Response(JSON.stringify({ sessions: formatted }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Sessions list error:', error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Failed to fetch sessions' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

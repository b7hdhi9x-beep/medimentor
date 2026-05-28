export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

// Delete a specific session
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions)
    const userId = (authSession?.user as any)?.id

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sessionId = params?.id
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    })

    if (!chatSession) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Delete messages first (cascade should handle this, but be explicit)
    await prisma.chatMessage.deleteMany({ where: { sessionId } })
    await prisma.chatSession.delete({ where: { id: sessionId } })

    return new Response(JSON.stringify({ success: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Delete session error:', error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Failed to delete session' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Get messages for a specific session
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authSession = await getServerSession(authOptions)
    const userId = (authSession?.user as any)?.id

    if (!userId) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const sessionId = params?.id
    if (!sessionId) {
      return new Response(JSON.stringify({ error: 'Session ID required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    // Verify session belongs to user
    const chatSession = await prisma.chatSession.findFirst({
      where: { id: sessionId, userId },
    })

    if (!chatSession) {
      return new Response(JSON.stringify({ error: 'Session not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      })
    }

    const messages = await prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        role: true,
        content: true,
        specialty: true,
        confidence: true,
        references: true,
        isEmergency: true,
      },
    })

    return new Response(JSON.stringify({
      session: {
        id: chatSession.id,
        language: chatSession.language,
        title: chatSession.title,
      },
      messages,
    }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error: any) {
    console.error('Session messages error:', error)
    return new Response(
      JSON.stringify({ error: error?.message ?? 'Failed to fetch messages' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

export const dynamic = "force-dynamic";

import { NextRequest } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.error('[CLIENT_ERROR]', JSON.stringify({
      message: body?.message,
      stack: body?.stack,
      userAgent: body?.userAgent,
      url: body?.url,
      timestamp: new Date().toISOString(),
    }))
    return new Response(JSON.stringify({ ok: true }), {
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    return new Response(JSON.stringify({ ok: false }), { status: 500 })
  }
}

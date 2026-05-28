export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    const userId = (session?.user as any)?.id
    if (!userId) {
      return NextResponse.json({ records: [] })
    }

    const records = await prisma.healthRecord.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 100,
    })

    return NextResponse.json({ records })
  } catch (error: any) {
    console.error('Health records fetch error:', error)
    return NextResponse.json({ records: [] })
  }
}

'use client'

import dynamic from 'next/dynamic'

const MediMentorApp = dynamic(
  () => import('@/components/medimentor-app').then(mod => ({ default: mod.MediMentorApp })),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-col h-screen bg-gradient-to-b from-blue-50/50 via-background to-green-50/30">
        <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm">
          <div className="max-w-4xl mx-auto px-4 py-3 flex items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-green-200 to-blue-200 animate-pulse" />
            <div className="h-5 w-24 bg-muted rounded animate-pulse" />
          </div>
        </div>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-green-200 to-blue-200 mx-auto animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded mx-auto animate-pulse" />
          </div>
        </div>
      </div>
    ),
  }
)

export default function Home() {
  return <MediMentorApp />
}

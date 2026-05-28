'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const HealthPageInner = dynamic(
  () => import('@/components/health-page-content').then(mod => ({ default: mod.HealthPageContent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
)

export default function HealthPage() {
  return <HealthPageInner />
}

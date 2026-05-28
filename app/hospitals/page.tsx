'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const HospitalsPageInner = dynamic(
  () => import('@/components/hospitals-page-content').then(mod => ({ default: mod.HospitalsPageContent })),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
)

export default function HospitalsPage() {
  return <HospitalsPageInner />
}

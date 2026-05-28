'use client'

import { Language, getTranslation } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { Phone } from 'lucide-react'

interface EmergencyBannerProps {
  language: Language
}

export function EmergencyBanner({ language }: EmergencyBannerProps) {
  const t = getTranslation(language)

  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      className="bg-red-50 border-b border-red-200 px-4 py-3"
    >
      <div className="max-w-3xl mx-auto flex items-center gap-3">
        <Phone className="w-5 h-5 text-red-600 flex-shrink-0 animate-pulse" />
        <p className="text-xs text-red-700 font-medium">
          {t?.emergencyWarning ?? ''}
        </p>
      </div>
    </motion.div>
  )
}

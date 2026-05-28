'use client'

import { Language, getTranslation } from '@/lib/i18n'

interface DisclaimerBarProps {
  language: Language
}

export function DisclaimerBar({ language }: DisclaimerBarProps) {
  const t = getTranslation(language)

  return (
    <div className="bg-amber-50/80 border-t border-amber-200/50 px-4 py-2">
      <p className="text-[10px] text-amber-700/70 text-center max-w-3xl mx-auto leading-relaxed">
        {t?.disclaimer ?? ''}
      </p>
    </div>
  )
}

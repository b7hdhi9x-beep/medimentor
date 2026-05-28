'use client'

import { Language, getTranslation } from '@/lib/i18n'
import { motion } from 'framer-motion'

interface ThinkingIndicatorProps {
  language: Language
}

export function ThinkingIndicator({ language }: ThinkingIndicatorProps) {
  const t = getTranslation(language)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-green-100 to-blue-100">
        <img
          src="https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png"
          alt={t?.characterName ?? 'Pipi'}
          className="w-full h-full object-cover animate-pulse-gentle"
        />
      </div>
      <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground animate-pulse-gentle">
            {t?.thinking ?? 'Thinking...'}
          </span>
          <div className="flex gap-1">
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0 }}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.2 }}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
            />
            <motion.div
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: Infinity, duration: 0.8, delay: 0.4 }}
              className="w-1.5 h-1.5 rounded-full bg-primary/60"
            />
          </div>
        </div>
      </div>
    </motion.div>
  )
}

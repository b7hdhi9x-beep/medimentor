'use client'

import { useState, useRef, useEffect } from 'react'
import { Language, LANGUAGE_OPTIONS } from '@/lib/i18n'
import { ChevronDown } from 'lucide-react'

interface LanguageSelectorProps {
  language: Language
  onChangeLanguage: (lang: Language) => void
}

export function LanguageSelector({ language, onChangeLanguage }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const current = LANGUAGE_OPTIONS.find(o => o.code === language) ?? LANGUAGE_OPTIONS[0]

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-all shadow-sm"
      >
        <span>{current.flag}</span>
        <span className="hidden sm:inline">{current.name}</span>
        <ChevronDown className={`w-3 h-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-border/50 py-1 z-50 min-w-[120px]">
          {LANGUAGE_OPTIONS.map(opt => (
            <button
              key={opt.code}
              onClick={() => { onChangeLanguage(opt.code); setOpen(false) }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-muted transition-colors ${
                opt.code === language ? 'text-primary font-semibold bg-primary/5' : 'text-foreground'
              }`}
            >
              <span>{opt.flag}</span>
              <span>{opt.name}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

'use client'

import { Message } from './medimentor-app'
import { Language, getTranslation } from '@/lib/i18n'
import { motion } from 'framer-motion'
import { AlertTriangle, CheckCircle, BookOpen, User, Languages } from 'lucide-react'
import { useState } from 'react'

// ピピの妖精キャラクター（医者ではない）- 各専門科テーマ別
const PIPI_BASE = 'https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png'
const SPECIALIST_AVATARS: Record<string, string> = {
  mental_health: 'https://cdn.abacus.ai/images/0a7dc027-64b9-4143-8078-a5511a6fb18b.png',
  internal_medicine: 'https://cdn.abacus.ai/images/bdc8e697-ce17-4983-89ad-871bccde330c.png',
  orthopedics: 'https://cdn.abacus.ai/images/53cd0f45-9203-4224-aead-69ed4bcce2da.png',
  pediatrics: 'https://cdn.abacus.ai/images/2bbad3e5-c3c6-4a79-8797-8a284a616669.png',
  pharmacy: 'https://cdn.abacus.ai/images/f0c5f305-b50e-4770-b307-b55ae6ee1756.png',
  nutrition: 'https://cdn.abacus.ai/images/825ef041-bdaa-4d75-a26d-e713305c6b7e.png',
  dermatology: 'https://cdn.abacus.ai/images/b5ebcf58-ac5e-483f-94f0-f4369b2a099b.png',
  ophthalmology: 'https://cdn.abacus.ai/images/c256e92d-46ee-451a-84af-18abe002902a.png',
  ent: 'https://cdn.abacus.ai/images/ac5bb3bf-e4d3-4482-84eb-4557086b05c1.png',
  urology: 'https://cdn.abacus.ai/images/82a3a87f-1aee-455f-9aa4-78f3677f6c40.png',
  gynecology: 'https://cdn.abacus.ai/images/b12dd910-36cd-45cb-95b5-b704ffb45969.png',
  cardiology: 'https://cdn.abacus.ai/images/7d6b64ae-408c-4bb6-89fd-2b26f01f17f1.png',
  neurology: 'https://cdn.abacus.ai/images/15f4e07c-a768-4d8b-865a-37970983705c.png',
  surgery: 'https://cdn.abacus.ai/images/2ad895b4-36b1-4821-a5fe-7088ce41886b.png',
  dentistry: 'https://cdn.abacus.ai/images/3a675cf6-3ead-47a7-ab9a-8e5d8e282fc5.png',
  general: PIPI_BASE,
}

const SPECIALIST_COLORS: Record<string, string> = {
  mental_health: 'from-purple-100 to-purple-50',
  internal_medicine: 'from-blue-100 to-blue-50',
  orthopedics: 'from-teal-100 to-teal-50',
  pediatrics: 'from-pink-100 to-pink-50',
  pharmacy: 'from-indigo-100 to-indigo-50',
  nutrition: 'from-orange-100 to-orange-50',
  dermatology: 'from-rose-100 to-rose-50',
  ophthalmology: 'from-sky-100 to-sky-50',
  ent: 'from-amber-100 to-amber-50',
  urology: 'from-cyan-100 to-cyan-50',
  gynecology: 'from-fuchsia-100 to-fuchsia-50',
  cardiology: 'from-red-100 to-red-50',
  neurology: 'from-violet-100 to-violet-50',
  surgery: 'from-emerald-100 to-emerald-50',
  dentistry: 'from-slate-100 to-blue-50',
  general: 'from-green-100 to-blue-50',
}

interface ChatMessageProps {
  message: Message
  language: Language
}

function TranslateButton({ text, language, preloadedTranslation }: { text: string; language: Language; preloadedTranslation?: string }) {
  const t = getTranslation(language)
  const [isOpen, setIsOpen] = useState(false)
  const [translation, setTranslation] = useState(preloadedTranslation ?? '')
  const [isLoading, setIsLoading] = useState(false)
  const [targetLang, setTargetLang] = useState(language)

  const handleToggle = async () => {
    if (isOpen) {
      setIsOpen(false)
      return
    }
    setIsOpen(true)

    // If language changed or no translation yet, fetch new one
    if (!translation || targetLang !== language) {
      setIsLoading(true)
      setTargetLang(language)
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: language }),
        })
        const data = await res?.json()
        setTranslation(data?.translation ?? '')
      } catch {
        setTranslation('翻訳に失敗しました / Translation failed')
      } finally {
        setIsLoading(false)
      }
    }
  }

  return (
    <div className="mt-2">
      <button
        onClick={handleToggle}
        className="flex items-center gap-1.5 text-[11px] font-medium text-blue-600 hover:text-blue-700 transition-colors"
      >
        <Languages className="w-3.5 h-3.5" />
        {t?.translationLabel ?? '🌐 Translation'}
        <span className={`transition-transform duration-200 text-[9px] ${isOpen ? 'rotate-180' : ''}`}>▼</span>
      </button>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="mt-1.5 pl-3 border-l-2 border-blue-200 bg-blue-50/50 rounded-r-lg px-3 py-2"
        >
          {isLoading ? (
            <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
              <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
              {language === 'ja' ? '翻訳中...' : 'Translating...'}
            </div>
          ) : (
            <p className="text-sm text-foreground/80 whitespace-pre-wrap leading-relaxed">{translation}</p>
          )}
        </motion.div>
      )}
    </div>
  )
}

export function ChatMessage({ message, language }: ChatMessageProps) {
  const t = getTranslation(language)
  const isUser = message?.role === 'user'
  const specialty = message?.specialty ?? 'general'
  const avatarUrl = SPECIALIST_AVATARS[specialty] ?? SPECIALIST_AVATARS.general
  const bgGradient = SPECIALIST_COLORS[specialty] ?? SPECIALIST_COLORS.general
  const specialtyLabel = (t?.specialty as any)?.[specialty] ?? (t?.specialty as any)?.general ?? ''

  if (isUser) {
    return (
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="flex items-start gap-3 justify-end"
      >
        <div className="max-w-[85%]">
          <div className="bg-primary text-primary-foreground rounded-2xl rounded-tr-md px-4 py-3 shadow-sm">
            <p className="text-sm whitespace-pre-wrap">{message?.content ?? ''}</p>
          </div>
          <div className="flex justify-end mt-0.5">
            <TranslateButton text={message?.content ?? ''} language={language} />
          </div>
        </div>
        <div className="w-10 h-10 rounded-full flex-shrink-0 bg-primary/10 flex items-center justify-center shadow-sm">
          <User className="w-5 h-5 text-primary" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      className="flex items-start gap-3"
    >
      <div className={`w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br ${bgGradient}`}>
        <img
          src={avatarUrl}
          alt={specialtyLabel}
          className="w-full h-full object-cover"
          onError={(e: any) => {
            if (e?.target) {
              e.target.style.display = 'none'
            }
          }}
        />
      </div>
      <div className="flex-1 max-w-[85%]">
        {/* Specialty badge */}
        {!message?.isStreaming && specialty && specialty !== 'general' && (
          <span className={`inline-block px-2 py-0.5 text-[10px] font-medium rounded-full mb-1 bg-gradient-to-r ${bgGradient}`}>
            {specialtyLabel}
          </span>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-3 shadow-sm">
          {message?.isEmergency && (
            <div className="flex items-center gap-1.5 text-red-600 bg-red-50 rounded-lg px-3 py-2 mb-2 text-xs font-medium">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              {t?.emergencyWarning ?? ''}
            </div>
          )}

          <p className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed">
            {message?.content ?? ''}
            {message?.isStreaming && <span className="typing-cursor" />}
          </p>

          {/* Translation */}
          {!message?.isStreaming && message?.content && (
            <TranslateButton
              text={message?.content ?? ''}
              language={language}
              preloadedTranslation={message?.translation}
            />
          )}

          {/* Confidence & References */}
          {!message?.isStreaming && message?.content && (
            <div className="mt-3 pt-2 border-t border-border/30 space-y-1.5">
              {typeof message?.confidence === 'number' && (
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                  <span className="text-[11px] text-muted-foreground">
                    {t?.confidence ?? 'Confidence'}:
                  </span>
                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden max-w-[120px]">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.round((message?.confidence ?? 0) * 100)}%` }}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-primary">
                    {Math.round((message?.confidence ?? 0) * 100)}%
                  </span>
                </div>
              )}

              {message?.references && (
                <div className="flex items-start gap-2">
                  <BookOpen className="w-3.5 h-3.5 text-accent flex-shrink-0 mt-0.5" />
                  <span className="text-[11px] text-muted-foreground">
                    {t?.references ?? 'References'}: {message?.references ?? ''}
                  </span>
                </div>
              )}

              <p className="text-[10px] text-muted-foreground/60 italic">
                {t?.consultDoctor ?? ''}
              </p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  )
}

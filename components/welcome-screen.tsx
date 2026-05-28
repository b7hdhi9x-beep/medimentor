'use client'

import { useState } from 'react'
import { Language, getTranslation } from '@/lib/i18n'
import { Heart, Stethoscope, Brain, Bone, Baby, Pill, Apple, Sparkles, Eye, Ear, Droplets, Flower2, HeartPulse, Zap, Scissors, SmilePlus, LogIn } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface WelcomeScreenProps {
  language: Language
  onStart: (name: string) => void
}

export function WelcomeScreen({ language, onStart }: WelcomeScreenProps) {
  const { status } = useSession()
  const router = useRouter()
  const isLoggedIn = status === 'authenticated'
  const [name, setName] = useState('')
  const t = getTranslation(language)

  const specialties = [
    { icon: Brain, label: t?.specialty?.mental_health ?? '', color: 'from-purple-100 to-purple-50 text-purple-600' },
    { icon: Stethoscope, label: t?.specialty?.internal_medicine ?? '', color: 'from-blue-100 to-blue-50 text-blue-600' },
    { icon: Bone, label: t?.specialty?.orthopedics ?? '', color: 'from-teal-100 to-teal-50 text-teal-600' },
    { icon: Baby, label: t?.specialty?.pediatrics ?? '', color: 'from-pink-100 to-pink-50 text-pink-600' },
    { icon: Pill, label: t?.specialty?.pharmacy ?? '', color: 'from-indigo-100 to-indigo-50 text-indigo-600' },
    { icon: Apple, label: t?.specialty?.nutrition ?? '', color: 'from-orange-100 to-orange-50 text-orange-600' },
    { icon: Flower2, label: t?.specialty?.dermatology ?? '', color: 'from-rose-100 to-rose-50 text-rose-600' },
    { icon: Eye, label: t?.specialty?.ophthalmology ?? '', color: 'from-sky-100 to-sky-50 text-sky-600' },
    { icon: Ear, label: t?.specialty?.ent ?? '', color: 'from-amber-100 to-amber-50 text-amber-600' },
    { icon: Droplets, label: t?.specialty?.urology ?? '', color: 'from-cyan-100 to-cyan-50 text-cyan-600' },
    { icon: Heart, label: t?.specialty?.gynecology ?? '', color: 'from-fuchsia-100 to-fuchsia-50 text-fuchsia-600' },
    { icon: HeartPulse, label: t?.specialty?.cardiology ?? '', color: 'from-red-100 to-red-50 text-red-600' },
    { icon: Zap, label: t?.specialty?.neurology ?? '', color: 'from-violet-100 to-violet-50 text-violet-600' },
    { icon: Scissors, label: t?.specialty?.surgery ?? '', color: 'from-emerald-100 to-emerald-50 text-emerald-600' },
    { icon: SmilePlus, label: t?.specialty?.dentistry ?? '', color: 'from-slate-100 to-blue-50 text-slate-600' },
  ]

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-4 py-8">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="text-center mb-8"
      >
        <div className="relative inline-block mb-4">
          <div className="w-24 h-24 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-green-100 to-blue-100 mx-auto animate-float">
            <img
              src="https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png"
              alt={t?.characterName ?? 'Pipi'}
              className="w-full h-full object-cover"
            />
          </div>
          <Sparkles className="absolute -top-1 -right-1 w-6 h-6 text-yellow-400 animate-pulse" />
        </div>

        <h1 className="text-4xl font-bold tracking-tight font-display mb-2">
          <span className="text-primary">Medi</span><span className="text-foreground">Mentor</span>
        </h1>
        <p className="text-sm text-muted-foreground mb-1">{t?.subtitle ?? ''}</p>
        <p className="text-xs text-muted-foreground/70 max-w-sm mx-auto">
          {language === 'ja'
            ? '医療の入り口を、もっと優しく、もっと正しく。'
            : language === 'es'
            ? 'Haciendo la salud m\u00e1s accesible y precisa.'
            : language === 'zh'
            ? '\u8ba9\u5065\u5eb7\u54a8\u8be2\u66f4\u7b80\u5355\u3001\u66f4\u51c6\u786e\u3002'
            : language === 'ko'
            ? '\uac74\uac15 \uc815\ubcf4\ub97c \ub354 \uc27d\uace0 \uc815\ud655\ud558\uac8c.'
            : 'Making healthcare more approachable and accurate.'}
        </p>
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
        className="grid grid-cols-3 sm:grid-cols-5 gap-2 mb-8 max-w-lg w-full"
      >
        {(specialties ?? []).map((spec: any, i: number) => {
          const Icon = spec?.icon ?? Heart
          return (
            <motion.div
              key={i}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.3 + i * 0.05 }}
              className={`flex flex-col items-center gap-1 py-3 px-2 rounded-xl bg-gradient-to-b ${spec?.color ?? ''} shadow-sm`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] font-medium text-center leading-tight">{spec?.label ?? ''}</span>
            </motion.div>
          )
        })}
      </motion.div>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="w-full max-w-sm space-y-3"
      >
        <div className="relative">
          <input
            type="text"
            value={name}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e?.target?.value ?? '')}
            placeholder={t?.namePrompt ?? ''}
            className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 backdrop-blur-sm text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm transition-all placeholder:text-muted-foreground/50"
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e?.key === 'Enter') {
                onStart?.(name)
              }
            }}
          />
        </div>
        <button
          onClick={() => onStart?.(name)}
          className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          <Heart className="w-4 h-4 inline-block mr-1.5 -mt-0.5" />
          {t?.nameSubmit ?? 'Start'}
        </button>
        <button
          onClick={() => onStart?.('')}
          className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {t?.skipName ?? 'Skip'}
        </button>

        {!isLoggedIn && status !== 'loading' && (
          <div className="pt-3 border-t border-border/30 mt-1">
            <p className="text-[11px] text-muted-foreground/70 text-center mb-2">
              {(t as any)?.loginRequired ?? 'Login to save your chat history'}
            </p>
            <button
              onClick={() => router.push('/login')}
              className="w-full py-2.5 rounded-xl border border-primary/30 bg-primary/5 hover:bg-primary/10 text-primary font-medium text-sm transition-all flex items-center justify-center gap-2"
            >
              <LogIn className="w-4 h-4" />
              {(t as any)?.login ?? 'Login'} / {(t as any)?.signup ?? 'Sign Up'}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Language, getTranslation } from '@/lib/i18n'
import { Heart, Sparkles, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'
import dynamic from 'next/dynamic'
import { LanguageSelector } from '@/components/language-selector'

function LoginPageInner() {
  const [isSignup, setIsSignup] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [language, setLanguage] = useState<Language>('ja')
  const router = useRouter()
  const { status } = useSession()

  const t = getTranslation(language)

  useEffect(() => {
    try {
      const savedLang = localStorage?.getItem?.('medimentor-lang')
      if (savedLang === 'en' || savedLang === 'ja') setLanguage(savedLang)
    } catch {}
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/')
    }
  }, [status, router])

  const changeLanguage = (newLang: Language) => {
    setLanguage(newLang)
    try { localStorage?.setItem?.('medimentor-lang', newLang) } catch {}
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (isSignup) {
        const res = await fetch('/api/signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password, name: name || undefined }),
        })
        const data = await res.json()
        if (!res.ok) {
          setError(data?.error || (t as any)?.signupError || '')
          setLoading(false)
          return
        }
        // Auto-login after signup
        const result = await signIn('credentials', {
          email, password, redirect: false,
        })
        if (result?.ok) {
          router.replace('/')
        } else {
          setError((t as any)?.loginError || '')
        }
      } else {
        const result = await signIn('credentials', {
          email, password, redirect: false,
        })
        if (result?.ok) {
          router.replace('/')
        } else {
          setError((t as any)?.loginError || '')
        }
      }
    } catch {
      setError(isSignup ? ((t as any)?.signupError || '') : ((t as any)?.loginError || ''))
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30 flex flex-col">
      {/* Language selector */}
      <div className="flex justify-end p-4">
        <LanguageSelector language={language} onChangeLanguage={changeLanguage} />
      </div>

      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full max-w-sm"
        >
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="relative inline-block mb-3">
              <div className="w-20 h-20 rounded-full overflow-hidden shadow-lg bg-gradient-to-br from-green-100 to-blue-100 mx-auto">
                <img
                  src="https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png"
                  alt="Pipi"
                  className="w-full h-full object-cover"
                />
              </div>
              <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-400 animate-pulse" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-primary">Medi</span><span>Mentor</span>
            </h1>
            <p className="text-xs text-muted-foreground mt-1">{(t as any)?.subtitle || ''}</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <h2 className="text-lg font-semibold text-center">
              {isSignup ? (t as any)?.signup : (t as any)?.login}
            </h2>

            {error && (
              <div className="bg-red-50 text-red-600 text-xs p-3 rounded-xl border border-red-200">
                {error}
              </div>
            )}

            {isSignup && (
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={(t as any)?.namePrompt || ''}
                className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm"
              />
            )}

            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={(t as any)?.email || ''}
              required
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm"
            />

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={(t as any)?.password || ''}
              required
              minLength={6}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white/80 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm"
            />

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:shadow-lg hover:bg-primary/90 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Heart className="w-4 h-4" />}
              {isSignup ? (t as any)?.signupButton : (t as any)?.loginButton}
            </button>

            <button
              type="button"
              onClick={() => { setIsSignup(!isSignup); setError('') }}
              className="w-full py-2 text-xs text-primary hover:text-primary/80 transition-colors"
            >
              {isSignup ? (t as any)?.switchToLogin : (t as any)?.switchToSignup}
            </button>

            <div className="relative py-2">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border/50" />
              </div>
              <div className="relative flex justify-center text-[10px]">
                <span className="bg-gradient-to-b from-blue-50/50 via-white to-green-50/30 px-3 text-muted-foreground">or</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => router.replace('/')}
              className="w-full py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              {(t as any)?.continueAsGuest || 'Continue as Guest'}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  )
}

const LoginPageDynamic = dynamic(
  () => Promise.resolve(LoginPageInner),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-blue-50/50 via-white to-green-50/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    ),
  }
)

export default function LoginPage() {
  return <LoginPageDynamic />
}
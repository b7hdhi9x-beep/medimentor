'use client'

import { Language, getTranslation } from '@/lib/i18n'
import { MessageSquarePlus, Heart, Clock, LogOut, LogIn, User, Activity, Building2 } from 'lucide-react'
import { motion } from 'framer-motion'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LanguageSelector } from './language-selector'

interface HeaderProps {
  language: Language
  onChangeLanguage: (lang: Language) => void
  onNewChat: () => void
  onToggleHistory?: () => void
  hasMessages: boolean
}

export function Header({ language, onChangeLanguage, onNewChat, onToggleHistory, hasMessages }: HeaderProps) {
  const t = getTranslation(language)
  const { data: session, status } = useSession()
  const router = useRouter()
  const isLoggedIn = status === 'authenticated'

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-border/50 shadow-sm"
    >
      <div className="max-w-4xl mx-auto px-3 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {isLoggedIn && (
            <button
              onClick={onToggleHistory}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              title={(t as any)?.chatHistory || 'Chat History'}
            >
              <Clock className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gradient-to-br from-green-200 to-blue-200 flex items-center justify-center shadow-md">
            <Heart className="w-4 h-4 text-primary fill-primary/40" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight font-display text-foreground flex items-center gap-1">
              <span className="text-primary">Medi</span><span>Mentor</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {/* Health History link */}
          {isLoggedIn && (
            <button
              onClick={() => router.push('/health')}
              className="p-1.5 rounded-full hover:bg-muted transition-colors"
              title={(t as any)?.healthHistory || 'Health History'}
            >
              <Activity className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {/* Hospitals link */}
          <button
            onClick={() => router.push('/hospitals')}
            className="p-1.5 rounded-full hover:bg-muted transition-colors"
            title={(t as any)?.hospitals || 'Find Hospitals'}
          >
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </button>

          {hasMessages && (
            <button
              onClick={onNewChat}
              className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground transition-all shadow-sm"
            >
              <MessageSquarePlus className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{(t as any)?.newChat ?? 'New'}</span>
            </button>
          )}

          <LanguageSelector language={language} onChangeLanguage={onChangeLanguage} />

          {status !== 'loading' && (
            isLoggedIn ? (
              <div className="flex items-center gap-1">
                <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center" title={session?.user?.email || ''}>
                  <User className="w-3.5 h-3.5 text-primary" />
                </div>
                <button
                  onClick={() => signOut({ redirect: false })}
                  className="p-1.5 rounded-full hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors"
                  title={(t as any)?.logout || 'Logout'}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => router.push('/login')}
                className="flex items-center gap-1 px-2 py-1.5 text-xs font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{(t as any)?.login ?? 'Login'}</span>
              </button>
            )
          )}
        </div>
      </div>
    </motion.header>
  )
}

'use client'

import { useState, useEffect, useCallback } from 'react'
import { Language, getTranslation } from '@/lib/i18n'
import { X, MessageSquare, Clock, Loader2, Trash2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface ChatSessionItem {
  id: string
  title: string
  messageCount: number
  updatedAt: string
  language: string
}

interface ChatHistorySidebarProps {
  isOpen: boolean
  onClose: () => void
  language: Language
  onSelectSession: (sessionId: string) => void
  onDeleteSession?: (sessionId: string) => void
  currentSessionId: string | null
}

export function ChatHistorySidebar({ isOpen, onClose, language, onSelectSession, onDeleteSession, currentSessionId }: ChatHistorySidebarProps) {
  const [sessions, setSessions] = useState<ChatSessionItem[]>([])
  const [loading, setLoading] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const t = getTranslation(language)

  const handleDelete = useCallback(async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation()
    const confirmMsg = language === 'ja' ? 'この会話を削除しますか？' : 'Delete this conversation?'
    if (!window.confirm(confirmMsg)) return

    setDeletingId(sessionId)
    try {
      const res = await fetch(`/api/sessions/${sessionId}`, { method: 'DELETE' })
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId))
        onDeleteSession?.(sessionId)
      }
    } catch (err) {
      console.error('Failed to delete session:', err)
    } finally {
      setDeletingId(null)
    }
  }, [language, onDeleteSession])

  const fetchSessions = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sessions')
      if (res.ok) {
        const data = await res.json()
        setSessions(data?.sessions ?? [])
      }
    } catch (err) {
      console.error('Failed to fetch sessions:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isOpen) {
      fetchSessions()
    }
  }, [isOpen, fetchSessions])

  const formatDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr)
      const now = new Date()
      const diffMs = now.getTime() - d.getTime()
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
      if (diffDays === 0) {
        return language === 'ja' ? '今日' : 'Today'
      } else if (diffDays === 1) {
        return language === 'ja' ? '昨日' : 'Yesterday'
      } else if (diffDays < 7) {
        return language === 'ja' ? `${diffDays}日前` : `${diffDays}d ago`
      } else {
        return d.toLocaleDateString(language === 'ja' ? 'ja-JP' : 'en-US', { month: 'short', day: 'numeric' })
      }
    } catch {
      return ''
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-white shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-border/50">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <h2 className="text-sm font-semibold">{(t as any)?.chatHistory || 'Chat History'}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Session list */}
            <div className="flex-1 overflow-y-auto px-2 py-2">
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : sessions.length === 0 ? (
                <div className="text-center py-12 text-sm text-muted-foreground">
                  <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-30" />
                  <p>{(t as any)?.noChatHistory || 'No chat history yet'}</p>
                </div>
              ) : (
                <div className="space-y-1">
                  {sessions.map((session) => (
                    <div
                      key={session.id}
                      className={`relative group flex items-center rounded-xl transition-all hover:bg-primary/5 ${
                        currentSessionId === session.id ? 'bg-primary/10 border border-primary/20' : ''
                      }`}
                    >
                      <button
                        onClick={() => {
                          onSelectSession(session.id)
                          onClose()
                        }}
                        className="flex-1 text-left px-3 py-3 min-w-0"
                      >
                        <div className="flex items-start gap-2">
                          <MessageSquare className="w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0 group-hover:text-primary" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate text-foreground/90">
                              {session.title || 'New conversation'}
                            </p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-muted-foreground">
                                {formatDate(session.updatedAt)}
                              </span>
                              <span className="text-[10px] text-muted-foreground">
                                {session.messageCount} {language === 'ja' ? 'メッセージ' : 'messages'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, session.id)}
                        disabled={deletingId === session.id}
                        className="p-2 mr-1 rounded-lg opacity-100 sm:opacity-0 sm:group-hover:opacity-100 hover:bg-red-100 text-muted-foreground hover:text-red-500 transition-all flex-shrink-0"
                        title={language === 'ja' ? '削除' : 'Delete'}
                      >
                        {deletingId === session.id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

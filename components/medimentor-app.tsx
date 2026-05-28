'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { Language, getTranslation } from '@/lib/i18n'
import { Header } from './header'
import { ChatMessage } from './chat-message'
import { ChatInput } from './chat-input'
import { WelcomeScreen } from './welcome-screen'
import { DisclaimerBar } from './disclaimer-bar'
import { EmergencyBanner } from './emergency-banner'
import { ThinkingIndicator } from './thinking-indicator'
import { ChatHistorySidebar } from './chat-history-sidebar'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquarePlus } from 'lucide-react'
import { useSession } from 'next-auth/react'

export interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  translation?: string
  specialty?: string
  confidence?: number
  references?: string
  isEmergency?: boolean
  isStreaming?: boolean
}

export function MediMentorApp() {
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [language, setLanguage] = useState<Language>('ja')
  const [messages, setMessages] = useState<Message[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [userName, setUserName] = useState<string>('')
  const [hasStarted, setHasStarted] = useState(false)
  const [showEmergency, setShowEmergency] = useState(false)
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const t = getTranslation(language)

  useEffect(() => {
    try {
      const savedLang = localStorage?.getItem?.('medimentor-lang')
      if (savedLang === 'en' || savedLang === 'ja' || savedLang === 'es' || savedLang === 'zh' || savedLang === 'ko') {
        setLanguage(savedLang)
      }
      const savedName = localStorage?.getItem?.('medimentor-name')
      if (savedName) {
        setUserName(savedName)
      }
    } catch {
      // localStorage not available
    }
  }, [])

  // Sync userName from session when logged in
  useEffect(() => {
    if (isLoggedIn && session?.user?.name) {
      setUserName(session.user.name)
    }
  }, [isLoggedIn, session?.user?.name])

  const scrollToBottom = useCallback(() => {
    messagesEndRef?.current?.scrollIntoView?.({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, isLoading, scrollToBottom])

  const changeLanguage = useCallback((newLang: Language) => {
    setLanguage(newLang)
    try {
      localStorage?.setItem?.('medimentor-lang', newLang)
    } catch {
      // ignore
    }
  }, [])

  const startChat = useCallback((name: string) => {
    setUserName(name)
    setHasStarted(true)
    try {
      if (name) {
        localStorage?.setItem?.('medimentor-name', name)
      }
    } catch {
      // ignore
    }
  }, [])

  const newChat = useCallback(() => {
    setMessages([])
    setSessionId(null)
    setShowEmergency(false)
    setHasStarted(false)
    setSidebarOpen(false)
  }, [])

  const loadSession = useCallback(async (targetSessionId: string) => {
    try {
      const res = await fetch(`/api/sessions/${targetSessionId}`)
      if (!res?.ok) return
      const data = await res.json()
      const loadedMessages: Message[] = (data?.messages ?? []).map((m: any, i: number) => ({
        id: `${m?.role ?? 'msg'}-loaded-${i}`,
        role: m?.role === 'user' ? 'user' : 'assistant',
        content: m?.content ?? '',
        specialty: m?.metadata?.specialty,
        confidence: m?.metadata?.confidence,
        references: m?.metadata?.references,
        isEmergency: m?.metadata?.isEmergency === true,
        isStreaming: false,
      }))
      setMessages(loadedMessages)
      setSessionId(targetSessionId)
      setHasStarted(true)
      setShowEmergency(loadedMessages.some((m: Message) => m.isEmergency))
      setSidebarOpen(false)
    } catch (err) {
      console.error('Failed to load session:', err)
    }
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarOpen((prev) => !prev)
  }, [])

  const sendMessage = useCallback(async (content: string) => {
    if (!content?.trim() || isLoading) return

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: content.trim(),
    }
    setMessages((prev: Message[]) => [...(prev ?? []), userMsg])
    setIsLoading(true)

    const assistantId = `assistant-${Date.now()}`
    setMessages((prev: Message[]) => [...(prev ?? []), {
      id: assistantId,
      role: 'assistant',
      content: '',
      isStreaming: true,
    }])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content.trim(),
          sessionId,
          language,
          userName: userName || undefined,
        }),
      })

      if (!response?.ok) {
        throw new Error('API request failed')
      }

      const reader = response?.body?.getReader()
      if (!reader) throw new Error('No reader available')

      const decoder = new TextDecoder()
      let partialRead = ''

      while (true) {
        const result = await reader?.read()
        if (!result || result?.done) break
        partialRead += decoder.decode(result?.value, { stream: true })
        let lines = partialRead.split('\n')
        partialRead = lines?.pop() ?? ''

        for (const line of (lines ?? [])) {
          if (line?.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (parsed?.status === 'processing') {
                // Show streaming text - try to extract partial message from JSON buffer
                const partialText = parsed?.message ?? ''
                let displayText = partialText
                // Try to extract message field from partial JSON
                try {
                  const partialJson = JSON.parse(partialText)
                  if (partialJson?.message) {
                    displayText = partialJson.message
                  }
                } catch {
                  // Not valid JSON yet, try regex
                  const match = partialText?.match?.(/"message"\s*:\s*"((?:[^"\\]|\\.)*)/)
                  if (match?.[1]) {
                    displayText = match[1].replace(/\\n/g, '\n').replace(/\\"/g, '"')
                  } else {
                    displayText = ''
                  }
                }

                setMessages((prev: Message[]) =>
                  (prev ?? []).map((m: Message) =>
                    m?.id === assistantId
                      ? { ...(m ?? {}), content: displayText, isStreaming: true }
                      : m
                  )
                )
              } else if (parsed?.status === 'completed') {
                const result = parsed?.result ?? {}
                setMessages((prev: Message[]) =>
                  (prev ?? []).map((m: Message) =>
                    m?.id === assistantId
                      ? {
                          ...(m ?? {}),
                          content: result?.message ?? '',
                          translation: result?.translation || '',
                          specialty: result?.specialty ?? 'general',
                          confidence: result?.confidence ?? 0.7,
                          references: result?.references ?? '',
                          isEmergency: result?.isEmergency === true,
                          isStreaming: false,
                        }
                      : m
                  )
                )
                if (result?.sessionId) {
                  setSessionId(result.sessionId)
                }
                if (result?.isEmergency === true) {
                  setShowEmergency(true)
                }
              } else if (parsed?.status === 'error') {
                throw new Error(parsed?.message ?? 'Generation failed')
              }
            } catch (parseErr: any) {
              // Skip invalid JSON
            }
          }
        }
      }
    } catch (error: any) {
      console.error('Send message error:', error)
      setMessages((prev: Message[]) =>
        (prev ?? []).map((m: Message) =>
          m?.id === assistantId
            ? { ...(m ?? {}), content: t?.errorMessage ?? 'Error occurred', isStreaming: false }
            : m
        )
      )
    } finally {
      setIsLoading(false)
    }
  }, [isLoading, sessionId, language, userName, t])

  return (
    <div className="flex flex-col h-screen max-h-screen overflow-hidden bg-gradient-to-b from-blue-50/50 via-background to-green-50/30">
      <Header
        language={language}
        onChangeLanguage={changeLanguage}
        onNewChat={newChat}
        onToggleHistory={isLoggedIn ? toggleSidebar : undefined}
        hasMessages={(messages?.length ?? 0) > 0}
      />

      <ChatHistorySidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        language={language}
        onSelectSession={loadSession}
        onDeleteSession={(deletedId) => {
          if (deletedId === sessionId) {
            setMessages([])
            setSessionId(null)
            setShowEmergency(false)
            setHasStarted(false)
          }
        }}
        currentSessionId={sessionId}
      />

      <AnimatePresence mode="wait">
        {!hasStarted ? (
          <motion.div
            key="welcome"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 overflow-y-auto"
          >
            <WelcomeScreen
              language={language}
              onStart={startChat}
            />
          </motion.div>
        ) : (
          <motion.div
            key="chat"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col overflow-hidden"
          >
            {showEmergency && (
              <EmergencyBanner language={language} />
            )}

            <div className="flex-1 overflow-y-auto px-4 py-6">
              <div className="max-w-3xl mx-auto space-y-4">
                {/* Welcome message */}
                {(messages?.length ?? 0) === 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 shadow-md bg-gradient-to-br from-green-100 to-blue-100">
                      <img
                        src="https://cdn.abacus.ai/images/fdc6adb3-7d74-4c98-8b78-7cab6aa39f03.png"
                        alt={`${t?.characterName ?? 'Pipi'} - Health Fairy Mascot`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm rounded-2xl rounded-tl-md px-4 py-3 shadow-sm max-w-[85%]">
                      <p className="text-sm font-medium text-primary mb-1">{t?.characterName ?? 'Pipi'}</p>
                      <p className="text-sm text-foreground/80 whitespace-pre-line">
                        {t?.welcome?.replace?.(/\\n/g, '\n') ?? ''}
                      </p>
                    </div>
                  </motion.div>
                )}

                {(messages ?? []).map((msg: Message, index: number) => (
                  <ChatMessage
                    key={msg?.id ?? index}
                    message={msg}
                    language={language}
                  />
                ))}

                {isLoading && (messages ?? []).every((m: Message) => !m?.isStreaming || !m?.content) && (
                  <ThinkingIndicator language={language} />
                )}

                <div ref={messagesEndRef} />
              </div>
            </div>

            <ChatInput
              language={language}
              onSend={sendMessage}
              isLoading={isLoading}
            />

            <DisclaimerBar language={language} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

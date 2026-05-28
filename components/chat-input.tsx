'use client'

import { useState, useRef } from 'react'
import { Language, getTranslation } from '@/lib/i18n'
import { Send, Loader2 } from 'lucide-react'
import { VoiceInputButton } from './voice-input-button'

interface ChatInputProps {
  language: Language
  onSend: (message: string) => void
  isLoading: boolean
}

export function ChatInput({ language, onSend, isLoading }: ChatInputProps) {
  const [input, setInput] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const t = getTranslation(language)

  const handleSend = () => {
    if (!input?.trim() || isLoading) return
    onSend?.(input.trim())
    setInput('')
    if (textareaRef?.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e?.target?.value ?? '')
    const target = e?.target
    if (target) {
      target.style.height = 'auto'
      target.style.height = `${Math.min(target?.scrollHeight ?? 40, 120)}px`
    }
  }

  const handleVoiceTranscript = (text: string) => {
    setInput(prev => prev ? `${prev} ${text}` : text)
  }

  return (
    <div className="border-t border-border/50 bg-white/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-3xl mx-auto flex items-end gap-2">
        <VoiceInputButton
          language={language}
          onTranscript={handleVoiceTranscript}
          disabled={isLoading}
        />
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={(e: React.KeyboardEvent) => {
              if (e?.key === 'Enter' && !e?.shiftKey) {
                e?.preventDefault?.()
                handleSend()
              }
            }}
            placeholder={t?.inputPlaceholder ?? ''}
            rows={1}
            className="w-full resize-none px-4 py-2.5 rounded-xl border border-border bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 shadow-sm transition-all placeholder:text-muted-foreground/50"
            disabled={isLoading}
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!input?.trim() || isLoading}
          className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-md hover:shadow-lg hover:bg-primary/90 transition-all disabled:opacity-40 disabled:hover:shadow-md active:scale-95"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>
    </div>
  )
}

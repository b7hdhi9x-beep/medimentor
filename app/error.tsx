'use client'

import { useEffect } from 'react'
import { Heart, RefreshCw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Application error:', error)
    // Auto-reload on chunk loading errors (stale cache from previous deploy)
    const msg = error?.message ?? ''
    if (msg.includes('Loading chunk') || msg.includes('Loading CSS chunk') || msg.includes('Failed to fetch dynamically imported module')) {
      window.location.reload()
      return
    }
    // Report error to server for debugging
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message ?? 'Unknown error',
          stack: error?.stack ?? '',
          userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
          url: typeof window !== 'undefined' ? window.location.href : '',
        }),
      }).catch(() => {})
    } catch {}
  }, [error])

  const handleReset = () => {
    // Clear any stale caches
    try {
      if ('caches' in window) {
        caches.keys().then((names) => {
          names.forEach((name) => caches.delete(name))
        })
      }
    } catch {}
    reset()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50/50 via-white to-green-50/30 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-100 to-blue-100 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Heart className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-lg font-bold mb-2">エラーが発生しました</h2>
        <p className="text-sm text-muted-foreground mb-2">
          ページの読み込みに問題がありました。<br />下のボタンで再読み込みしてください。
        </p>
        <details className="text-left mb-4 p-2 bg-gray-100 rounded-lg">
          <summary className="text-xs text-muted-foreground cursor-pointer">エラー詳細</summary>
          <pre className="text-[10px] text-red-600 mt-1 whitespace-pre-wrap break-all max-h-40 overflow-auto">
            {error?.message ?? 'Unknown'}{'\n'}{error?.stack ?? ''}
          </pre>
        </details>
        <div className="flex flex-col gap-3">
          <button
            onClick={handleReset}
            className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-medium text-sm shadow-md hover:bg-primary/90 transition-all mx-auto"
          >
            <RefreshCw className="w-4 h-4" />
            再読み込み
          </button>
          <button
            onClick={() => {
              try { document.cookie.split(';').forEach(c => { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/') }) } catch {}
              window.location.href = '/'
            }}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            それでも直らない場合はこちら
          </button>
        </div>
      </div>
    </div>
  )
}

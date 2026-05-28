'use client'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  if (typeof window !== 'undefined') {
    try {
      fetch('/api/client-error', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: error?.message ?? 'Unknown global error',
          stack: error?.stack ?? '',
          userAgent: navigator?.userAgent ?? '',
          url: window?.location?.href ?? '',
          isGlobal: true,
        }),
      }).catch(() => {})
    } catch {}
  }
  return (
    <html>
      <body style={{ fontFamily: 'sans-serif', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', margin: 0, background: '#f8fafc' }}>
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>エラーが発生しました</h2>
          <p style={{ fontSize: '0.875rem', color: '#6b7280', marginBottom: '0.5rem' }}>ページの読み込みに問題がありました。</p>
          <pre style={{ fontSize: '0.625rem', color: '#dc2626', background: '#f1f5f9', padding: '0.5rem', borderRadius: '0.5rem', textAlign: 'left', whiteSpace: 'pre-wrap', wordBreak: 'break-all', maxHeight: '10rem', overflow: 'auto', marginBottom: '1rem' }}>
            {error?.message ?? 'Unknown'}{'\n'}{error?.stack ?? ''}
          </pre>
          <button
            onClick={() => {
              try { document.cookie.split(';').forEach(c => { document.cookie = c.replace(/^ +/, '').replace(/=.*/, '=;expires=' + new Date().toUTCString() + ';path=/') }) } catch {}
              window.location.href = '/'
            }}
            style={{ padding: '0.75rem 1.5rem', background: '#16a34a', color: 'white', border: 'none', borderRadius: '0.75rem', cursor: 'pointer', fontSize: '0.875rem', fontWeight: 500 }}
          >
            再読み込み
          </button>
        </div>
      </body>
    </html>
  )
}

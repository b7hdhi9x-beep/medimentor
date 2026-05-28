'use client'

import { SessionProvider } from 'next-auth/react'
import { Component, ErrorInfo, ReactNode } from 'react'

class AuthErrorBoundary extends Component<
  { children: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[AuthErrorBoundary]', error?.message, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return <>{this.props.children}</>
    }
    return this.props.children
  }
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <AuthErrorBoundary>
      <SessionProvider refetchInterval={0} refetchOnWindowFocus={false}>
        {children}
      </SessionProvider>
    </AuthErrorBoundary>
  )
}

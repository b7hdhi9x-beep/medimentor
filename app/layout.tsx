import { Nunito } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Providers } from '@/components/providers'

const nunito = Nunito({ subsets: ['latin'], variable: '--font-sans' })

export const dynamic = "force-dynamic"

export async function generateMetadata() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://medimentor-nextjs-vxz5vm.abacusai.app'
  return {
    metadataBase: new URL(baseUrl),
    title: 'MediMentor - \u5065\u5eb7\u76f8\u8ac7AI\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8',
    description: 'MediMentor - \u533b\u7642\u306e\u5165\u308a\u53e3\u3092\u3001\u3082\u3063\u3068\u512a\u3057\u304f\u3001\u3082\u3063\u3068\u6b63\u3057\u304f\u3002\u5065\u5eb7\u30b5\u30dd\u30fc\u30c8\u5996\u7cbe\u30d4\u30d4\u304c\u3042\u306a\u305f\u306e\u5065\u5eb7\u306e\u60a9\u307f\u306b\u5bfe\u5fdc\u3057\u307e\u3059\u3002',
    icons: {
      icon: '/favicon.svg',
      shortcut: '/favicon.svg',
    },
    openGraph: {
      title: 'MediMentor - \u5065\u5eb7\u76f8\u8ac7AI\u30a2\u30b7\u30b9\u30bf\u30f3\u30c8',
      description: '\u5065\u5eb7\u30b5\u30dd\u30fc\u30c8\u5996\u7cbe\u30d4\u30d4\u304c\u3042\u306a\u305f\u306e\u5065\u5eb7\u306e\u60a9\u307f\u306b\u512a\u3057\u304f\u5bfe\u5fdc\u3057\u307e\u3059',
      images: [{ url: '/og-image.png' }],
    },
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" suppressHydrationWarning>
      <head>
        <script src="https://apps.abacus.ai/chatllm/appllm-lib.js"></script>
        <script src="/chunk-retry.js"></script>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#16a34a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="MediMentor" />
      </head>
      <body className={`${nunito.variable} font-sans bg-background text-foreground`} suppressHydrationWarning>
        <Providers>
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  )
}

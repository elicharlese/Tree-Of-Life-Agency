import type { Metadata, Viewport } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'
import { AuthProvider } from './contexts/AuthContext'
import { ConditionalFooter } from '../components/ConditionalFooter'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-heading',
})

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'Tree of Life Agency',
  description: 'Professional services marketplace built on blockchain technology',
  keywords: ['services', 'marketplace', 'blockchain', 'solana', 'professional'],
  authors: [{ name: 'Tree of Life Agency' }],
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: '32x32' }
    ],
    apple: '/apple-touch-icon.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="alternate icon" href="/favicon.ico" />
      </head>
      <body className={`${inter.variable} ${playfair.variable} h-full antialiased`}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <main className="flex-1">{children}</main>
            <ConditionalFooter />
          </div>
        </AuthProvider>
      </body>
    </html>
  )
}

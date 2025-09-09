import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import ThirdWebProvider from '@/components/providers/ThirdWebProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Tree of Life Agency',
  description: 'Professional Development Services',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ThirdWebProvider>
          {children}
          <Toaster position="top-right" />
        </ThirdWebProvider>
      </body>
    </html>
  )
}

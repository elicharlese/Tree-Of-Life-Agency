import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tree of Life Agency - Development Platform',
  description: 'Internal development collaboration platform for Tree of Life agency members',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-dark-900 text-white">
        {children}
      </body>
    </html>
  )
}

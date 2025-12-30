'use client'

import { usePathname } from 'next/navigation'

import { ThinFooter } from './ThinFooter'

function shouldHideFooter(pathname: string): boolean {
  if (pathname === '/') return true
  if (pathname === '/app' || pathname.startsWith('/app/')) return true
  if (pathname === '/admin' || pathname.startsWith('/admin/')) return true
  return false
}

export function ConditionalFooter() {
  const pathname = usePathname() ?? ''

  if (shouldHideFooter(pathname)) return null

  return <ThinFooter />
}

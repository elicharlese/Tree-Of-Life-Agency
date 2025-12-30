'use client'

import Image from 'next/image'
import Link from 'next/link'

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showText?: boolean
  href?: string
  className?: string
  textClassName?: string
}

const sizeMap = {
  sm: { width: 32, height: 32, text: 'text-lg' },
  md: { width: 48, height: 48, text: 'text-xl' },
  lg: { width: 64, height: 64, text: 'text-2xl' },
  xl: { width: 96, height: 96, text: 'text-3xl' }
}

export function Logo({
  size = 'md',
  showText = true,
  href = '/',
  className = '',
  textClassName = 'text-bark-900'
}: LogoProps) {
  const { width, height, text } = sizeMap[size]

  const content = (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className="relative flex-shrink-0">
        <Image
          src="/logo.svg"
          alt="Tree of Life Agency Logo"
          width={width}
          height={height}
          priority
          className="object-contain"
        />
      </div>
      {showText && (
        <span className={`font-serif tracking-[0.08em] ${text} ${textClassName}`}>
          Tree of Life Agency
        </span>
      )}
    </div>
  )

  if (href) {
    return (
      <Link href={href} className="hover:opacity-80 transition-opacity">
        {content}
      </Link>
    )
  }

  return content
}

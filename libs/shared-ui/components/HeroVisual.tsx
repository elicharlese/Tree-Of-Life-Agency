'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { TreePine, Users, Code, Smartphone, Palette, Server } from 'feather-icons-react'

const services = [
  { icon: Code, label: 'Frontend', color: 'text-leaf-600', delay: 0.1, href: '/services/frontend' },
  { icon: Server, label: 'Backend', color: 'text-bark-700', delay: 0.2, href: '/services/backend' },
  { icon: Smartphone, label: 'Mobile', color: 'text-wisdom-600', delay: 0.3, href: '/services/mobile' },
  { icon: Palette, label: 'Design', color: 'text-root-600', delay: 0.4, href: '/services/design' }
]

export default function HeroVisual() {
  // subtle parallax tilt
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 })

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width // 0..1
    const y = (e.clientY - rect.top) / rect.height // 0..1
    const ry = (x - 0.5) * 8 // rotateY
    const rx = -(y - 0.5) * 8 // rotateX
    setTilt({ rx, ry })
  }

  const handleMouseLeave = () => setTilt({ rx: 0, ry: 0 })

  // Simple spotlight mode: show a single icon with label; last item is tree
  const displayItems = [
    ...services,
    { icon: TreePine, label: 'Family Tree', color: 'text-leaf-600', delay: 0.5, href: '/collective' }
  ] as const

  const [active, setActive] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setActive((i) => (i + 1) % displayItems.length)
    }, 2200)
    return () => clearInterval(id)
  }, [displayItems.length])

  return (
    <div
      className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-leaf-100/30 via-bark-50/30 to-root-100/30 " />
      {/* Soft vignette */}
      <div className="pointer-events-none absolute inset-0 " style={{
        background: 'radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.0) 0%, rgba(20,90,50,0.05) 70%, rgba(20,90,50,0.12) 100%)'
      }} />
      
      {/* Spotlight: single icon + label */}
      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -10, scale: 0.98 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="relative z-10 text-center"
        style={{ transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)` }}
      >
        <Link href={displayItems[active].href} className="inline-flex flex-col items-center group">
          <span className="bg-white/80 backdrop-blur-md  p-6 shadow-organic/50 group-hover:shadow-leaf transition-all duration-300">
            {(() => {
              const Icon = displayItems[active].icon
              return <Icon className={`h-12 w-12 ${displayItems[active].color}`} />
            })()}
          </span>
          <span className="mt-3 text-sm font-semibold text-bark-700">
            {displayItems[active].label}
          </span>
        </Link>
      </motion.div>

      {/* Minimal concentric ring with slow rotation */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex items-center justify-center pointer-events-none"
        animate={{ rotate: [0, 360], scale: [1, 1.02, 1] }}
        transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
      >
        <svg width="380" height="380" viewBox="0 0 380 380" className="opacity-30">
          <defs>
            <radialGradient id="ringGradient" cx="50%" cy="50%" r="50%">
              <stop offset="60%" stopColor="#a7e3a7" stopOpacity="0.0" />
              <stop offset="85%" stopColor="#a7e3a7" stopOpacity="0.6" />
              <stop offset="100%" stopColor="#a7e3a7" stopOpacity="0.0" />
            </radialGradient>
          </defs>
          <circle cx="190" cy="190" r="135" fill="none" stroke="#8fd18f" strokeOpacity="0.25" strokeWidth="1.5" />
          <circle cx="190" cy="190" r="95" fill="none" stroke="#8fd18f" strokeOpacity="0.15" strokeWidth="1" />
          <circle cx="190" cy="190" r="55" fill="none" stroke="#8fd18f" strokeOpacity="0.1" strokeWidth="1" />
        </svg>
      </motion.div>

      {/* Removed floating emoji elements for a cleaner look */}

      {/* Info Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 1.1, ease: 'easeOut' }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 text-center bg-white/60 backdrop-blur-xl  px-5 py-3 shadow-organic border border-white/50"
      >
        <div className="flex items-center justify-center gap-2">
          <span className="inline-flex h-6 w-6 items-center justify-center  bg-leaf-100">
            <Users className="h-4 w-4 text-leaf-700" />
          </span>
          <span className="text-sm font-semibold text-bark-800">Family Network</span>
        </div>
        <p className="mt-1 text-[11px] text-bark-600">Interconnected expertise working together</p>
      </motion.div>
    </div>
  )
}

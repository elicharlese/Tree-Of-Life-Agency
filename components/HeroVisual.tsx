'use client'

import { motion } from 'framer-motion'
import { TreePine, Users, Code, Smartphone, Palette, Server, Cloud, BarChart3 } from 'lucide-react'

const services = [
  { icon: Code, label: 'Frontend', color: 'text-leaf-500', delay: 0.1 },
  { icon: Server, label: 'Backend', color: 'text-bark-600', delay: 0.2 },
  { icon: Smartphone, label: 'Mobile', color: 'text-wisdom-500', delay: 0.3 },
  { icon: Palette, label: 'Design', color: 'text-root-500', delay: 0.4 },
  { icon: Cloud, label: 'DevOps', color: 'text-leaf-600', delay: 0.5 },
  { icon: BarChart3, label: 'Strategy', color: 'text-wisdom-600', delay: 0.6 }
]

export default function HeroVisual() {
  return (
    <div className="relative w-full h-[500px] md:h-[600px] flex items-center justify-center">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-leaf-100/20 via-bark-50/30 to-root-100/20 rounded-organic"></div>
      
      {/* Central Tree */}
      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ duration: 1, delay: 0.2 }}
        className="relative z-10"
      >
        <TreePine className="h-24 w-24 text-leaf-500" />
      </motion.div>

      {/* Orbiting Service Icons */}
      <div className="absolute inset-0 flex items-center justify-center">
        {services.map((service, index) => {
          const Icon = service.icon
          const angle = (index * 60) * (Math.PI / 180) // 60 degrees apart
          const radius = 120
          const x = Math.cos(angle) * radius
          const y = Math.sin(angle) * radius

          return (
            <motion.div
              key={service.label}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: 1, 
                scale: 1,
                x: x,
                y: y
              }}
              transition={{ 
                duration: 0.8, 
                delay: service.delay,
                repeat: Infinity,
                repeatType: "reverse",
                repeatDelay: 2
              }}
              className="absolute"
            >
              <div className="bg-white/90 backdrop-blur-sm rounded-full p-4 shadow-organic hover:shadow-leaf transition-all duration-300 group cursor-pointer">
                <Icon className={`h-8 w-8 ${service.color} group-hover:scale-110 transition-transform`} />
              </div>
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 text-xs font-medium text-bark-600 whitespace-nowrap">
                {service.label}
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Connecting Lines Animation */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 400 400">
        {services.map((_, index) => {
          const angle1 = (index * 60) * (Math.PI / 180)
          const radius = 120
          const centerX = 200
          const centerY = 200
          
          const x1 = centerX + Math.cos(angle1) * radius
          const y1 = centerY + Math.sin(angle1) * radius

          return (
            <motion.line
              key={index}
              x1={centerX}
              y1={centerY}
              x2={x1}
              y2={y1}
              stroke="#8fd18f"
              strokeWidth="2"
              strokeOpacity="0.3"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: 0.5 + index * 0.1 }}
            />
          )
        })}
      </svg>

      {/* Floating Elements */}
      <motion.div
        animate={{ 
          y: [-10, 10, -10],
          rotate: [0, 5, 0, -5, 0]
        }}
        transition={{ 
          duration: 4, 
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute top-16 left-16 text-4xl opacity-20"
      >
        🌱
      </motion.div>
      
      <motion.div
        animate={{ 
          y: [10, -10, 10],
          rotate: [0, -5, 0, 5, 0]
        }}
        transition={{ 
          duration: 3, 
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1
        }}
        className="absolute bottom-16 right-16 text-4xl opacity-20"
      >
        🍃
      </motion.div>

      {/* Info Overlay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center bg-white/10 backdrop-blur-sm rounded-organic p-4 max-w-sm"
      >
        <div className="flex items-center justify-center mb-2">
          <Users className="h-5 w-5 text-leaf-600 mr-2" />
          <span className="text-sm font-medium text-bark-700">Family Network</span>
        </div>
        <p className="text-xs text-bark-600">
          Interconnected expertise working together
        </p>
      </motion.div>
    </div>
  )
}

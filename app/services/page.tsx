'use client'

import { motion } from 'framer-motion'
import { 
  Code, 
  Smartphone, 
  Palette, 
  Server,
  Cloud,
  BarChart3,
  ArrowLeft,
  TreePine,
  CheckCircle,
  Clock
} from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    id: 'frontend',
    icon: Code,
    title: 'Frontend Development',
    description: 'Modern web applications built with React, Next.js, and cutting-edge technologies.',
    features: ['React & Next.js', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
    price: 'Starting at $3,000',
    timeline: '2-4 weeks'
  },
  {
    id: 'mobile',
    icon: Smartphone,
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile apps for iOS and Android.',
    features: ['React Native', 'Native iOS/Android', 'App Store Deployment', 'Push Notifications'],
    price: 'Starting at $5,000',
    timeline: '4-8 weeks'
  },
  {
    id: 'design',
    icon: Palette,
    title: 'UI/UX Design',
    description: 'Beautiful, user-centered designs that convert visitors into customers.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    price: 'Starting at $2,000',
    timeline: '1-3 weeks'
  },
  {
    id: 'backend',
    icon: Server,
    title: 'Backend Systems',
    description: 'Scalable server architecture and API development.',
    features: ['Node.js & Python', 'Database Design', 'API Development', 'Security Implementation'],
    price: 'Starting at $4,000',
    timeline: '3-6 weeks'
  },
  {
    id: 'devops',
    icon: Cloud,
    title: 'DevOps & Infrastructure',
    description: 'Cloud deployment, CI/CD pipelines, and infrastructure management.',
    features: ['AWS/Azure/GCP', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Monitoring & Logging'],
    price: 'Starting at $2,500',
    timeline: '1-2 weeks'
  },
  {
    id: 'strategy',
    icon: BarChart3,
    title: 'Business Strategy',
    description: 'Technical consulting and product strategy to grow your business.',
    features: ['Technical Audits', 'Architecture Planning', 'Team Training', 'Growth Strategy'],
    price: 'Starting at $1,500',
    timeline: '1-2 weeks'
  }
]

export default function Services() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Home
              </Link>
              <div className="flex items-center">
                <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Our Services</h1>
              </div>
            </div>
            <button className="btn-organic">Get Quote</button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <motion.h2 
            className="text-4xl md:text-5xl font-serif text-bark-800 mb-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            Comprehensive Development <span className="text-leaf-600">Services</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-bark-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            From concept to deployment, our family of specialists delivers end-to-end solutions 
            tailored to your business needs.
          </motion.p>
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon
            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-organic p-8 hover:shadow-leaf group cursor-pointer"
              >
                <div className="flex items-center mb-6">
                  <div className="p-3 bg-leaf-100 rounded-organic mr-4 group-hover:bg-leaf-200 transition-colors">
                    <Icon className="h-8 w-8 text-leaf-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-bark-800">{service.title}</h3>
                </div>
                
                <p className="text-bark-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-leaf-500 mr-2 flex-shrink-0" />
                      <span className="text-bark-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-bark-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-bark-600">
                      <Clock className="h-4 w-4 mr-1" />
                      <span className="text-sm">{service.timeline}</span>
                    </div>
                    <div className="text-lg font-semibold text-leaf-600">{service.price}</div>
                  </div>
                  <Link href="/order" className="btn-leaf w-full block text-center">Order Now</Link>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 text-center bg-gradient-to-r from-bark-500 to-root-600 rounded-branch shadow-organic p-12"
        >
          <h3 className="text-3xl font-serif text-white mb-4">Ready to Start Your Project?</h3>
          <p className="text-bark-100 mb-8 max-w-2xl mx-auto">
            Let&apos;s discuss how our family of specialists can help bring your vision to life.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link href="/checkout" className="btn-organic">
              Get Started
            </Link>
            <button className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
              Schedule Consultation
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

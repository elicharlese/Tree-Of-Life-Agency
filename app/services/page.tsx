'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  CodeIcon,
  MobileIcon,
  ColorWheelIcon,
  CubeIcon,
  GearIcon,
  BarChartIcon,
  ArrowLeftIcon,
  CheckIcon,
  ClockIcon,
  MagicWandIcon,
  PaperPlaneIcon,
  Cross2Icon
} from '@radix-ui/react-icons'
import Link from 'next/link'

const services = [
  {
    id: 'frontend',
    icon: CodeIcon,
    title: 'Frontend Development',
    description: 'Modern web applications built with React, Next.js, and cutting-edge technologies.',
    features: ['React & Next.js', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
    price: 'Starting at $3,000',
    timeline: '2-4 weeks'
  },
  {
    id: 'mobile',
    icon: MobileIcon,
    title: 'Mobile Applications',
    description: 'Native and cross-platform mobile apps for iOS and Android.',
    features: ['React Native', 'Native iOS/Android', 'App Store Deployment', 'Push Notifications'],
    price: 'Starting at $5,000',
    timeline: '4-8 weeks'
  },
  {
    id: 'design',
    icon: ColorWheelIcon,
    title: 'UI/UX Design',
    description: 'Beautiful, user-centered designs that convert visitors into customers.',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    price: 'Starting at $2,000',
    timeline: '1-3 weeks'
  },
  {
    id: 'backend',
    icon: CubeIcon,
    title: 'Backend Systems',
    description: 'Scalable server architecture and API development.',
    features: ['Node.js & Python', 'Database Design', 'API Development', 'Security Implementation'],
    price: 'Starting at $4,000',
    timeline: '3-6 weeks'
  },
  {
    id: 'devops',
    icon: GearIcon,
    title: 'DevOps & Infrastructure',
    description: 'Cloud deployment, CI/CD pipelines, and infrastructure management.',
    features: ['AWS/Azure/GCP', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Monitoring & Logging'],
    price: 'Starting at $2,500',
    timeline: '1-2 weeks'
  },
  {
    id: 'strategy',
    icon: BarChartIcon,
    title: 'Business Strategy',
    description: 'Technical consulting and product strategy to grow your business.',
    features: ['Technical Audits', 'Architecture Planning', 'Team Training', 'Growth Strategy'],
    price: 'Starting at $1,500',
    timeline: '1-2 weeks'
  },
  {
    id: 'ai-ml',
    icon: CodeIcon,
    title: 'AI & Machine Learning',
    description: 'Intelligent solutions powered by machine learning and artificial intelligence.',
    features: ['Machine Learning Models', 'Natural Language Processing', 'Computer Vision', 'Predictive Analytics'],
    price: 'Starting at $6,000',
    timeline: '6-12 weeks'
  },
  {
    id: 'blockchain',
    icon: CubeIcon,
    title: 'Blockchain & Web3',
    description: 'Decentralized applications and blockchain solutions for the future.',
    features: ['Smart Contracts', 'DeFi Applications', 'NFT Platforms', 'Blockchain Integration'],
    price: 'Starting at $8,000',
    timeline: '8-16 weeks'
  },
  {
    id: 'ecommerce',
    icon: BarChartIcon,
    title: 'E-commerce Solutions',
    description: 'Custom online stores and marketplace platforms with seamless checkout.',
    features: ['Custom Storefronts', 'Payment Integration', 'Inventory Management', 'Analytics Dashboard'],
    price: 'Starting at $4,500',
    timeline: '4-8 weeks'
  },
  {
    id: 'cms',
    icon: ColorWheelIcon,
    title: 'Content Management Systems',
    description: 'Flexible CMS solutions for content creators and marketing teams.',
    features: ['Custom CMS Development', 'Headless Architecture', 'Multi-language Support', 'SEO Optimization'],
    price: 'Starting at $3,500',
    timeline: '3-6 weeks'
  },
  {
    id: 'testing',
    icon: GearIcon,
    title: 'Testing & Quality Assurance',
    description: 'Comprehensive testing services to ensure software reliability and performance.',
    features: ['Automated Testing', 'Manual QA', 'Performance Testing', 'Security Testing'],
    price: 'Starting at $2,000',
    timeline: '2-4 weeks'
  },
  {
    id: 'security',
    icon: GearIcon,
    title: 'Security Audits & Implementation',
    description: 'Protect your applications with enterprise-grade security solutions.',
    features: ['Security Audits', 'Vulnerability Assessment', 'Compliance Implementation', 'Penetration Testing'],
    price: 'Starting at $3,000',
    timeline: '2-6 weeks'
  }
]

export default function Services() {
  const [showQuoteModal, setShowQuoteModal] = useState(false)
  const [quoteForm, setQuoteForm] = useState({
    name: '',
    email: '',
    company: '',
    project: '',
    timeline: '6-8 weeks'
  })
  const [quoteMessage, setQuoteMessage] = useState('')

  const handleQuoteSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!quoteForm.name.trim() || !quoteForm.email.trim() || !quoteForm.project.trim()) {
      setQuoteMessage('Please fill in your name, email, and project summary.')
      return
    }

    setQuoteMessage('Thanks! Our team will reach out within one business day.')
    setTimeout(() => {
      setShowQuoteModal(false)
      setQuoteMessage('')
      setQuoteForm({
        name: '',
        email: '',
        company: '',
        project: '',
        timeline: '6-8 weeks'
      })
    }, 1200)
  }

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
        {/* Header */}
        <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Link href="/" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                  <ArrowLeftIcon className="mr-2 h-5 w-5" />
                  Home
                </Link>
                <div className="flex items-center">
                  <h1 className="text-2xl font-serif text-bark-800">Our Services</h1>
                </div>
              </div>
              <button
                className="btn-organic flex items-center space-x-2"
                onClick={() => setShowQuoteModal(true)}
              >
                <MagicWandIcon className="h-4 w-4" />
                <span>Get Quote</span>
              </button>
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
                  <div className="p-3 bg-leaf-100  mr-4 group-hover:bg-leaf-200 transition-colors">
                    <Icon className="h-8 w-8 text-leaf-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-bark-800">{service.title}</h3>
                </div>
                
                <p className="text-bark-600 mb-6">{service.description}</p>
                
                <div className="space-y-3 mb-6">
                  {service.features.map((feature) => (
                    <div key={feature} className="flex items-center">
                      <CheckIcon className="h-4 w-4 text-leaf-500 mr-2 flex-shrink-0" />
                      <span className="text-bark-700 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
                
                <div className="border-t border-bark-200 pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center text-bark-600">
                      <ClockIcon className="h-4 w-4 mr-1" />
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
          className="mt-16 text-center bg-gradient-to-r from-bark-500 to-root-600  shadow-organic p-12"
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

      {showQuoteModal && (
        <div className="fixed inset-0 bg-bark-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white/95 border border-bark-200 max-w-lg w-full p-6 relative shadow-organic animate-fade-in">
            <button
              className="absolute top-4 right-4 text-bark-400 hover:text-bark-600"
              onClick={() => setShowQuoteModal(false)}
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-leaf-100 text-leaf-700">
                <MagicWandIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-bark-800">Request a Quote</h3>
                <p className="text-bark-500 text-sm">Tell us about your project and we’ll respond within one business day.</p>
              </div>
            </div>
            <form className="space-y-4" onSubmit={handleQuoteSubmit}>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Full Name</label>
                <input
                  type="text"
                  className="input-organic w-full"
                  placeholder="Alex Thompson"
                  value={quoteForm.name}
                  onChange={(e) => setQuoteForm({ ...quoteForm, name: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Email</label>
                <input
                  type="email"
                  className="input-organic w-full"
                  placeholder="alex@company.com"
                  value={quoteForm.email}
                  onChange={(e) => setQuoteForm({ ...quoteForm, email: e.target.value })}
                />
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-bark-700 mb-1">Company (optional)</label>
                  <input
                    type="text"
                    className="input-organic w-full"
                    placeholder="Tree of Life Agency"
                    value={quoteForm.company}
                    onChange={(e) => setQuoteForm({ ...quoteForm, company: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-bark-700 mb-1">Ideal Timeline</label>
                  <select
                    className="input-organic w-full"
                    value={quoteForm.timeline}
                    onChange={(e) => setQuoteForm({ ...quoteForm, timeline: e.target.value })}
                  >
                    {['4-6 weeks', '6-8 weeks', '8-12 weeks', 'Flexible'].map(option => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Project Summary</label>
                <textarea
                  className="input-organic w-full min-h-[140px]"
                  placeholder="Share the goals, required platforms, and any known constraints..."
                  value={quoteForm.project}
                  onChange={(e) => setQuoteForm({ ...quoteForm, project: e.target.value })}
                />
              </div>
              {quoteMessage && (
                <p className="text-sm text-leaf-700">{quoteMessage}</p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-bark-500">We usually respond within 24 hours.</p>
                <div className="flex items-center space-x-3">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => setShowQuoteModal(false)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="btn-leaf flex items-center space-x-2">
                    <PaperPlaneIcon className="h-4 w-4" />
                    <span>Submit</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}

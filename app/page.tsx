'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { 
  BookOpen, 
  Users, 
  TreePine, 
  Leaf, 
  Shield, 
  Zap,
  ChevronRight
} from 'lucide-react'

import HeroVisual from '../components/HeroVisual'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const features = [
    {
      icon: BookOpen,
      title: 'Living Library',
      description: 'Access our collective knowledge base with interactive tree branches'
    },
    {
      icon: Users,
      title: 'Collaborative Wisdom',
      description: 'Connect with experts across different specialties'
    },
    {
      icon: TreePine,
      title: 'Organic Growth',
      description: 'Watch your skills and knowledge expand like tree branches'
    },
    {
      icon: Leaf,
      title: 'Sustainable Practices',
      description: 'Learn and grow with nature-inspired design principles'
    },
    {
      icon: Shield,
      title: 'Secure Access',
      description: 'Protected knowledge sharing within our community'
    },
    {
      icon: Zap,
      title: 'Instant Insights',
      description: 'Get real-time access to curated expertise'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Navigation */}
      <nav className="nav-organic">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-leaf-500" />
              <span className="ml-2 text-xl font-bold text-bark-800">Tree of Life Agency</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-4">
                <Link href="/library" className="text-bark-600 hover:text-leaf-600 px-3 py-2 rounded-md text-sm font-medium">Library</Link>
                <Link href="/services" className="text-bark-600 hover:text-leaf-600 px-3 py-2 rounded-md text-sm font-medium">Services</Link>
                <Link href="/collective" className="text-bark-600 hover:text-leaf-600 px-3 py-2 rounded-md text-sm font-medium">Collective</Link>
                <Link href="/wisdom" className="text-bark-600 hover:text-leaf-600 px-3 py-2 rounded-md text-sm font-medium">Wisdom</Link>
                <Link href="/auth/signin" className="btn-organic">Sign In</Link>
                <Link href="/auth/signup" className="btn-leaf">Join Collective</Link>
              </div>
            </div>
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-bark-600 hover:text-leaf-600 focus:outline-none"
              >
                <svg className="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Mobile menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link href="/library" className="text-bark-600 hover:text-leaf-600 block px-3 py-2 rounded-md text-base font-medium">Library</Link>
              <Link href="/services" className="text-bark-600 hover:text-leaf-600 block px-3 py-2 rounded-md text-base font-medium">Services</Link>
              <Link href="/collective" className="text-bark-600 hover:text-leaf-600 block px-3 py-2 rounded-md text-base font-medium">Collective</Link>
              <Link href="/wisdom" className="text-bark-600 hover:text-leaf-600 block px-3 py-2 rounded-md text-base font-medium">Wisdom</Link>
              <div className="flex space-x-2 px-3 py-2">
                <Link href="/auth/signin" className="btn-organic w-1/2">Sign In</Link>
                <Link href="/auth/signup" className="btn-leaf w-1/2">Join</Link>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Column - Text Content */}
          <div className="text-center lg:text-left">
            <motion.h1 
              className="text-4xl md:text-6xl font-serif text-bark-800 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              Family-Powered <span className="text-leaf-600">Development</span>
            </motion.h1>
            <motion.p 
              className="text-xl text-bark-600 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              We&apos;re a specialized family of developers, designers, and strategists who build applications, 
              websites, and businesses. Each member brings unique expertise to create comprehensive solutions.
            </motion.p>
            <motion.p 
              className="text-lg text-bark-500 mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              Like a tree&apos;s interconnected branches, our skills complement each other to deliver 
              end-to-end development services without the need for external recruitment.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4"
            >
              <Link href="/order" className="btn-organic flex items-center justify-center">
                Start Your Project
                <ChevronRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/collective" className="btn-leaf flex items-center justify-center">
                Meet Our Family
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </motion.div>
          </div>
          
          {/* Right Column - 3D Scene */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
            className="relative"
          >
            <HeroVisual />
          </motion.div>
        </div>
      </div>

      {/* Features Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-serif text-bark-800 mb-4">Our Living Library Features</h2>
          <p className="text-bark-600 max-w-2xl mx-auto">
            A collaborative knowledge base designed to reflect the interconnected nature of expertise and wisdom.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <motion.div
                key={index}
                className="card-organic p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="flex items-center mb-4">
                  <Icon className="h-8 w-8 text-leaf-500" />
                  <h3 className="text-xl font-semibold ml-3 text-bark-800">{feature.title}</h3>
                </div>
                <p className="text-bark-600">{feature.description}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Access Levels Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-bark-500 to-root-600 rounded-branch shadow-organic p-8 md:p-12">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-serif text-white mb-4">Branch Into Knowledge</h2>
            <p className="text-bark-100 max-w-2xl mx-auto">
              Our library has different access levels, each offering unique insights and collaborative opportunities.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-organic p-6 border border-white/20">
              <div className="text-center">
                <Leaf className="h-12 w-12 text-leaf-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Seedling Access</h3>
                <p className="text-bark-100 mb-4">Begin your journey with basic knowledge sharing</p>
                <button className="btn-leaf w-full">Start Growing</button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-organic p-6 border border-white/20">
              <div className="text-center">
                <TreePine className="h-12 w-12 text-wisdom-300 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Branch Member</h3>
                <p className="text-bark-100 mb-4">Full access to our collaborative knowledge base</p>
                <button className="btn-wisdom w-full">Join Branch</button>
              </div>
            </div>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-organic p-6 border border-white/20">
              <div className="text-center">
                <Shield className="h-12 w-12 text-wisdom-200 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">Elder Tree</h3>
                <p className="text-bark-100 mb-4">Advanced insights and leadership opportunities</p>
                <button className="btn-organic w-full">Ascend</button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-bark-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Company Info */}
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <TreePine className="h-8 w-8 text-leaf-400 mr-2" />
                <span className="text-xl font-bold">Tree of Life Agency</span>
              </div>
              <p className="text-bark-300 mb-4">
                A family of specialists delivering comprehensive development services with organic collaboration.
              </p>
              <div className="flex space-x-4">
                <button className="text-bark-300 hover:text-leaf-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                  </svg>
                </button>
                <button className="text-bark-300 hover:text-leaf-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                  </svg>
                </button>
                <button className="text-bark-300 hover:text-leaf-400 transition-colors">
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Services</h3>
              <ul className="space-y-2">
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">Frontend Development</Link></li>
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">Backend Systems</Link></li>
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">Mobile Apps</Link></li>
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">UI/UX Design</Link></li>
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">DevOps</Link></li>
                <li><Link href="/services" className="text-bark-300 hover:text-leaf-400 transition-colors">Business Strategy</Link></li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link href="/library" className="text-bark-300 hover:text-leaf-400 transition-colors">Knowledge Library</Link></li>
                <li><Link href="/wisdom" className="text-bark-300 hover:text-leaf-400 transition-colors">Insights & Wisdom</Link></li>
                <li><Link href="/collective" className="text-bark-300 hover:text-leaf-400 transition-colors">Meet Our Team</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Case Studies</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Blog</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Documentation</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link href="/collective" className="text-bark-300 hover:text-leaf-400 transition-colors">About Us</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Careers</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Contact</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Privacy Policy</Link></li>
                <li><Link href="#" className="text-bark-300 hover:text-leaf-400 transition-colors">Terms of Service</Link></li>
                <li><Link href="/auth/signin" className="text-bark-300 hover:text-leaf-400 transition-colors">Sign In</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-bark-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-bark-400 text-sm">
              © 2024 Tree of Life Agency. All rights reserved.
            </p>
            <div className="flex items-center space-x-4 mt-4 md:mt-0">
              <Link href="/checkout" className="btn-leaf text-sm py-2 px-4">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

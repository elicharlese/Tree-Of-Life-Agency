'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LightningBoltIcon,
  ReaderIcon,
  BarChartIcon,
  GroupIcon,
  ArrowLeftIcon,
  MagicWandIcon,
  QuoteIcon,
  CalendarIcon,
  EyeOpenIcon
} from '@radix-ui/react-icons'
import Link from 'next/link'

const insights = [
  {
    id: 1,
    title: 'The Future of Web Development',
    category: 'Technology Trends',
    author: 'Sarah Chen',
    date: '2024-01-15',
    readTime: '8 min',
    views: 1247,
    excerpt: 'Exploring emerging technologies that will shape the next decade of web development.',
    image: '🚀'
  },
  {
    id: 2,
    title: 'Building Scalable Team Culture',
    category: 'Leadership',
    author: 'Alex Thompson',
    date: '2024-01-12',
    readTime: '12 min',
    views: 892,
    excerpt: 'How to foster collaboration and growth in distributed development teams.',
    image: '🌱'
  },
  {
    id: 3,
    title: 'User-Centered Design Principles',
    category: 'Design',
    author: 'Elena Rodriguez',
    date: '2024-01-10',
    readTime: '6 min',
    views: 1534,
    excerpt: 'Core principles for creating designs that truly serve user needs.',
    image: '🎨'
  },
  {
    id: 4,
    title: 'Cloud Architecture Best Practices',
    category: 'Infrastructure',
    author: 'David Kim',
    date: '2024-01-08',
    readTime: '15 min',
    views: 743,
    excerpt: 'Lessons learned from deploying applications at scale in the cloud.',
    image: '☁️'
  }
]

const quotes = [
  {
    text: "Knowledge shared is knowledge multiplied. When we teach others, we learn twice.",
    author: "Sarah Chen",
    role: "Frontend Architect"
  },
  {
    text: "The best code is not just functional, but tells a story that future developers can understand.",
    author: "Marcus Johnson",
    role: "Backend Engineer"
  },
  {
    text: "Design is not just how it looks, but how it works and how it makes people feel.",
    author: "Elena Rodriguez",
    role: "UX/UI Designer"
  }
]

export default function Wisdom() {
  const [isShareOpen, setIsShareOpen] = useState(false)

  const popoutVariants = {
    hidden: { opacity: 0, y: 40, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: 40, scale: 0.95 }
  }

  return (
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
                <MagicWandIcon className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Wisdom & Insights</h1>
              </div>
            </div>
            <button
              className="btn-organic flex items-center space-x-2"
              onClick={() => setIsShareOpen(true)}
            >
              <LightningBoltIcon className="h-4 w-4" />
              <span>Share Insight</span>
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-bark-800 mb-6">
            Collective <span className="text-wisdom-600">Wisdom</span>
          </h2>
          <p className="text-xl text-bark-600 max-w-3xl mx-auto">
            Insights, lessons learned, and thought leadership from our family of specialists.
            Knowledge that grows stronger when shared.
          </p>
        </div>

        {/* Featured Quotes */}
        <div className="mb-16">
          <h3 className="text-2xl font-serif text-bark-800 text-center mb-8">Words of Wisdom</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quotes.map((quote, index) => (
              <div key={index} className="card-organic p-6 text-center">
                <QuoteIcon className="h-8 w-8 text-wisdom-400 mx-auto mb-4" />
                <blockquote className="text-bark-700 italic mb-4">
                  &quot;{quote.text}&quot;
                </blockquote>
                <div className="text-sm">
                  <div className="font-medium text-bark-800">{quote.author}</div>
                  <div className="text-bark-500">{quote.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Latest Insights */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif text-bark-800">Latest Insights</h3>
            <button className="text-leaf-600 hover:text-leaf-700 font-medium">View All</button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {insights.map((insight) => (
              <article
                key={insight.id}
                className="card-organic p-6 hover:shadow-leaf cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-wisdom-100 text-wisdom-700  text-sm font-medium">
                    {insight.category}
                  </span>
                  <div className="text-4xl">{insight.image}</div>
                </div>
                
                <h4 className="text-xl font-semibold text-bark-800 mb-3 group-hover:text-leaf-700 transition-colors">
                  {insight.title}
                </h4>
                
                <p className="text-bark-600 mb-4">{insight.excerpt}</p>
                
                <div className="flex items-center justify-between text-sm text-bark-500">
                  <div className="flex items-center space-x-4">
                    <span>{insight.author}</span>
                    <div className="flex items-center">
                      <CalendarIcon className="h-4 w-4 mr-1" />
                      {new Date(insight.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <EyeOpenIcon className="h-4 w-4 mr-1" />
                      {insight.views}
                    </div>
                    <span>{insight.readTime}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-serif text-bark-800 text-center mb-8">Explore by Category</h3>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: BarChartIcon, title: 'Technology Trends', count: 12 },
              { icon: GroupIcon, title: 'Leadership', count: 8 },
              { icon: LightningBoltIcon, title: 'Innovation', count: 15 },
              { icon: ReaderIcon, title: 'Best Practices', count: 20 }
            ].map((category, index) => {
              const Icon = category.icon
              return (
                <div key={index} className="card-organic p-6 text-center hover:shadow-leaf cursor-pointer group">
                  <Icon className="h-12 w-12 text-leaf-500 mx-auto mb-4 group-hover:text-leaf-600 transition-colors" />
                  <h4 className="font-semibold text-bark-800 mb-2">{category.title}</h4>
                  <p className="text-bark-500 text-sm">{category.count} insights</p>
                </div>
              )
            })}
          </div>
        </motion.div>

        {/* CTA Section */}
        <div className="text-center bg-gradient-to-r from-wisdom-500 to-leaf-500  shadow-organic p-12">
          <LightningBoltIcon className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-serif text-white mb-4">Share Your Wisdom</h3>
          <p className="text-wisdom-100 mb-8 max-w-2xl mx-auto">
            Have insights to share? Contribute to our collective knowledge and help others grow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-organic bg-white text-wisdom-600 hover:bg-bark-50 flex items-center justify-center space-x-2">
              <LightningBoltIcon className="h-4 w-4" />
              <span>Write an Article</span>
            </button>
            <button className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
              Join Discussion
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isShareOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-bark-900/60 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              variants={popoutVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="max-w-2xl w-full bg-white rounded-none shadow-2xl border border-bark-200"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-bark-200">
                <div>
                  <p className="text-xs uppercase tracking-[0.4em] text-bark-400">Wisdom Submission</p>
                  <h3 className="text-2xl font-serif text-bark-900">Share Your Insight</h3>
                </div>
                <button
                  className="text-bark-400 hover:text-bark-900 transition-colors"
                  aria-label="Close"
                  onClick={() => setIsShareOpen(false)}
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-6 space-y-6">
                <p className="text-bark-600 text-sm">
                  Submit a short lesson, story, or perspective that could help the rest of the collective.
                </p>
                <form className="space-y-4">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-1">Your Name</label>
                      <input className="input-organic w-full" placeholder="Elena Rodriguez" type="text" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-1">Role / Specialty</label>
                      <input className="input-organic w-full" placeholder="UX Designer, Strategy, etc." type="text" />
                    </div>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-1">Email</label>
                      <input className="input-organic w-full" placeholder="you@email.com" type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-1">Suggested Category</label>
                      <select className="input-organic w-full">
                        <option>Technology Trends</option>
                        <option>Leadership</option>
                        <option>Innovation</option>
                        <option>Best Practices</option>
                        <option>Other</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-700 mb-1">Insight Title</label>
                    <input className="input-organic w-full" placeholder="Give your insight a headline" type="text" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-700 mb-1">Your Insight</label>
                    <textarea
                      rows={5}
                      className="input-organic w-full"
                      placeholder="Share a thoughtful paragraph, key lesson learned, or a short story."
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-700 mb-1">Optional Link</label>
                    <input
                      className="input-organic w-full"
                      placeholder="Article, deck, or supporting reference"
                      type="url"
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-bark-200">
                    <p className="text-xs text-bark-500">
                      We review every submission to keep the collective curated.
                    </p>
                    <button
                      type="button"
                      className="btn-leaf px-6 py-3 flex items-center space-x-2"
                      onClick={() => setIsShareOpen(false)}
                    >
                      <LightningBoltIcon className="h-4 w-4" />
                      <span>Submit Insight</span>
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

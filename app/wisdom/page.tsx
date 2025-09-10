'use client'

import { motion } from 'framer-motion'
import { 
  Lightbulb, 
  BookOpen, 
  TrendingUp, 
  Users,
  ArrowLeft,
  TreePine,
  Quote,
  Calendar,
  Eye
} from 'lucide-react'
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
                <h1 className="text-2xl font-serif text-bark-800">Wisdom & Insights</h1>
              </div>
            </div>
            <button className="btn-organic">Share Insight</button>
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
            Collective <span className="text-wisdom-600">Wisdom</span>
          </motion.h2>
          <motion.p 
            className="text-xl text-bark-600 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Insights, lessons learned, and thought leadership from our family of specialists. 
            Knowledge that grows stronger when shared.
          </motion.p>
        </div>

        {/* Featured Quotes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mb-16"
        >
          <h3 className="text-2xl font-serif text-bark-800 text-center mb-8">Words of Wisdom</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {quotes.map((quote, index) => (
              <div key={index} className="card-organic p-6 text-center">
                <Quote className="h-8 w-8 text-wisdom-400 mx-auto mb-4" />
                <blockquote className="text-bark-700 italic mb-4">
                  &ldquo;{quote.text}&rdquo;
                </blockquote>
                <div className="text-sm">
                  <div className="font-medium text-bark-800">{quote.author}</div>
                  <div className="text-bark-500">{quote.role}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Latest Insights */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-2xl font-serif text-bark-800">Latest Insights</h3>
            <button className="text-leaf-600 hover:text-leaf-700 font-medium">View All</button>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {insights.map((insight, index) => (
              <motion.article
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="card-organic p-6 hover:shadow-leaf cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-4">
                  <span className="px-3 py-1 bg-wisdom-100 text-wisdom-700 rounded-full text-sm font-medium">
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
                      <Calendar className="h-4 w-4 mr-1" />
                      {new Date(insight.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {insight.views}
                    </div>
                    <span>{insight.readTime}</span>
                  </div>
                </div>
              </motion.article>
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
              { icon: TrendingUp, title: 'Technology Trends', count: 12 },
              { icon: Users, title: 'Leadership', count: 8 },
              { icon: Lightbulb, title: 'Innovation', count: 15 },
              { icon: BookOpen, title: 'Best Practices', count: 20 }
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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-center bg-gradient-to-r from-wisdom-500 to-leaf-500 rounded-branch shadow-organic p-12"
        >
          <Lightbulb className="h-16 w-16 text-white mx-auto mb-6" />
          <h3 className="text-3xl font-serif text-white mb-4">Share Your Wisdom</h3>
          <p className="text-wisdom-100 mb-8 max-w-2xl mx-auto">
            Have insights to share? Contribute to our collective knowledge and help others grow.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="btn-organic bg-white text-wisdom-600 hover:bg-bark-50">
              Write an Article
            </button>
            <button className="btn-secondary bg-white/20 border-white/30 text-white hover:bg-white/30">
              Join Discussion
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

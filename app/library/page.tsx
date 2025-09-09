'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  BookOpen, 
  Search, 
  Filter,
  TreePine,
  ArrowLeft,
  Users,
  Clock,
  Star
} from 'lucide-react'
import Link from 'next/link'

const libraryItems = [
  {
    id: 1,
    title: 'React Development Patterns',
    category: 'Frontend',
    author: 'Sarah Chen',
    readTime: '12 min',
    rating: 4.8,
    description: 'Advanced patterns for building scalable React applications with modern hooks and state management.',
    tags: ['React', 'JavaScript', 'Patterns']
  },
  {
    id: 2,
    title: 'Node.js Microservices Architecture',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '18 min',
    rating: 4.9,
    description: 'Design and implement robust microservices using Node.js, Docker, and Kubernetes.',
    tags: ['Node.js', 'Microservices', 'Architecture']
  },
  {
    id: 3,
    title: 'Mobile-First Design Principles',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '8 min',
    rating: 4.7,
    description: 'Creating responsive designs that work seamlessly across all device types.',
    tags: ['Design', 'Mobile', 'UX']
  },
  {
    id: 4,
    title: 'DevOps Best Practices',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '15 min',
    rating: 4.8,
    description: 'Streamline your deployment pipeline with modern DevOps tools and practices.',
    tags: ['DevOps', 'CI/CD', 'Infrastructure']
  }
]

const categories = ['All', 'Frontend', 'Backend', 'Design', 'Infrastructure', 'Business']

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')

  const filteredItems = libraryItems.filter(item => {
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    return matchesCategory && matchesSearch
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Link>
              <div className="flex items-center">
                <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Knowledge Library</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-organic">Contribute</button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 h-5 w-5 text-bark-400" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-organic w-full pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-bark-500" />
              <span className="text-bark-600 font-medium">Filter:</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-organic font-medium transition-all duration-200 ${
                  selectedCategory === category
                    ? 'bg-leaf-500 text-white shadow-leaf'
                    : 'bg-white text-bark-600 border border-bark-300 hover:bg-leaf-50'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Library Items */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="card-organic p-6 hover:shadow-leaf cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <span className="px-3 py-1 bg-leaf-100 text-leaf-700 rounded-full text-sm font-medium">
                  {item.category}
                </span>
                <div className="flex items-center text-wisdom-500">
                  <Star className="h-4 w-4 fill-current mr-1" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-bark-800 mb-3">{item.title}</h3>
              <p className="text-bark-600 mb-4 line-clamp-3">{item.description}</p>
              
              <div className="flex items-center justify-between text-sm text-bark-500 mb-4">
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-1" />
                  {item.author}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {item.readTime}
                </div>
              </div>
              
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-1 bg-bark-100 text-bark-600 rounded text-xs"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-16 w-16 text-bark-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-bark-600 mb-2">No items found</h3>
            <p className="text-bark-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>
    </div>
  )
}

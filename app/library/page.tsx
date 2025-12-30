'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  ReaderIcon,
  MagnifyingGlassIcon,
  MixerHorizontalIcon,
  ArrowLeftIcon,
  StarIcon,
  GroupIcon,
  ClockIcon,
  MagicWandIcon,
  PaperPlaneIcon,
  Cross2Icon
} from '@radix-ui/react-icons'
import Link from 'next/link'

const initialLibraryItems = [
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
  },
  {
    id: 5,
    title: 'TypeScript Best Practices',
    category: 'Frontend',
    author: 'Sarah Chen',
    readTime: '10 min',
    rating: 4.9,
    description: 'Master TypeScript with advanced types, generics, and design patterns for robust applications.',
    tags: ['TypeScript', 'JavaScript', 'Best Practices']
  },
  {
    id: 6,
    title: 'Next.js 13 App Router Guide',
    category: 'Frontend',
    author: 'Sarah Chen',
    readTime: '14 min',
    rating: 4.7,
    description: 'Complete guide to Next.js 13 App Router, server components, and modern React patterns.',
    tags: ['Next.js', 'React', 'App Router']
  },
  {
    id: 7,
    title: 'CSS Grid and Flexbox Mastery',
    category: 'Frontend',
    author: 'Elena Rodriguez',
    readTime: '16 min',
    rating: 4.8,
    description: 'Master modern CSS layout techniques with practical examples and responsive design patterns.',
    tags: ['CSS', 'Grid', 'Flexbox', 'Layout']
  },
  {
    id: 8,
    title: 'Database Design Patterns',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '20 min',
    rating: 4.9,
    description: 'Learn essential database design patterns for scalable and maintainable applications.',
    tags: ['Database', 'Design Patterns', 'SQL', 'NoSQL']
  },
  {
    id: 9,
    title: 'API Security Best Practices',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '12 min',
    rating: 4.8,
    description: 'Secure your APIs with authentication, authorization, and common security vulnerabilities.',
    tags: ['API', 'Security', 'Authentication', 'JWT']
  },
  {
    id: 10,
    title: 'GraphQL vs REST: Choosing the Right API',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '11 min',
    rating: 4.6,
    description: 'Compare GraphQL and REST APIs to determine the best approach for your project needs.',
    tags: ['GraphQL', 'REST', 'API', 'Architecture']
  },
  {
    id: 11,
    title: 'Accessibility in Web Design',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '13 min',
    rating: 4.9,
    description: 'Create inclusive web experiences with WCAG guidelines and practical accessibility techniques.',
    tags: ['Accessibility', 'WCAG', 'Inclusive Design', 'UX']
  },
  {
    id: 12,
    title: 'Design Systems Implementation',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '17 min',
    rating: 4.8,
    description: 'Build and maintain scalable design systems for consistent user experiences across products.',
    tags: ['Design Systems', 'Component Library', 'Consistency', 'Scalability']
  },
  {
    id: 13,
    title: 'Docker Containerization',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '13 min',
    rating: 4.7,
    description: 'Master Docker for containerization, orchestration, and modern application deployment.',
    tags: ['Docker', 'Containers', 'DevOps', 'Deployment']
  },
  {
    id: 14,
    title: 'Cloud Architecture Patterns',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '19 min',
    rating: 4.8,
    description: 'Design resilient cloud architectures with AWS, Azure, and GCP best practices.',
    tags: ['Cloud', 'AWS', 'Architecture', 'Scalability']
  },
  {
    id: 15,
    title: 'Product Management Fundamentals',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '15 min',
    rating: 4.7,
    description: 'Essential skills for product managers in tech companies, from ideation to launch.',
    tags: ['Product Management', 'Strategy', 'Roadmapping', 'Metrics']
  },
  {
    id: 16,
    title: 'Agile Development Methodologies',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '12 min',
    rating: 4.6,
    description: 'Implement Scrum, Kanban, and other agile practices for efficient software development.',
    tags: ['Agile', 'Scrum', 'Kanban', 'Methodology']
  },
  {
    id: 17,
    title: 'Client Communication Strategies',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '9 min',
    rating: 4.8,
    description: 'Build strong client relationships with effective communication and expectation management.',
    tags: ['Communication', 'Client Relations', 'Consulting', 'Stakeholder Management']
  },
  {
    id: 18,
    title: 'Pricing Strategy for Tech Services',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '14 min',
    rating: 4.7,
    description: 'Develop competitive pricing models for software development and consulting services.',
    tags: ['Pricing', 'Business Model', 'Value Proposition', 'Market Analysis']
  },
  {
    id: 19,
    title: 'Building Developer Communities',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '11 min',
    rating: 4.9,
    description: 'Create and nurture developer communities for growth, learning, and collaboration.',
    tags: ['Community', 'Networking', 'Open Source', 'Leadership']
  },
  {
    id: 20,
    title: 'React Performance Optimization',
    category: 'Frontend',
    author: 'Sarah Chen',
    readTime: '18 min',
    rating: 4.8,
    description: 'Master React performance with memoization, code splitting, and optimization techniques.',
    tags: ['React', 'Performance', 'Optimization', 'JavaScript']
  },
  {
    id: 21,
    title: 'Web Accessibility Best Practices',
    category: 'Frontend',
    author: 'Elena Rodriguez',
    readTime: '15 min',
    rating: 4.9,
    description: 'Implement WCAG 2.1 guidelines and create accessible web experiences for all users.',
    tags: ['Accessibility', 'WCAG', 'Inclusive Design', 'Frontend']
  },
  {
    id: 22,
    title: 'Modern JavaScript Features',
    category: 'Frontend',
    author: 'Sarah Chen',
    readTime: '13 min',
    rating: 4.7,
    description: 'Explore ES2023 features, async/await patterns, and modern JavaScript development.',
    tags: ['JavaScript', 'ES2023', 'Async/Await', 'Modern Development']
  },
  {
    id: 23,
    title: 'CSS-in-JS vs Traditional CSS',
    category: 'Frontend',
    author: 'Elena Rodriguez',
    readTime: '12 min',
    rating: 4.6,
    description: 'Compare styled-components, emotion, and traditional CSS approaches for styling.',
    tags: ['CSS', 'CSS-in-JS', 'Styled Components', 'Styling']
  },
  {
    id: 24,
    title: 'Serverless Architecture Patterns',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '16 min',
    rating: 4.8,
    description: 'Design serverless applications with AWS Lambda, API Gateway, and cloud functions.',
    tags: ['Serverless', 'AWS Lambda', 'Cloud Functions', 'Architecture']
  },
  {
    id: 25,
    title: 'Database Migration Strategies',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '14 min',
    rating: 4.7,
    description: 'Plan and execute database migrations safely with minimal downtime and data loss.',
    tags: ['Database', 'Migration', 'Schema Changes', 'Data Integrity']
  },
  {
    id: 26,
    title: 'Caching Strategies for Web Applications',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '17 min',
    rating: 4.8,
    description: 'Implement Redis, CDN, and application-level caching for improved performance.',
    tags: ['Caching', 'Redis', 'CDN', 'Performance']
  },
  {
    id: 27,
    title: 'Message Queues and Event-Driven Architecture',
    category: 'Backend',
    author: 'Marcus Johnson',
    readTime: '19 min',
    rating: 4.9,
    description: 'Build scalable systems with RabbitMQ, Kafka, and event-driven design patterns.',
    tags: ['Message Queues', 'Kafka', 'Event-Driven', 'Scalability']
  },
  {
    id: 28,
    title: 'User Research Methods',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '14 min',
    rating: 4.8,
    description: 'Conduct effective user research with interviews, surveys, and usability testing.',
    tags: ['User Research', 'UX Research', 'Interviews', 'Usability Testing']
  },
  {
    id: 29,
    title: 'Prototyping Tools and Techniques',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '11 min',
    rating: 4.7,
    description: 'Master Figma, Adobe XD, and prototyping techniques for rapid design iteration.',
    tags: ['Prototyping', 'Figma', 'Design Tools', 'Iteration']
  },
  {
    id: 30,
    title: 'Color Theory in Digital Design',
    category: 'Design',
    author: 'Elena Rodriguez',
    readTime: '10 min',
    rating: 4.6,
    description: 'Apply color psychology and theory to create effective digital interfaces.',
    tags: ['Color Theory', 'Psychology', 'Digital Design', 'Branding']
  },
  {
    id: 31,
    title: 'Kubernetes Orchestration',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '21 min',
    rating: 4.9,
    description: 'Master Kubernetes for container orchestration, scaling, and production deployments.',
    tags: ['Kubernetes', 'Orchestration', 'Containers', 'Scaling']
  },
  {
    id: 32,
    title: 'Monitoring and Observability',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '16 min',
    rating: 4.8,
    description: 'Implement comprehensive monitoring with Prometheus, Grafana, and logging solutions.',
    tags: ['Monitoring', 'Observability', 'Prometheus', 'Grafana']
  },
  {
    id: 33,
    title: 'Security in DevOps (DevSecOps)',
    category: 'Infrastructure',
    author: 'David Kim',
    readTime: '18 min',
    rating: 4.9,
    description: 'Integrate security practices into DevOps pipelines and infrastructure as code.',
    tags: ['DevSecOps', 'Security', 'DevOps', 'Infrastructure']
  },
  {
    id: 34,
    title: 'Remote Team Management',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '13 min',
    rating: 4.7,
    description: 'Lead distributed teams effectively with communication tools and management strategies.',
    tags: ['Remote Work', 'Team Management', 'Communication', 'Leadership']
  },
  {
    id: 35,
    title: 'Intellectual Property in Software',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '15 min',
    rating: 4.8,
    description: 'Protect software assets with patents, copyrights, and licensing strategies.',
    tags: ['Intellectual Property', 'Patents', 'Licensing', 'Legal']
  },
  {
    id: 36,
    title: 'Startup Funding Strategies',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '17 min',
    rating: 4.6,
    description: 'Navigate venture capital, bootstrapping, and alternative funding for tech startups.',
    tags: ['Funding', 'Venture Capital', 'Bootstrapping', 'Startups']
  },
  {
    id: 37,
    title: 'Customer Success Metrics',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '12 min',
    rating: 4.8,
    description: 'Track and improve customer satisfaction with NPS, retention, and success metrics.',
    tags: ['Customer Success', 'NPS', 'Retention', 'Metrics']
  },
  {
    id: 38,
    title: 'Technical Debt Management',
    category: 'Business',
    author: 'Alex Thompson',
    readTime: '14 min',
    rating: 4.7,
    description: 'Identify, measure, and strategically manage technical debt in software projects.',
    tags: ['Technical Debt', 'Code Quality', 'Refactoring', 'Maintenance']
  }
]

const categories = ['All', 'Frontend', 'Backend', 'Design', 'Infrastructure', 'Business']

export default function Library() {
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [showContribute, setShowContribute] = useState(false)
  const [items, setItems] = useState(initialLibraryItems)
  const [contributionForm, setContributionForm] = useState({
    title: '',
    category: 'Frontend',
    summary: ''
  })
  const [formMessage, setFormMessage] = useState<{ type: 'success' | 'error' | null; text: string }>({ type: null, text: '' })

  const filteredItems = items.filter(item => {
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
                <ArrowLeftIcon className="mr-2 h-5 w-5" />
                Home
              </Link>
              <div className="flex items-center">
                <h1 className="text-2xl font-serif text-bark-800">Knowledge Library</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="btn-organic flex items-center space-x-2" onClick={() => setShowContribute(true)}>
                <MagicWandIcon className="h-5 w-5" />
                <span>Contribute</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-bark-400" />
              <input
                type="text"
                placeholder="Search knowledge base..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-organic w-full pl-10"
              />
            </div>
            <div className="flex items-center space-x-2">
              <MixerHorizontalIcon className="h-5 w-5 text-bark-500" />
              <span className="text-bark-600 font-medium">Filter:</span>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2  font-medium transition-all duration-200 ${
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
                <span className="px-3 py-1 bg-leaf-100 text-leaf-700  text-sm font-medium">
                  {item.category}
                </span>
                <div className="flex items-center text-wisdom-500">
                  <StarIcon className="h-4 w-4 mr-1" />
                  <span className="text-sm font-medium">{item.rating}</span>
                </div>
              </div>
              
              <h3 className="text-xl font-semibold text-bark-800">{item.title}</h3>
              <div className="flex items-center justify-between text-sm text-bark-500 mt-2 mb-3">
                <div className="flex items-center">
                  <GroupIcon className="h-4 w-4 mr-1" />
                  {item.author}
                </div>
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  {item.readTime}
                </div>
              </div>
              <p className="text-bark-600 mb-4 line-clamp-3">{item.description}</p>
              
              <div className="flex flex-wrap gap-2">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="tag-glass"
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
            <ReaderIcon className="h-16 w-16 text-bark-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-bark-600 mb-2">No items found</h3>
            <p className="text-bark-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {showContribute && (
        <div className="fixed inset-0 bg-bark-900/60 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-white/95 border border-bark-200 max-w-lg w-full p-6 relative shadow-organic animate-fade-in">
            <button
              className="absolute top-4 right-4 text-bark-400 hover:text-bark-600"
              onClick={() => setShowContribute(false)}
            >
              <Cross2Icon className="h-5 w-5" />
            </button>
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-leaf-100 text-leaf-700">
                <MagicWandIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-bark-800">Share knowledge</h3>
                <p className="text-bark-500 text-sm">Submit an article, pattern, or insight to our living library.</p>
              </div>
            </div>
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault()
                if (!contributionForm.title.trim() || !contributionForm.summary.trim()) {
                  setFormMessage({ type: 'error', text: 'Please add a title and summary before submitting.' })
                  return
                }

                const summaryWordCount = contributionForm.summary.trim().split(/\s+/).length
                const estimatedReadTime = `${Math.max(3, Math.min(20, Math.round(summaryWordCount / 35))) || 5} min`

                const newEntry = {
                  id: Date.now(),
                  title: contributionForm.title.trim(),
                  category: contributionForm.category,
                  author: 'Community Contributor',
                  readTime: estimatedReadTime,
                  rating: 4.7,
                  description: contributionForm.summary.trim(),
                  tags: [contributionForm.category, 'Community']
                }

                setItems(prev => [newEntry, ...prev])
                setContributionForm({ title: '', category: contributionForm.category, summary: '' })
                setFormMessage({ type: 'success', text: 'Thanks! Your contribution was added to the library.' })
                setTimeout(() => {
                  setShowContribute(false)
                  setFormMessage({ type: null, text: '' })
                }, 1200)
              }}
            >
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Title</label>
                <input
                  type="text"
                  className="input-organic w-full"
                  placeholder="What should we call it?"
                  value={contributionForm.title}
                  onChange={(e) => setContributionForm({ ...contributionForm, title: e.target.value })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Category</label>
                <select
                  className="input-organic w-full"
                  value={contributionForm.category}
                  onChange={(e) => setContributionForm({ ...contributionForm, category: e.target.value })}
                >
                  {categories
                    .filter(cat => cat !== 'All')
                    .map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-1">Summary</label>
                <textarea
                  className="input-organic w-full min-h-[120px]"
                  placeholder="Give us the quick overview"
                  value={contributionForm.summary}
                  onChange={(e) => setContributionForm({ ...contributionForm, summary: e.target.value })}
                />
              </div>
              {formMessage.type && (
                <p className={`text-sm ${formMessage.type === 'error' ? 'text-red-600' : 'text-leaf-700'}`}>
                  {formMessage.text}
                </p>
              )}
              <div className="flex items-center justify-between">
                <p className="text-sm text-bark-500">Submissions are reviewed within 1-2 days.</p>
                <button type="submit" className="btn-leaf flex items-center space-x-2">
                  <PaperPlaneIcon className="h-4 w-4" />
                  <span>Submit</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

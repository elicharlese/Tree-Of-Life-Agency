'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  DollarSign, 
  Clock, 
  Users, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calculator,
  TrendingUp
} from 'lucide-react'

interface SOWItem {
  id: string
  title: string
  description: string
  hours: number
  rate: number
  total: number
  status: 'pending' | 'in-progress' | 'completed'
  priority: 'low' | 'medium' | 'high'
}

const mockSOWItems: SOWItem[] = [
  {
    id: '1',
    title: 'Authentication System',
    description: 'Implement secure user authentication with multi-factor support',
    hours: 40,
    rate: 150,
    total: 6000,
    status: 'completed',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Project Dashboard',
    description: 'Build comprehensive dashboard with real-time metrics',
    hours: 60,
    rate: 150,
    total: 9000,
    status: 'in-progress',
    priority: 'high'
  },
  {
    id: '3',
    title: 'API Integration',
    description: 'Connect with external services and third-party APIs',
    hours: 35,
    rate: 150,
    total: 5250,
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Mobile Optimization',
    description: 'Responsive design and mobile-first approach',
    hours: 25,
    rate: 150,
    total: 3750,
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Testing & QA',
    description: 'Comprehensive testing suite and quality assurance',
    hours: 30,
    rate: 120,
    total: 3600,
    status: 'pending',
    priority: 'high'
  }
]

export default function SOWSection() {
  const [selectedItem, setSelectedItem] = useState<string | null>(null)
  
  const totalHours = mockSOWItems.reduce((sum, item) => sum + item.hours, 0)
  const totalCost = mockSOWItems.reduce((sum, item) => sum + item.total, 0)
  const completedItems = mockSOWItems.filter(item => item.status === 'completed')
  const progressPercentage = (completedItems.length / mockSOWItems.length) * 100

  const getStatusIcon = (status: SOWItem['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress': return <Clock className="w-4 h-4 text-yellow-500" />
      case 'pending': return <AlertCircle className="w-4 h-4 text-gray-500" />
    }
  }

  const getPriorityColor = (priority: SOWItem['priority']) => {
    switch (priority) {
      case 'high': return 'border-l-red-500'
      case 'medium': return 'border-l-yellow-500'
      case 'low': return 'border-l-green-500'
    }
  }

  return (
    <div className="w-full bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Statement of Work</h2>
            <p className="text-blue-100">
              Access transparent cost breakdown and master vibe coding prompt
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">${totalCost.toLocaleString()}</div>
            <div className="text-sm text-blue-100">{totalHours} total hours</div>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span>Project Progress</span>
            <span>{Math.round(progressPercentage)}% Complete</span>
          </div>
          <div className="w-full bg-blue-800 rounded-full h-2">
            <motion.div
              className="bg-white rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercentage}%` }}
              transition={{ duration: 1, delay: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="p-6 border-b border-dark-700">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="card">
            <div className="flex items-center gap-3">
              <DollarSign className="w-8 h-8 text-green-400" />
              <div>
                <p className="text-2xl font-bold text-green-400">
                  ${totalCost.toLocaleString()}
                </p>
                <p className="text-sm text-dark-400">Total Budget</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-2xl font-bold text-blue-400">{totalHours}h</p>
                <p className="text-sm text-dark-400">Estimated Hours</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-purple-400" />
              <div>
                <p className="text-2xl font-bold text-purple-400">3</p>
                <p className="text-sm text-dark-400">Team Members</p>
              </div>
            </div>
          </div>
          
          <div className="card">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-yellow-400" />
              <div>
                <p className="text-2xl font-bold text-yellow-400">
                  {Math.round(progressPercentage)}%
                </p>
                <p className="text-sm text-dark-400">Progress</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SOW Items */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <FileText className="w-5 h-5 text-primary-400" />
          Work Breakdown Structure
        </h3>
        
        <div className="space-y-4">
          {mockSOWItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`card hover:border-primary-500 transition-colors cursor-pointer border-l-4 ${getPriorityColor(item.priority)}`}
              onClick={() => setSelectedItem(selectedItem === item.id ? null : item.id)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {getStatusIcon(item.status)}
                  <div>
                    <h4 className="font-semibold">{item.title}</h4>
                    <p className="text-sm text-dark-400">{item.description}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="font-bold text-lg">${item.total.toLocaleString()}</div>
                  <div className="text-sm text-dark-400">
                    {item.hours}h × ${item.rate}/h
                  </div>
                </div>
              </div>
              
              {selectedItem === item.id && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 pt-4 border-t border-dark-700"
                >
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium mb-2">Deliverables</h5>
                      <ul className="text-sm text-dark-300 space-y-1">
                        <li>• Technical specification document</li>
                        <li>• Implementation code</li>
                        <li>• Unit tests and documentation</li>
                        <li>• Deployment configuration</li>
                      </ul>
                    </div>
                    <div>
                      <h5 className="font-medium mb-2">Timeline</h5>
                      <div className="text-sm text-dark-300">
                        <p>Estimated: {Math.ceil(item.hours / 8)} business days</p>
                        <p>Priority: <span className="capitalize">{item.priority}</span></p>
                        <p>Status: <span className="capitalize">{item.status.replace('-', ' ')}</span></p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="p-6 bg-dark-800 border-t border-dark-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-dark-400">
            Stay within budget whether its tokens or human dev hours with a bulletproof development plan.
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <Calculator className="w-4 h-4" />
              View Cost Timeline
            </button>
            <button className="btn-primary">
              View Latest Messages
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

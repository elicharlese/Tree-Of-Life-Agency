'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Calendar, 
  Clock, 
  CheckCircle, 
  Circle, 
  Users,
  GitBranch,
  Zap,
  Target,
  Flag
} from 'lucide-react'

interface Milestone {
  id: string
  title: string
  description: string
  date: string
  status: 'completed' | 'current' | 'upcoming'
  type: 'milestone' | 'release' | 'review'
  tasks: Task[]
}

interface Task {
  id: string
  title: string
  assignee: string
  status: 'completed' | 'in-progress' | 'pending'
  dueDate: string
}

const mockRoadmapData: Milestone[] = [
  {
    id: '1',
    title: 'Project Kickoff',
    description: 'Initial setup and team alignment',
    date: '2024-01-15',
    status: 'completed',
    type: 'milestone',
    tasks: [
      { id: '1-1', title: 'Requirements gathering', assignee: 'Sarah', status: 'completed', dueDate: '2024-01-10' },
      { id: '1-2', title: 'Tech stack selection', assignee: 'Mike', status: 'completed', dueDate: '2024-01-12' },
      { id: '1-3', title: 'Project setup', assignee: 'Alex', status: 'completed', dueDate: '2024-01-15' }
    ]
  },
  {
    id: '2',
    title: 'MVP Development',
    description: 'Core functionality implementation',
    date: '2024-02-28',
    status: 'current',
    type: 'release',
    tasks: [
      { id: '2-1', title: 'Authentication system', assignee: 'Sarah', status: 'completed', dueDate: '2024-02-05' },
      { id: '2-2', title: 'Dashboard UI', assignee: 'Lisa', status: 'in-progress', dueDate: '2024-02-15' },
      { id: '2-3', title: 'API endpoints', assignee: 'Emily', status: 'in-progress', dueDate: '2024-02-20' },
      { id: '2-4', title: 'Database schema', assignee: 'Mike', status: 'pending', dueDate: '2024-02-25' }
    ]
  },
  {
    id: '3',
    title: 'Beta Testing',
    description: 'Internal testing and feedback collection',
    date: '2024-03-15',
    status: 'upcoming',
    type: 'review',
    tasks: [
      { id: '3-1', title: 'Test plan creation', assignee: 'Alex', status: 'pending', dueDate: '2024-03-01' },
      { id: '3-2', title: 'Bug fixes', assignee: 'Team', status: 'pending', dueDate: '2024-03-10' },
      { id: '3-3', title: 'Performance optimization', assignee: 'Emily', status: 'pending', dueDate: '2024-03-15' }
    ]
  },
  {
    id: '4',
    title: 'Production Release',
    description: 'Full deployment and go-live',
    date: '2024-04-01',
    status: 'upcoming',
    type: 'release',
    tasks: [
      { id: '4-1', title: 'Production deployment', assignee: 'Alex', status: 'pending', dueDate: '2024-03-28' },
      { id: '4-2', title: 'Monitoring setup', assignee: 'Mike', status: 'pending', dueDate: '2024-03-30' },
      { id: '4-3', title: 'Documentation', assignee: 'Sarah', status: 'pending', dueDate: '2024-04-01' }
    ]
  }
]

export default function ProjectRoadmap() {
  const [selectedMilestone, setSelectedMilestone] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'timeline' | 'kanban'>('timeline')

  const getMilestoneIcon = (type: Milestone['type']) => {
    switch (type) {
      case 'milestone': return Flag
      case 'release': return Zap
      case 'review': return Target
      default: return Circle
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-500 border-green-500'
      case 'current': case 'in-progress': return 'text-yellow-500 border-yellow-500'
      case 'upcoming': case 'pending': return 'text-gray-500 border-gray-500'
      default: return 'text-gray-500 border-gray-500'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  return (
    <div className="w-full bg-dark-900 rounded-xl border border-dark-700 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-teal-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Project Timeline</h2>
            <p className="text-green-100">
              Track your project timeline with interactive roadmaps
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm text-green-100">From milestones to user stories</div>
              <div className="text-lg font-semibold">See your entire development journey</div>
            </div>
            <button className="btn-primary bg-white text-green-600 hover:bg-green-50">
              Unlock Roadmap
            </button>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="p-4 border-b border-dark-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'timeline' ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300'
              }`}
            >
              Timeline View
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                viewMode === 'kanban' ? 'bg-primary-600 text-white' : 'bg-dark-800 text-dark-300'
              }`}
            >
              Kanban View
            </button>
          </div>
          <div className="flex items-center gap-2 text-sm text-dark-400">
            <Calendar className="w-4 h-4" />
            <span>Updated 2 hours ago</span>
          </div>
        </div>
      </div>

      {/* Timeline Content */}
      <div className="p-6">
        {viewMode === 'timeline' ? (
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-dark-600"></div>
            
            <div className="space-y-8">
              {mockRoadmapData.map((milestone, index) => {
                const Icon = getMilestoneIcon(milestone.type)
                const isSelected = selectedMilestone === milestone.id
                
                return (
                  <motion.div
                    key={milestone.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="relative"
                  >
                    {/* Timeline Node */}
                    <div className={`absolute left-6 w-4 h-4 rounded-full border-2 bg-dark-900 ${getStatusColor(milestone.status)}`}>
                      <Icon className="w-2 h-2 absolute top-1 left-1" />
                    </div>
                    
                    {/* Content */}
                    <div className="ml-16">
                      <div 
                        className={`card hover:border-primary-500 transition-colors cursor-pointer ${
                          isSelected ? 'border-primary-500' : ''
                        }`}
                        onClick={() => setSelectedMilestone(isSelected ? null : milestone.id)}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div>
                            <h3 className="text-lg font-semibold">{milestone.title}</h3>
                            <p className="text-sm text-dark-400">{milestone.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-sm font-medium">{formatDate(milestone.date)}</div>
                            <div className={`text-xs capitalize ${getStatusColor(milestone.status)}`}>
                              {milestone.status}
                            </div>
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div className="mb-3">
                          <div className="flex justify-between text-xs mb-1">
                            <span>Progress</span>
                            <span>
                              {milestone.tasks.filter(t => t.status === 'completed').length}/
                              {milestone.tasks.length} tasks
                            </span>
                          </div>
                          <div className="w-full bg-dark-700 rounded-full h-1.5">
                            <div 
                              className="bg-primary-500 h-1.5 rounded-full transition-all duration-500"
                              style={{ 
                                width: `${(milestone.tasks.filter(t => t.status === 'completed').length / milestone.tasks.length) * 100}%` 
                              }}
                            />
                          </div>
                        </div>
                        
                        {isSelected && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="border-t border-dark-700 pt-4"
                          >
                            <h4 className="font-medium mb-3">Tasks</h4>
                            <div className="space-y-2">
                              {milestone.tasks.map((task) => (
                                <div key={task.id} className="flex items-center justify-between p-2 bg-dark-800 rounded-lg">
                                  <div className="flex items-center gap-3">
                                    {task.status === 'completed' ? (
                                      <CheckCircle className="w-4 h-4 text-green-500" />
                                    ) : task.status === 'in-progress' ? (
                                      <Clock className="w-4 h-4 text-yellow-500" />
                                    ) : (
                                      <Circle className="w-4 h-4 text-gray-500" />
                                    )}
                                    <span className="text-sm">{task.title}</span>
                                  </div>
                                  <div className="flex items-center gap-2 text-xs text-dark-400">
                                    <Users className="w-3 h-3" />
                                    <span>{task.assignee}</span>
                                    <span>•</span>
                                    <span>{formatDate(task.dueDate)}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        ) : (
          /* Kanban View */
          <div className="grid md:grid-cols-3 gap-6">
            {['pending', 'in-progress', 'completed'].map((status) => (
              <div key={status} className="card">
                <h3 className="font-semibold mb-4 capitalize flex items-center gap-2">
                  {status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                  {status === 'in-progress' && <Clock className="w-4 h-4 text-yellow-500" />}
                  {status === 'pending' && <Circle className="w-4 h-4 text-gray-500" />}
                  {status.replace('-', ' ')}
                </h3>
                <div className="space-y-3">
                  {mockRoadmapData
                    .filter(m => m.status === status || (status === 'pending' && m.status === 'upcoming'))
                    .map((milestone) => (
                      <div key={milestone.id} className="p-3 bg-dark-800 rounded-lg">
                        <h4 className="font-medium mb-1">{milestone.title}</h4>
                        <p className="text-xs text-dark-400 mb-2">{formatDate(milestone.date)}</p>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-dark-700 rounded-full h-1">
                            <div 
                              className="bg-primary-500 h-1 rounded-full"
                              style={{ 
                                width: `${(milestone.tasks.filter(t => t.status === 'completed').length / milestone.tasks.length) * 100}%` 
                              }}
                            />
                          </div>
                          <span className="text-xs text-dark-400">
                            {milestone.tasks.filter(t => t.status === 'completed').length}/{milestone.tasks.length}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 bg-dark-800 border-t border-dark-700">
        <div className="flex items-center justify-between">
          <div className="text-sm text-dark-400">
            From milestones to user stories - see your entire development journey mapped out with realistic timelines.
          </div>
          <div className="flex items-center gap-4">
            <button className="btn-secondary flex items-center gap-2">
              <GitBranch className="w-4 h-4" />
              View Git History
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

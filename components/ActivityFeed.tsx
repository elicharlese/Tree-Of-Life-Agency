'use client'

import { motion } from 'framer-motion'
import { 
  Phone,
  Mail,
  Calendar,
  FileText,
  CheckCircle,
  Clock,
  User
} from 'lucide-react'
import { Activity } from '@/types/crm'
import { getActivities } from '@/lib/crm'

interface ActivityFeedProps {
  relatedTo?: {
    type: 'customer' | 'lead' | 'deal' | 'contact'
    id: string
  }
  limit?: number
}

export default function ActivityFeed({ relatedTo, limit = 10 }: ActivityFeedProps) {
  const allActivities = getActivities()
  const activities = relatedTo 
    ? allActivities.filter(activity => 
        activity.relatedTo.type === relatedTo.type && activity.relatedTo.id === relatedTo.id
      ).slice(0, limit)
    : allActivities.slice(0, limit)

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'call': return Phone
      case 'email': return Mail
      case 'meeting': return Calendar
      case 'task': return CheckCircle
      case 'note': return FileText
      default: return FileText
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'call': return 'text-blue-400'
      case 'email': return 'text-green-400'
      case 'meeting': return 'text-purple-400'
      case 'task': return 'text-yellow-400'
      case 'note': return 'text-gray-400'
      default: return 'text-gray-400'
    }
  }

  const getStatusColor = (status: Activity['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-600'
      case 'pending': return 'bg-yellow-600'
      case 'cancelled': return 'bg-red-600'
      default: return 'bg-gray-600'
    }
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => {
        const IconComponent = getActivityIcon(activity.type)
        return (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-dark-700 rounded-lg p-4 hover:bg-dark-600 transition-colors"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-full bg-dark-600 ${getActivityColor(activity.type)}`}>
                <IconComponent className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{activity.subject}</h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium text-white ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                </div>
                
                {activity.description && (
                  <p className="text-sm text-gray-300 mb-3">{activity.description}</p>
                )}
                
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <User className="w-3 h-3" />
                      <span>{activity.assignedTo}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>{activity.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                  {activity.dueDate && (
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>Due: {activity.dueDate.toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )
      })}
      
      {activities.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No activities found</p>
        </div>
      )}
    </div>
  )
}

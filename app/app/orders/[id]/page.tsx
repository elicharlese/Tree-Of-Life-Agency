'use client'

import { useState, useEffect } from 'react'
import { 
  ArrowLeft,
  TreePine,
  Clock,
  Users,
  CheckCircle,
  MessageSquare,
  FileText,
  Download,
  Star
} from 'lucide-react'
import Link from 'next/link'
import { getOrderById, Order } from '../../../../libs/shared-utils/orders'

interface OrderDetailPageProps {
  params: { id: string }
}

export default function OrderDetailPage({ params }: OrderDetailPageProps) {
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchOrder = async () => {
      const orderData = getOrderById(params.id)
      setOrder(orderData || null)
      setLoading(false)
    }
    fetchOrder()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-leaf-500"></div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center">
        <div className="card-organic p-8 text-center">
          <h1 className="text-2xl font-serif text-bark-800 mb-4">Order Not Found</h1>
          <p className="text-bark-600 mb-6">The order you&apos;re looking for does not exist.</p>
          <Link href="/app" className="btn-leaf">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getProgressPercentage = (status: string) => {
    switch (status) {
      case 'pending':
        return 10
      case 'approved':
        return 25
      case 'in_progress':
        return 60
      case 'completed':
        return 100
      default:
        return 0
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/app" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Dashboard
              </Link>
              <div className="flex items-center">
                <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Order Details</h1>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                {order.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-8">
            {/* Order Overview */}
            <div className="card-organic p-6">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-serif text-bark-800 mb-2">
                    {order.projectName || `Order ${order.id}`}
                  </h2>
                  <p className="text-bark-600">Order ID: {order.id}</p>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-leaf-600 mb-1">
                    ${order.totalAmount.toLocaleString()}
                  </div>
                  <div className="text-bark-500">{order.estimatedTimeline}</div>
                </div>
              </div>

              {order.description && (
                <div className="mb-6">
                  <h3 className="font-semibold text-bark-800 mb-2">Project Description</h3>
                  <p className="text-bark-600">{order.description}</p>
                </div>
              )}

              {/* Progress Bar */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-bark-700">Progress</span>
                  <span className="text-sm text-bark-500">{getProgressPercentage(order.status)}%</span>
                </div>
                <div className="w-full bg-bark-200 rounded-full h-2">
                  <div 
                    className="bg-leaf-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${getProgressPercentage(order.status)}%` }}
                  ></div>
                </div>
              </div>

              {/* Order Items */}
              <div>
                <h3 className="font-semibold text-bark-800 mb-4">Services Ordered</h3>
                <div className="space-y-4">
                  {order.items.map((item, index) => (
                    <div key={index} className="border border-bark-200 rounded-organic p-4">
                      <div className="flex items-start justify-between mb-3">
                        <h4 className="font-medium text-bark-800">{item.serviceName}</h4>
                        <span className="font-semibold text-leaf-600">${item.price.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-bark-600 mb-3">
                        <span className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {item.timeline}
                        </span>
                        <span>{item.features.length} features included</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {item.features.map((feature, featureIndex) => (
                          <span
                            key={featureIndex}
                            className="px-2 py-1 bg-leaf-100 text-leaf-700 rounded text-xs"
                          >
                            {feature}
                          </span>
                        ))}
                      </div>
                      {item.customizations && (
                        <div className="mt-3 p-3 bg-bark-50 rounded">
                          <p className="text-sm text-bark-600">
                            <strong>Customizations:</strong> {item.customizations}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Milestones */}
            {order.milestones && order.milestones.length > 0 && (
              <div className="card-organic p-6">
                <h3 className="text-xl font-semibold text-bark-800 mb-4">Project Milestones</h3>
                <div className="space-y-4">
                  {order.milestones.map((milestone, index) => (
                    <div key={milestone.id} className="flex items-start space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        milestone.status === 'completed' 
                          ? 'bg-green-100 text-green-600' 
                          : milestone.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-600'
                          : 'bg-bark-100 text-bark-600'
                      }`}>
                        {milestone.status === 'completed' ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <span className="text-xs font-bold">{index + 1}</span>
                        )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-bark-800">{milestone.title}</h4>
                        <p className="text-sm text-bark-600 mb-2">{milestone.description}</p>
                        <div className="flex items-center space-x-4 text-xs text-bark-500">
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                          <span>{milestone.progress}% complete</span>
                        </div>
                        {milestone.progress > 0 && (
                          <div className="w-full bg-bark-200 rounded-full h-1 mt-2">
                            <div 
                              className="bg-leaf-500 h-1 rounded-full"
                              style={{ width: `${milestone.progress}%` }}
                            ></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Order Info */}
            <div className="card-organic p-6">
              <h3 className="font-semibold text-bark-800 mb-4">Order Information</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-bark-600">Customer:</span>
                  <span className="font-medium text-bark-800">{order.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bark-600">Email:</span>
                  <span className="font-medium text-bark-800">{order.customerEmail}</span>
                </div>
                {order.companyName && (
                  <div className="flex justify-between">
                    <span className="text-bark-600">Company:</span>
                    <span className="font-medium text-bark-800">{order.companyName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-bark-600">Created:</span>
                  <span className="font-medium text-bark-800">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-bark-600">Priority:</span>
                  <span className={`font-medium capitalize ${
                    order.priority === 'high' ? 'text-red-600' :
                    order.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {order.priority}
                  </span>
                </div>
              </div>
            </div>

            {/* Assigned Team */}
            {order.assignedDevelopers && order.assignedDevelopers.length > 0 && (
              <div className="card-organic p-6">
                <h3 className="font-semibold text-bark-800 mb-4">Assigned Team</h3>
                <div className="space-y-3">
                  {order.assignedDevelopers.map((developerId, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-leaf-100 rounded-full flex items-center justify-center">
                        <Users className="w-4 h-4 text-leaf-600" />
                      </div>
                      <span className="text-bark-800">{developerId}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tech Stack */}
            {order.techStack && order.techStack.length > 0 && (
              <div className="card-organic p-6">
                <h3 className="font-semibold text-bark-800 mb-4">Technology Stack</h3>
                <div className="flex flex-wrap gap-2">
                  {order.techStack.map((tech, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-wisdom-100 text-wisdom-700 rounded text-xs"
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Actions */}
            <div className="card-organic p-6">
              <h3 className="font-semibold text-bark-800 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full btn-secondary text-left flex items-center">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Contact Support
                </button>
                <button className="w-full btn-secondary text-left flex items-center">
                  <FileText className="w-4 h-4 mr-2" />
                  View Contract
                </button>
                <button className="w-full btn-secondary text-left flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Download Invoice
                </button>
                {order.status === 'completed' && (
                  <button className="w-full btn-leaf text-left flex items-center">
                    <Star className="w-4 h-4 mr-2" />
                    Leave Review
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Edit, Send, AlertCircle, CheckCircle, Clock } from 'feather-icons-react'
import Link from 'next/link'
import { getOrders, Order } from '../../../libs/shared-utils/orders'
import { ChatBubble } from '../../../libs/shared-ui/components/ChatBubble'

interface RevisionRequest {
  orderId: string
  description: string
  priority: 'low' | 'medium' | 'high'
  status: 'pending' | 'approved' | 'completed'
  createdAt: Date
}

export default function RevisePage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [revisionDescription, setRevisionDescription] = useState('')
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium')
  const [revisions, setRevisions] = useState<RevisionRequest[]>([])

  useEffect(() => {
    const allOrders = getOrders()
    setOrders(allOrders.filter(o => o.status === 'in_progress' || o.status === 'completed'))
  }, [])

  const handleSubmitRevision = () => {
    if (!selectedOrder || !revisionDescription.trim()) {
      alert('Please select an order and provide a description')
      return
    }

    const newRevision: RevisionRequest = {
      orderId: selectedOrder,
      description: revisionDescription,
      priority,
      status: 'pending',
      createdAt: new Date()
    }

    setRevisions([...revisions, newRevision])
    setRevisionDescription('')
    setSelectedOrder('')
    setPriority('medium')
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 border-red-300'
      case 'medium': return 'bg-wisdom-100 text-wisdom-800 border-wisdom-300'
      case 'low': return 'bg-bark-100 text-bark-800 border-bark-300'
      default: return 'bg-bark-100 text-bark-800 border-bark-300'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-leaf-100 text-leaf-800 border-leaf-300'
      case 'approved': return 'bg-wisdom-100 text-wisdom-800 border-wisdom-300'
      case 'pending': return 'bg-bark-100 text-bark-800 border-bark-300'
      default: return 'bg-bark-100 text-bark-800 border-bark-300'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-bark-900">Request Revisions</h1>
              <p className="text-bark-600 mt-1">Request changes to your projects</p>
            </div>
            <Link
              href="/app"
              className="bg-bark-600 text-white px-6 py-3 font-medium hover:bg-bark-700 transition-colors"
            >
              Back to Dashboard
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* New Revision Form */}
          <div className="bg-white border border-bark-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-bark-900 mb-6 flex items-center space-x-2">
              <Edit className="w-6 h-6 text-leaf-600" />
              <span>New Revision Request</span>
            </h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Select Order *
                </label>
                <select
                  value={selectedOrder}
                  onChange={(e) => setSelectedOrder(e.target.value)}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                >
                  <option value="">Choose an order...</option>
                  {orders.map((order) => (
                    <option key={order.id} value={order.id}>
                      {order.projectName || order.id} - {order.status}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Priority Level
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPriority(p)}
                      className={`px-4 py-2 font-medium transition-colors ${
                        priority === p
                          ? 'bg-leaf-600 text-white'
                          : 'bg-bark-100 text-bark-700 hover:bg-bark-200'
                      }`}
                    >
                      {p.charAt(0).toUpperCase() + p.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Revision Description *
                </label>
                <textarea
                  value={revisionDescription}
                  onChange={(e) => setRevisionDescription(e.target.value)}
                  placeholder="Describe the changes you'd like to see..."
                  rows={6}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                />
              </div>

              <button
                onClick={handleSubmitRevision}
                className="w-full bg-leaf-600 text-white px-6 py-3 font-medium hover:bg-leaf-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Revision Request</span>
              </button>
            </div>
          </div>

          {/* Revision History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-bark-900 mb-4">Revision History</h2>
            
            {revisions.length === 0 ? (
              <div className="bg-white border border-bark-200 p-12 text-center shadow-sm">
                <AlertCircle className="w-16 h-16 text-bark-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-bark-800 mb-2">No revisions yet</h3>
                <p className="text-bark-600 text-sm">Your revision requests will appear here</p>
              </div>
            ) : (
              revisions.map((revision, index) => {
                const order = orders.find(o => o.id === revision.orderId)
                return (
                  <div key={index} className="bg-white border border-bark-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-bark-900 mb-1">
                          {order?.projectName || revision.orderId}
                        </h3>
                        <p className="text-sm text-bark-600">
                          {revision.createdAt.toLocaleDateString()} at {revision.createdAt.toLocaleTimeString()}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className={`px-3 py-1 text-xs font-medium border ${getPriorityColor(revision.priority)}`}>
                          {revision.priority.toUpperCase()}
                        </span>
                        <span className={`px-3 py-1 text-xs font-medium border ${getStatusColor(revision.status)}`}>
                          {revision.status.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <p className="text-bark-700 mb-4">{revision.description}</p>

                    <div className="flex items-center space-x-2 text-sm text-bark-600">
                      {revision.status === 'completed' && <CheckCircle className="w-4 h-4 text-leaf-600" />}
                      {revision.status === 'approved' && <Clock className="w-4 h-4 text-wisdom-600" />}
                      {revision.status === 'pending' && <AlertCircle className="w-4 h-4 text-bark-600" />}
                      <span>
                        {revision.status === 'completed' && 'Revision completed'}
                        {revision.status === 'approved' && 'Revision approved, in progress'}
                        {revision.status === 'pending' && 'Waiting for approval'}
                      </span>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      <ChatBubble position="bottom-right" />
    </div>
  )
}

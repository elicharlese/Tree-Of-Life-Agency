'use client'

import { useState, useEffect } from 'react'
import { RotateCcw, Send, AlertTriangle, CheckCircle, XCircle } from 'feather-icons-react'
import Link from 'next/link'
import { getOrders, Order } from '../../../libs/shared-utils/orders'
import { ChatBubble } from '../../../libs/shared-ui/components/ChatBubble'

interface ReturnRequest {
  orderId: string
  reason: string
  description: string
  status: 'pending' | 'approved' | 'rejected' | 'completed'
  createdAt: Date
}

export default function ReturnPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<string>('')
  const [reason, setReason] = useState<string>('')
  const [description, setDescription] = useState('')
  const [returns, setReturns] = useState<ReturnRequest[]>([])

  useEffect(() => {
    const allOrders = getOrders()
    // Only show completed orders for returns
    setOrders(allOrders.filter(o => o.status === 'completed'))
  }, [])

  const handleSubmitReturn = () => {
    if (!selectedOrder || !reason || !description.trim()) {
      alert('Please fill in all required fields')
      return
    }

    const newReturn: ReturnRequest = {
      orderId: selectedOrder,
      reason,
      description,
      status: 'pending',
      createdAt: new Date()
    }

    setReturns([...returns, newReturn])
    setDescription('')
    setSelectedOrder('')
    setReason('')
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-leaf-100 text-leaf-800 border-leaf-300'
      case 'approved': return 'bg-wisdom-100 text-wisdom-800 border-wisdom-300'
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300'
      case 'pending': return 'bg-bark-100 text-bark-800 border-bark-300'
      default: return 'bg-bark-100 text-bark-800 border-bark-300'
    }
  }

  const returnReasons = [
    'Not as described',
    'Quality issues',
    'Missing features',
    'Technical problems',
    'Changed requirements',
    'Other'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-bark-900">Returns & Refunds</h1>
              <p className="text-bark-600 mt-1">Request returns for completed orders</p>
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
        {/* Warning Banner */}
        <div className="bg-wisdom-50 border border-wisdom-300 p-4 mb-8 flex items-start space-x-3">
          <AlertTriangle className="w-6 h-6 text-wisdom-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-wisdom-900 mb-1">Return Policy</h3>
            <p className="text-sm text-wisdom-800">
              Returns are available for completed orders within 30 days. All return requests are reviewed by our team. 
              Refunds are processed within 5-7 business days after approval.
            </p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* New Return Form */}
          <div className="bg-white border border-bark-200 p-6 shadow-sm">
            <h2 className="text-xl font-bold text-bark-900 mb-6 flex items-center space-x-2">
              <RotateCcw className="w-6 h-6 text-leaf-600" />
              <span>New Return Request</span>
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
                      {order.projectName || order.id} - ${(order.totalAmount || order.total || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Reason for Return *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                >
                  <option value="">Select a reason...</option>
                  {returnReasons.map((r) => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Detailed Description *
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Please provide details about why you're requesting a return..."
                  rows={6}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                />
              </div>

              <button
                onClick={handleSubmitReturn}
                className="w-full bg-leaf-600 text-white px-6 py-3 font-medium hover:bg-leaf-700 transition-colors flex items-center justify-center space-x-2"
              >
                <Send className="w-5 h-5" />
                <span>Submit Return Request</span>
              </button>
            </div>
          </div>

          {/* Return History */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-bark-900 mb-4">Return History</h2>
            
            {returns.length === 0 ? (
              <div className="bg-white border border-bark-200 p-12 text-center shadow-sm">
                <RotateCcw className="w-16 h-16 text-bark-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-bark-800 mb-2">No return requests</h3>
                <p className="text-bark-600 text-sm">Your return requests will appear here</p>
              </div>
            ) : (
              returns.map((returnReq, index) => {
                const order = orders.find(o => o.id === returnReq.orderId)
                return (
                  <div key={index} className="bg-white border border-bark-200 p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-bark-900 mb-1">
                          {order?.projectName || returnReq.orderId}
                        </h3>
                        <p className="text-sm text-bark-600 mb-2">
                          {returnReq.createdAt.toLocaleDateString()} at {returnReq.createdAt.toLocaleTimeString()}
                        </p>
                        <span className="inline-block px-3 py-1 bg-bark-100 text-bark-700 text-xs font-medium border border-bark-300">
                          {returnReq.reason}
                        </span>
                      </div>
                      <span className={`px-3 py-1 text-xs font-medium border ${getStatusColor(returnReq.status)}`}>
                        {returnReq.status.toUpperCase()}
                      </span>
                    </div>

                    <p className="text-bark-700 mb-4">{returnReq.description}</p>

                    <div className="flex items-center space-x-2 text-sm">
                      {returnReq.status === 'completed' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-leaf-600" />
                          <span className="text-leaf-700 font-medium">Return completed, refund processed</span>
                        </>
                      )}
                      {returnReq.status === 'approved' && (
                        <>
                          <CheckCircle className="w-4 h-4 text-wisdom-600" />
                          <span className="text-wisdom-700 font-medium">Return approved, processing refund</span>
                        </>
                      )}
                      {returnReq.status === 'rejected' && (
                        <>
                          <XCircle className="w-4 h-4 text-red-600" />
                          <span className="text-red-700 font-medium">Return request rejected</span>
                        </>
                      )}
                      {returnReq.status === 'pending' && (
                        <>
                          <AlertTriangle className="w-4 h-4 text-bark-600" />
                          <span className="text-bark-700 font-medium">Under review</span>
                        </>
                      )}
                    </div>

                    {order && (
                      <div className="mt-4 pt-4 border-t border-bark-200">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-bark-600">Order Value:</span>
                          <span className="font-bold text-bark-900">
                            ${(order.totalAmount || order.total || 0).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    )}
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

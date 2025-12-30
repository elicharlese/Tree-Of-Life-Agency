'use client'

import { useState, useEffect } from 'react'
import { Truck, CheckCircle, Clock, Package, MapPin } from 'feather-icons-react'
import Link from 'next/link'
import { getOrders, Order } from '../../../libs/shared-utils/orders'
import { ChatBubble } from '../../../libs/shared-ui/components/ChatBubble'

export default function DeliveryPage() {
  const [orders, setOrders] = useState<Order[]>([])

  useEffect(() => {
    // Filter for completed orders (delivered)
    const allOrders = getOrders()
    setOrders(allOrders.filter(o => o.status === 'completed' || o.status === 'in_progress'))
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-bark-900">Delivery Tracking</h1>
              <p className="text-bark-600 mt-1">Track your project deliveries</p>
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
        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-leaf-500 to-leaf-600 p-6 text-white shadow-lg">
            <CheckCircle className="w-8 h-8 mb-3" />
            <div className="text-3xl font-bold mb-1">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-leaf-100 text-sm">Delivered</div>
          </div>

          <div className="bg-gradient-to-br from-wisdom-500 to-wisdom-600 p-6 text-white shadow-lg">
            <Truck className="w-8 h-8 mb-3" />
            <div className="text-3xl font-bold mb-1">
              {orders.filter(o => o.status === 'in_progress').length}
            </div>
            <div className="text-wisdom-100 text-sm">In Transit</div>
          </div>

          <div className="bg-gradient-to-br from-bark-500 to-bark-600 p-6 text-white shadow-lg">
            <Package className="w-8 h-8 mb-3" />
            <div className="text-3xl font-bold mb-1">{orders.length}</div>
            <div className="text-bark-100 text-sm">Total Deliveries</div>
          </div>
        </div>

        {/* Delivery Timeline */}
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white border border-bark-200 p-12 text-center shadow-sm">
              <Truck className="w-16 h-16 text-bark-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-bark-800 mb-2">No deliveries yet</h3>
              <p className="text-bark-600">Your completed orders will appear here</p>
            </div>
          ) : (
            orders.map((order) => (
              <div key={order.id} className="bg-white border border-bark-200 p-6 shadow-sm">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-bark-900 mb-2">{order.projectName}</h3>
                    <p className="text-bark-600 font-mono text-sm">Order #{order.id}</p>
                  </div>
                  <span className={`px-4 py-2 font-medium ${
                    order.status === 'completed' 
                      ? 'bg-leaf-100 text-leaf-800 border border-leaf-300' 
                      : 'bg-wisdom-100 text-wisdom-800 border border-wisdom-300'
                  }`}>
                    {order.status === 'completed' ? 'Delivered' : 'In Progress'}
                  </span>
                </div>

                {/* Delivery Timeline */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 bg-leaf-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-bark-900">Order Placed</h4>
                      <p className="text-sm text-bark-600">
                        {new Date(order.createdAt).toLocaleDateString()} at {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 flex items-center justify-center ${
                        order.status === 'in_progress' || order.status === 'completed'
                          ? 'bg-leaf-500'
                          : 'bg-bark-300'
                      }`}>
                        <Clock className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-bark-900">In Progress</h4>
                      <p className="text-sm text-bark-600">
                        {order.status === 'in_progress' || order.status === 'completed'
                          ? 'Development in progress'
                          : 'Waiting to start'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 flex items-center justify-center ${
                        order.status === 'completed'
                          ? 'bg-leaf-500'
                          : 'bg-bark-300'
                      }`}>
                        <Truck className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-bark-900">Delivered</h4>
                      <p className="text-sm text-bark-600">
                        {order.status === 'completed'
                          ? `Delivered on ${new Date(order.updatedAt).toLocaleDateString()}`
                          : 'Pending delivery'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-bark-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2 text-bark-600">
                      <MapPin className="w-4 h-4" />
                      <span className="text-sm">Estimated: {order.estimatedTimeline}</span>
                    </div>
                    <Link
                      href={`/app/orders/${order.id}`}
                      className="text-leaf-600 hover:text-leaf-700 font-medium text-sm"
                    >
                      View Order Details →
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <ChatBubble position="bottom-right" />
    </div>
  )
}

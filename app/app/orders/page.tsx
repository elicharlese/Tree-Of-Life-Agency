'use client'

import { useState, useEffect } from 'react'
import { Package, Filter, Search, Eye, Calendar, DollarSign } from 'feather-icons-react'
import Link from 'next/link'
import { getOrders, Order } from '../../../libs/shared-utils/orders'
import { ChatBubble } from '../../../libs/shared-ui/components/ChatBubble'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    setOrders(getOrders())
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-leaf-100 text-leaf-800 border-leaf-300'
      case 'in_progress': return 'bg-wisdom-100 text-wisdom-800 border-wisdom-300'
      case 'pending': return 'bg-bark-100 text-bark-800 border-bark-300'
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-300'
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
              <h1 className="text-3xl font-bold text-bark-900">All Orders</h1>
              <p className="text-bark-600 mt-1">View and manage your orders</p>
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
        {/* Search and Filter */}
        <div className="bg-white border border-bark-200 p-4 mb-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bark-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-bark-300 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-leaf-500"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-bark-600" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {filteredOrders.length === 0 ? (
            <div className="col-span-2 bg-white border border-bark-200 p-12 text-center shadow-sm">
              <Package className="w-16 h-16 text-bark-300 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-bark-800 mb-2">No orders found</h3>
              <p className="text-bark-600">Try adjusting your search or filters</p>
            </div>
          ) : (
            filteredOrders.map((order) => (
              <div key={order.id} className="bg-white border border-bark-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-bark-900 mb-2">{order.projectName || order.id}</h3>
                    <span className={`inline-block px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                      {order.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-leaf-600">
                      ${(order.totalAmount || order.total || 0).toLocaleString()}
                    </div>
                  </div>
                </div>

                <p className="text-bark-600 mb-4 text-sm">{order.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-bark-200">
                  <div className="flex items-center space-x-4 text-sm text-bark-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Package className="w-4 h-4" />
                      <span>{order.items.length} items</span>
                    </div>
                  </div>
                  <Link
                    href={`/app/orders/${order.id}`}
                    className="flex items-center space-x-2 bg-leaf-600 text-white px-4 py-2 hover:bg-leaf-700 transition-colors text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View</span>
                  </Link>
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

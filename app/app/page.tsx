'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Clock,
  DollarSign,
  Users,
  CheckCircle,
  AlertCircle,
  Calendar,
  Eye
} from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui'
import { PageHeader } from '@/components/layout/PageHeader'
import { SearchFilter } from '@/components/layout/SearchFilter'
import { getOrders } from '@/lib/orders'
import { Order } from '@/types/order'

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  useEffect(() => {
    // In a real app, this would filter by customer ID from authentication
    setOrders(getOrders())
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in_progress':
        return <Clock className="w-4 h-4 text-blue-500" />
      case 'pending':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-500" />
    }
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

  const filterOptions = [
    { value: 'all', label: 'All Status' },
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <PageHeader 
        title="My Orders"
        showBackButton={false}
        actionButton={{
          label: "Place New Order",
          href: "/order",
          variant: "leaf"
        }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <div className="card-organic p-6 text-center">
            <div className="w-12 h-12 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle className="w-6 h-6 text-leaf-600" />
            </div>
            <div className="text-2xl font-bold text-bark-800 mb-1">
              {orders.filter(o => o.status === 'completed').length}
            </div>
            <div className="text-bark-600 text-sm">Completed</div>
          </div>
          <div className="card-organic p-6 text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Clock className="w-6 h-6 text-blue-600" />
            </div>
            <div className="text-2xl font-bold text-bark-800 mb-1">
              {orders.filter(o => o.status === 'in_progress').length}
            </div>
            <div className="text-bark-600 text-sm">In Progress</div>
          </div>
          <div className="card-organic p-6 text-center">
            <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
            </div>
            <div className="text-2xl font-bold text-bark-800 mb-1">
              {orders.filter(o => o.status === 'pending').length}
            </div>
            <div className="text-bark-600 text-sm">Pending</div>
          </div>
          <div className="card-organic p-6 text-center">
            <div className="w-12 h-12 bg-wisdom-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="w-6 h-6 text-wisdom-600" />
            </div>
            <div className="text-2xl font-bold text-bark-800 mb-1">
              ${orders.reduce((total, order) => total + order.totalAmount, 0).toLocaleString()}
            </div>
            <div className="text-bark-600 text-sm">Total Value</div>
          </div>
        </div>

        {/* Search and Filters */}
        <SearchFilter
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          filterValue={statusFilter}
          onFilterChange={setStatusFilter}
          filterOptions={filterOptions}
          placeholder="Search orders..."
        />

        {/* Orders List */}
        <div className="space-y-6">
          {filteredOrders.length === 0 ? (
            <div className="card-organic p-12 text-center">
              <div className="w-16 h-16 bg-bark-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-8 h-8 text-bark-400" />
              </div>
              <h3 className="text-xl font-semibold text-bark-800 mb-2">No orders found</h3>
              <p className="text-bark-600 mb-6">
                {orders.length === 0 
                  ? "You haven't placed any orders yet."
                  : "No orders match your current search criteria."
                }
              </p>
              {orders.length === 0 && (
                <Link href="/order">
                  <Button variant="leaf">Place Your First Order</Button>
                </Link>
              )}
            </div>
          ) : (
            filteredOrders.map((order, index) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="card-organic p-6 hover:shadow-leaf"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-bark-800">
                        {order.projectName || `Order ${order.id}`}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {order.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-bark-600 mb-2">Order ID: {order.id}</p>
                    <p className="text-bark-500 text-sm">{order.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-leaf-600 mb-1">
                      ${order.totalAmount.toLocaleString()}
                    </div>
                    <div className="text-sm text-bark-500">
                      {order.estimatedTimeline}
                    </div>
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div className="flex items-center space-x-2 text-bark-600">
                    <Calendar className="w-4 h-4" />
                    <span className="text-sm">
                      Created {new Date(order.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-bark-600">
                    <Users className="w-4 h-4" />
                    <span className="text-sm">
                      {order.items.length} service{order.items.length !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-bark-600">
                    {getStatusIcon(order.status)}
                    <span className="text-sm capitalize">
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-bark-200">
                  <div className="flex flex-wrap gap-2">
                    {order.items.map((item, itemIndex) => (
                      <span
                        key={itemIndex}
                        className="px-2 py-1 bg-leaf-100 text-leaf-700 rounded text-xs"
                      >
                        {item.serviceName}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/app/orders/${order.id}`}
                    className="flex items-center space-x-1 text-leaf-600 hover:text-leaf-700 font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>View Details</span>
                  </Link>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

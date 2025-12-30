'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  ChevronRight,
  Clock,
  Eye,
  Heart,
  Package,
  Search,
  Users
} from 'lucide-react'
import Link from 'next/link'
import { getOrders, Order } from '../../libs/shared-utils/orders'
import { ChatBubble } from '../../libs/shared-ui/components/ChatBubble'
import { OrderSizeBadge } from '../../libs/shared-ui/components'
import { useAuth } from '@/app/contexts/AuthContext'

export default function CustomerDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [favorites, setFavorites] = useState<Set<string>>(new Set())
  const { user } = useAuth()
  const displayName = user
    ? `${user.firstName || ''} ${user.lastName || ''}`.trim() || user.email
    : 'Member'

  useEffect(() => {
    // In a real app, this would filter by customer ID from authentication
    setOrders(getOrders())
  }, [])

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const toggleFavorite = (orderId: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev)
      if (newFavorites.has(orderId)) {
        newFavorites.delete(orderId)
      } else {
        newFavorites.add(orderId)
      }
      return newFavorites
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-leaf-100 text-leaf-800 border-leaf-300'
      case 'in_progress':
        return 'bg-wisdom-100 text-wisdom-800 border-wisdom-300'
      case 'pending':
        return 'bg-bark-100 text-bark-800 border-bark-300'
      case 'cancelled':
        return 'bg-red-100 text-red-800 border-red-300'
      default:
        return 'bg-bark-100 text-bark-800 border-bark-300'
    }
  }

  return (
    <div className="min-h-screen overflow-y-auto bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
        <section className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr] items-start">
          <div className="space-y-6">
            <p className="text-xs uppercase tracking-[0.6em] text-bark-400">Member desk briefing</p>
            <h1 className="text-4xl md:text-6xl font-serif text-bark-900 leading-tight">
              Today&apos;s agenda for <span className="text-leaf-600">{displayName}</span>
            </h1>
            <p className="text-lg text-bark-600 max-w-2xl">
              A curated view of active projects, open threads, and quick actions—designed like an editorial spread
              so you can skim, focus, and act with intention.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/order" className="btn-leaf flex items-center space-x-2">
                <Package className="h-5 w-5" />
                <span>Start a Request</span>
              </Link>
              <Link href="/contact" className="btn-secondary flex items-center space-x-2">
                <Users className="h-5 w-5" />
                <span>Book a Consult</span>
              </Link>
            </div>
          </div>
          <div className="card-organic p-6 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.4em] text-bark-400">Studio pulse</p>
                <p className="text-bark-900 font-semibold text-lg">Quarterly momentum</p>
              </div>
              <span className="text-sm text-bark-500">{new Date().toLocaleDateString()}</span>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-bark-500">Active builds</p>
                <p className="text-3xl font-serif text-bark-900">
                  {orders.filter(o => o.status === 'in_progress').length || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-bark-500">Pending briefs</p>
                <p className="text-3xl font-serif text-bark-900">
                  {orders.filter(o => o.status === 'pending').length || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-bark-500">Completed</p>
                <p className="text-3xl font-serif text-bark-900">
                  {orders.filter(o => o.status === 'completed').length || '0'}
                </p>
              </div>
              <div>
                <p className="text-xs text-bark-500">Lifetime value</p>
                <p className="text-3xl font-serif text-bark-900">
                  ${orders.reduce((total, order) => total + (order.totalAmount || order.total || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>
            <div className="flex items-center justify-between border-t border-bark-200 pt-4">
              <p className="text-sm text-bark-500">Latest update: editorial view refreshed</p>
              <Link href="/app/orders" className="text-leaf-600 font-semibold text-sm flex items-center space-x-1">
                <span>See digest</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] items-start">
          <div className="space-y-10">
            <div className="bg-white border-l-4 border-leaf-500/60 shadow-organic/50 p-6">
              <p className="text-xs uppercase tracking-[0.4em] text-bark-400 mb-2">Field note</p>
              <p className="text-bark-700">
                Keep an eye on stalled briefs—AI recommendations nudge toward wrapping pending requests before opening
                new engagements.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              {[
                { href: '/app/orders', title: 'All Orders', description: 'View every engagement', Icon: Package },
                { href: '/app/delivery', title: 'Delivery', description: 'Track handoffs & reviews', Icon: CheckCircle },
                { href: '/app/revise', title: 'Revisions', description: 'Request changes', Icon: AlertCircle },
                { href: '/app/return', title: 'Returns', description: 'Manage returns', Icon: Clock },
                { href: '/app/settings', title: 'Account settings', description: 'Update your profile', Icon: Users },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-white border border-bark-200/70 p-5 hover:border-leaf-500 transition-colors flex items-center space-x-4"
                >
                  <action.Icon className="h-7 w-7 text-bark-500" />
                  <div>
                    <p className="font-semibold text-bark-900">{action.title}</p>
                    <p className="text-sm text-bark-500">{action.description}</p>
                  </div>
                </Link>
              ))}
            </div>

            <div className="card-organic p-5 space-y-4">
              <div className="flex flex-col gap-4 md:flex-row">
                <div className="flex-1">
                  <label className="text-xs uppercase tracking-[0.4em] text-bark-400">Search orders</label>
                  <div className="mt-2 flex items-center border border-bark-200 bg-white px-3">
                    <Search className="h-5 w-5 text-bark-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Find by project, client, or ID"
                      className="flex-1 px-3 py-2 focus:outline-none"
                    />
                  </div>
                </div>
                <div className="w-full md:w-56">
                  <label className="text-xs uppercase tracking-[0.4em] text-bark-400">Status</label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="mt-2 w-full border border-bark-200 bg-white px-3 py-2 text-bark-800 focus:outline-none"
                  >
                    <option value="all">All</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-serif text-bark-900">Active orders</h2>
                <span className="text-sm text-bark-500">{filteredOrders.length} storylines</span>
              </div>
              {filteredOrders.length === 0 ? (
                <div className="bg-white border border-bark-200 p-12 text-center shadow-organic/40">
                  <Package className="w-16 h-16 text-bark-300 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-bark-800 mb-2">No orders found</h3>
                  <p className="text-bark-600 mb-6">
                    {orders.length === 0
                      ? "You haven't placed any orders yet."
                      : 'No orders match your current search criteria.'}
                  </p>
                  {orders.length === 0 && (
                    <Link
                      href="/order"
                      className="inline-block bg-leaf-600 text-white px-6 py-3 font-medium hover:bg-leaf-700 transition-colors"
                    >
                      Place Your First Order
                    </Link>
                  )}
                </div>
              ) : (
                filteredOrders.map((order, index) => (
                  <motion.article
                    key={order.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white border-l-4 border-leaf-400/80 shadow-sm p-6 space-y-4"
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <div className="flex items-center space-x-3">
                          <h3 className="text-xl font-bold text-bark-900">
                            {order.projectName || `Order ${order.id}`}
                          </h3>
                          {order.size && <OrderSizeBadge size={order.size} />}
                          <span className={`px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-sm text-bark-500 font-mono mt-1">#{order.id}</p>
                        <p className="text-bark-600 mt-1">{order.description}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-3xl font-serif text-leaf-600">
                          ${(order.totalAmount || order.total || 0).toLocaleString()}
                        </p>
                        <p className="text-sm text-bark-500">{order.estimatedTimeline}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.items.map((item, itemIndex) => (
                        <span
                          key={itemIndex}
                          className="px-3 py-1 bg-leaf-50 text-leaf-700 text-sm border border-leaf-200"
                        >
                          {item.serviceName || item.name}
                        </span>
                      ))}
                    </div>
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-bark-500 border-t border-bark-200 pt-4">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4" />
                          <span>Created {new Date(order.createdAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Users className="w-4 h-4" />
                          <span>{order.items.length} service{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => toggleFavorite(order.id)}
                          className="p-1 text-bark-400 hover:text-leaf-600 transition-colors"
                          title={favorites.has(order.id) ? 'Remove from favorites' : 'Add to favorites'}
                        >
                          <Heart
                            className={`w-5 h-5 ${
                              favorites.has(order.id) ? 'text-leaf-600 fill-leaf-600' : ''
                            }`}
                          />
                        </button>
                        <Link
                          href={`/app/orders/${order.id}`}
                          className="text-leaf-600 font-semibold flex items-center space-x-1"
                        >
                          <Eye className="w-4 h-4" />
                          <span>Open dossier</span>
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))
              )}
            </div>
          </div>

          <aside className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="gradient-airbrush-leaf text-white px-3 py-3 md:py-4 shadow-lg rounded-none min-h-[110px] flex flex-col justify-between">
                <p className="text-sm uppercase tracking-[0.4em]">Completed</p>
                <p className="text-3xl md:text-4xl font-serif">{orders.filter(o => o.status === 'completed').length}</p>
              </div>
              <div className="gradient-airbrush-wisdom text-white px-3 py-3 md:py-4 shadow-lg rounded-none min-h-[110px] flex flex-col justify-between">
                <p className="text-sm uppercase tracking-[0.4em]">In Progress</p>
                <p className="text-3xl md:text-4xl font-serif">{orders.filter(o => o.status === 'in_progress').length}</p>
              </div>
              <div className="gradient-airbrush-bark text-white px-3 py-3 md:py-4 shadow-lg rounded-none min-h-[110px] flex flex-col justify-between">
                <p className="text-sm uppercase tracking-[0.4em]">Pending</p>
                <p className="text-3xl md:text-4xl font-serif">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <div className="gradient-airbrush-root text-white px-3 py-3 md:py-4 shadow-lg rounded-none min-h-[110px] flex flex-col justify-between">
                <p className="text-sm uppercase tracking-[0.4em]">Value</p>
                <p className="text-3xl md:text-4xl font-serif">
                  ${orders.reduce((total, order) => total + (order.totalAmount || order.total || 0), 0).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="card-organic p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-bark-400">Notebook</p>
              <h3 className="text-2xl font-serif text-bark-900">Next editorial check-in</h3>
              <p className="text-bark-600">Review delivery queue and confirm final assets for completed builds.</p>
              <button className="btn-organic w-full flex items-center justify-center space-x-2">
                <Calendar className="h-4 w-4" />
                <span>Add to calendar</span>
              </button>
            </div>

            <div className="bg-white border border-bark-200 shadow-organic p-6 space-y-4">
              <p className="text-xs uppercase tracking-[0.4em] text-bark-400">Shortlist</p>
              <ul className="space-y-3">
                {(orders.slice(0, 3) || []).map((order) => (
                  <li key={order.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-bark-900">{order.projectName || order.id}</p>
                      <p className="text-xs text-bark-500">{order.customerName}</p>
                    </div>
                    <span className="text-sm text-bark-600">{order.status.replace('_', ' ')}</span>
                  </li>
                ))}
                {orders.length === 0 && (
                  <li className="text-sm text-bark-500">No recent orders to highlight yet.</li>
                )}
              </ul>
            </div>
          </aside>
        </div>
      </div>

      <ChatBubble position="bottom-right" />
    </div>
  )
}

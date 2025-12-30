'use client'

import { useState, useEffect } from 'react'
import {
  DollarSign,
  Edit,
  FileText,
  Filter,
  Package,
  Plus,
  Search,
  Sparkles,
  Trash2,
  TrendingUp,
  Users,
  Zap,
} from 'lucide-react'
import {
  calculateOrderTotal,
  createOrder,
  estimateTimeline,
  getOrders,
  Order,
  OrderItem,
  services,
  updateOrder,
} from '@/libs/shared-utils/orders'
import { OrderSizeBadge } from '@/libs/shared-ui/components'
import { Logo } from '@/libs/shared-ui/components/Logo'

interface Customer {
  id: string;
  name: string;
  email: string;
  company: string;
  totalOrders: number;
  totalSpent: number;
  status: 'active' | 'inactive';
}

interface NewOrderForm {
  customerName: string;
  customerEmail: string;
  companyName: string;
  projectName: string;
  description: string;
  selectedServices: string[];
  generationMode: 'manual' | 'ai';
  aiPrompt?: string;
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [selectedView, setSelectedView] = useState<'orders' | 'customers' | 'analytics'>('orders')
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showNewOrderModal, setShowNewOrderModal] = useState(false)
  const [newOrderForm, setNewOrderForm] = useState<NewOrderForm>({
    customerName: '',
    customerEmail: '',
    companyName: '',
    projectName: '',
    description: '',
    selectedServices: [],
    generationMode: 'manual',
    aiPrompt: ''
  })
  const [isGeneratingAI, setIsGeneratingAI] = useState(false)

  useEffect(() => {
    const storedOrders = getOrders()
    setOrders([...storedOrders])
  }, [])

  useEffect(() => {
    // Generate customers from orders
    const customerMap = new Map<string, Customer>()
    orders.forEach(order => {
      if (!customerMap.has(order.customerId)) {
        customerMap.set(order.customerId, {
          id: order.customerId,
          name: order.customerName || 'Unknown',
          email: order.customerEmail || '',
          company: order.companyName || '',
          totalOrders: 1,
          totalSpent: order.totalAmount || order.total || 0,
          status: 'active'
        })
      } else {
        const customer = customerMap.get(order.customerId)!
        customer.totalOrders++
        customer.totalSpent += order.totalAmount || order.total || 0
      }
    })
    setCustomers(Array.from(customerMap.values()))
  }, [orders])

  const handleGenerateWithAI = async () => {
    if (!newOrderForm.aiPrompt?.trim()) {
      alert('Please provide a description for AI generation')
      return
    }

    setIsGeneratingAI(true)

    // Simulate AI generation (in production, this would call an AI API)
    setTimeout(() => {
      // AI analyzes the prompt and suggests services
      const prompt = newOrderForm.aiPrompt!.toLowerCase()
      const suggestedServices: string[] = []

      if (prompt.includes('website') || prompt.includes('web') || prompt.includes('frontend')) {
        suggestedServices.push('frontend')
      }
      if (prompt.includes('backend') || prompt.includes('api') || prompt.includes('database')) {
        suggestedServices.push('backend')
      }
      if (prompt.includes('mobile') || prompt.includes('app') || prompt.includes('ios') || prompt.includes('android')) {
        suggestedServices.push('mobile')
      }
      if (prompt.includes('design') || prompt.includes('ui') || prompt.includes('ux')) {
        suggestedServices.push('design')
      }
      if (prompt.includes('cloud') || prompt.includes('deploy') || prompt.includes('devops')) {
        suggestedServices.push('devops')
      }
      if (prompt.includes('strategy') || prompt.includes('consult') || prompt.includes('planning')) {
        suggestedServices.push('strategy')
      }

      // If no services detected, suggest frontend and backend as default
      if (suggestedServices.length === 0) {
        suggestedServices.push('frontend', 'backend')
      }

      // Generate project name from prompt
      const words = prompt.split(' ').filter(w => w.length > 3)
      const projectName = words.slice(0, 3).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') + ' Project'

      setNewOrderForm({
        ...newOrderForm,
        selectedServices: suggestedServices,
        projectName: projectName || 'AI Generated Project',
        description: newOrderForm.aiPrompt || 'AI-generated project based on requirements'
      })

      setIsGeneratingAI(false)
      alert('AI has analyzed your requirements and suggested services!')
    }, 2000)
  }

  const handleCreateOrder = () => {
    if (!newOrderForm.customerName || !newOrderForm.projectName || newOrderForm.selectedServices.length === 0) {
      alert('Please fill in all required fields')
      return
    }

    const items: OrderItem[] = newOrderForm.selectedServices.map((serviceId, index) => {
      const service = services.find(s => s.id === serviceId)!
      return {
        id: `item-${Date.now()}-${index}`,
        serviceId: service.id,
        name: service.name,
        serviceName: service.name,
        price: service.basePrice,
        timeline: service.timeline,
        features: service.features
      }
    })

    const total = calculateOrderTotal(items)
    const timeline = estimateTimeline(items)
    
    const newOrder = createOrder({
      customerId: `CUST-${Date.now()}`,
      customerName: newOrderForm.customerName,
      customerEmail: newOrderForm.customerEmail,
      companyName: newOrderForm.companyName,
      projectName: newOrderForm.projectName,
      description: newOrderForm.description,
      items,
      total,
      totalAmount: total,
      estimatedTimeline: timeline,
      status: 'pending',
      priority: 'medium',
      techStack: items.flatMap(item => item.features || [])
    })

    setOrders([...orders, newOrder])
    setShowNewOrderModal(false)
    setNewOrderForm({
      customerName: '',
      customerEmail: '',
      companyName: '',
      projectName: '',
      description: '',
      selectedServices: [],
      generationMode: 'manual',
      aiPrompt: ''
    })
  }

  const handleUpdateOrderStatus = (orderId: string, newStatus: Order['status']) => {
    const updated = updateOrder(orderId, { status: newStatus })
    if (updated) {
      setOrders(orders.map(o => o.id === orderId ? updated : o))
    }
  }

  const handleDeleteOrder = (orderId: string) => {
    if (confirm('Are you sure you want to delete this order?')) {
      setOrders(orders.filter(o => o.id !== orderId))
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus
    const matchesSearch = !searchQuery || 
      order.projectName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.id.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesStatus && matchesSearch
  })

  const totalRevenue = orders.reduce((sum, order) => sum + (order.totalAmount || order.total || 0), 0)
  const activeProjects = orders.filter(order => order.status === 'in_progress').length
  const completedProjects = orders.filter(order => order.status === 'completed').length
  const pendingProjects = orders.filter(order => order.status === 'pending').length

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-leaf-500/20 text-leaf-400 border-leaf-500/30'
      case 'in_progress': return 'bg-wisdom-500/20 text-wisdom-400 border-wisdom-500/30'
      case 'pending': return 'bg-bark-500/20 text-bark-400 border-bark-500/30'
      case 'cancelled': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-bark-500/20 text-bark-400 border-bark-500/30'
    }
  }

  const contentHeight = 'calc(100vh - 76px)'

  return (
    <div className="min-h-screen bg-leaf-pattern bg-[length:200px_200px] bg-fixed bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 shadow-sm">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Logo size="sm" className="text-bark-900" textClassName="text-2xl" />
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 bg-leaf-500"></div>
                <span className="text-sm text-bark-600">Admin Dashboard</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-bark-100 px-4 py-2 border border-bark-200">
                <Package className="w-4 h-4 text-bark-600" />
                <span className="text-sm text-bark-700 font-medium">{orders.length} Orders</span>
              </div>
              <div className="flex items-center space-x-2 bg-leaf-600 px-4 py-2 text-white">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex" style={{ minHeight: contentHeight, height: contentHeight }}>
        {/* Sidebar */}
        <div
          className="w-80 bg-white/95 backdrop-blur-sm border-r border-bark-200 p-6 overflow-y-auto scrollbar-hide pr-2"
          style={{ minHeight: contentHeight, height: contentHeight }}
        >
          {/* Navigation */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedView('orders')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors ${
                selectedView === 'orders'
                  ? 'bg-leaf-500 text-white'
                  : 'text-bark-700 hover:bg-bark-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Package className="w-5 h-5" />
                <span>Orders</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('customers')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors ${
                selectedView === 'customers'
                  ? 'bg-leaf-500 text-white'
                  : 'text-bark-700 hover:bg-bark-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5" />
                <span>Customers</span>
              </div>
            </button>
            <button
              onClick={() => setSelectedView('analytics')}
              className={`w-full text-left px-4 py-3 font-medium transition-colors ${
                selectedView === 'analytics'
                  ? 'bg-leaf-500 text-white'
                  : 'text-bark-700 hover:bg-bark-100'
              }`}
            >
              <div className="flex items-center space-x-3">
                <TrendingUp className="w-5 h-5" />
                <span>Analytics</span>
              </div>
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8">
            <div className="gradient-airbrush-leaf p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-3">
                <Logo size="sm" showText={false} />
                <TrendingUp className="w-5 h-5 text-leaf-200" />
              </div>
              <div className="text-3xl font-bold mb-1">{activeProjects}</div>
              <div className="text-leaf-100 text-sm">Active Projects</div>
            </div>

            <div className="gradient-airbrush-wisdom p-6 text-white shadow-lg">
              <div className="text-3xl font-bold">{pendingProjects}</div>
              <div className="text-sm text-wisdom-100">Pending</div>
            </div>
            <div className="gradient-airbrush-bark p-6 text-white shadow-lg">
              <div className="text-3xl font-bold">{completedProjects}</div>
              <div className="text-sm text-bark-100">Completed</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="bg-white border border-bark-200 p-4 shadow-sm">
            <h3 className="font-semibold text-bark-800 mb-4">Revenue Breakdown</h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bark-600">Total Revenue</span>
                  <span className="text-bark-900 font-bold">${totalRevenue.toLocaleString()}</span>
                </div>
                <div className="w-full bg-bark-200 h-2">
                  <div className="bg-leaf-500 h-2" style={{ width: '100%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-bark-600">Active Value</span>
                  <span className="text-bark-900 font-bold">
                    ${orders.filter(o => o.status === 'in_progress').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0).toLocaleString()}
                  </span>
                </div>
                <div className="w-full bg-bark-200 h-2">
                  <div className="bg-wisdom-500 h-2" style={{
                    width: `${totalRevenue > 0 ? (orders.filter(o => o.status === 'in_progress').reduce((sum, o) => sum + (o.totalAmount || o.total || 0), 0) / totalRevenue * 100) : 0}%`
                  }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto" style={{ minHeight: contentHeight }}>
          {/* Top Bar */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-bark-400" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-bark-300 bg-white text-bark-800 placeholder-bark-400 focus:outline-none focus:ring-2 focus:ring-leaf-500 focus:border-leaf-500 w-80"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter className="w-5 h-5 text-bark-600" />
                <select
                  value={filterStatus}
                  onChange={(e) =>
                    setFilterStatus(
                      e.target.value as 'all' | 'pending' | 'in_progress' | 'completed' | 'cancelled'
                    )
                  }
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
            <button
              onClick={() => setShowNewOrderModal(true)}
              className="bg-leaf-600 text-white px-6 py-2 font-medium hover:bg-leaf-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="w-5 h-5" />
              <span>New Order</span>
            </button>
          </div>

          {/* Content Area */}
          {selectedView === 'orders' && (
            <div className="space-y-4">
              {filteredOrders.length === 0 ? (
                <div className="bg-white border border-bark-200 p-12 text-center">
                  <Package className="w-16 h-16 text-bark-300 mx-auto mb-4" />
                  <p className="text-bark-600">No orders found</p>
                </div>
              ) : (
                filteredOrders.map((order) => (
                  <div key={order.id} className="bg-white border border-bark-200 p-6 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-xl font-bold text-bark-900">{order.projectName}</h3>
                          {order.size && <OrderSizeBadge size={order.size} />}
                          <span className={`px-3 py-1 text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {order.status.replace('_', ' ').toUpperCase()}
                          </span>
                        </div>
                        <p className="text-bark-600 mb-2">{order.description}</p>
                        <div className="flex items-center space-x-4 text-sm text-bark-500">
                          <span className="font-mono">{order.id}</span>
                          <span>•</span>
                          <span>{order.customerName}</span>
                          <span>•</span>
                          <span>{order.companyName}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleUpdateOrderStatus(order.id, 
                            order.status === 'pending' ? 'in_progress' : 
                            order.status === 'in_progress' ? 'completed' : 'pending'
                          )}
                          className="p-2 text-bark-600 hover:bg-bark-100 transition-colors"
                          title="Update status"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(order.id)}
                          className="p-2 text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete order"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="bg-bark-50 p-3 border border-bark-200">
                        <div className="text-xs text-bark-600 mb-1">Total Amount</div>
                        <div className="text-2xl font-bold text-leaf-600">${(order.totalAmount || order.total || 0).toLocaleString()}</div>
                      </div>
                      <div className="bg-bark-50 p-3 border border-bark-200">
                        <div className="text-xs text-bark-600 mb-1">Timeline</div>
                        <div className="text-lg font-semibold text-bark-800">{order.estimatedTimeline}</div>
                      </div>
                      <div className="bg-bark-50 p-3 border border-bark-200">
                        <div className="text-xs text-bark-600 mb-1">Services</div>
                        <div className="text-lg font-semibold text-bark-800">{order.items.length} items</div>
                      </div>
                    </div>

                    <div className="border-t border-bark-200 pt-4">
                      <div className="text-sm font-medium text-bark-700 mb-2">Services Included:</div>
                      <div className="flex flex-wrap gap-2">
                        {order.items.map((item, idx) => (
                          <span key={idx} className="px-3 py-1 bg-leaf-100 text-leaf-800 text-sm border border-leaf-300">
                            {item.serviceName || item.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedView === 'customers' && (
            <div className="space-y-4">
              {customers.length === 0 ? (
                <div className="bg-white border border-bark-200 p-12 text-center">
                  <Users className="w-16 h-16 text-bark-300 mx-auto mb-4" />
                  <p className="text-bark-600">No customers found</p>
                </div>
              ) : (
                customers.map((customer) => (
                  <div key={customer.id} className="bg-white border border-bark-200 p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-xl font-bold text-bark-900 mb-1">{customer.name}</h3>
                        <p className="text-bark-600 mb-2">{customer.company}</p>
                        <p className="text-sm text-bark-500">{customer.email}</p>
                      </div>
                      <div className="text-right">
                        <div className="text-3xl font-bold text-leaf-600 mb-1">${customer.totalSpent.toLocaleString()}</div>
                        <div className="text-sm text-bark-600">{customer.totalOrders} orders</div>
                        <span className={`inline-block mt-2 px-3 py-1 text-xs font-medium ${
                          customer.status === 'active' ? 'bg-leaf-100 text-leaf-800 border border-leaf-300' : 'bg-bark-100 text-bark-800 border border-bark-300'
                        }`}>
                          {customer.status.toUpperCase()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {selectedView === 'analytics' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-white border border-bark-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-bark-900 mb-4">Order Status Distribution</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-bark-700">Pending</span>
                    <span className="font-bold text-bark-900">{pendingProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-bark-700">In Progress</span>
                    <span className="font-bold text-bark-900">{activeProjects}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-bark-700">Completed</span>
                    <span className="font-bold text-bark-900">{completedProjects}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white border border-bark-200 p-6 shadow-sm">
                <h3 className="text-lg font-bold text-bark-900 mb-4">Service Popularity</h3>
                <div className="space-y-3">
                  {services.slice(0, 5).map((service) => {
                    const count = orders.reduce((sum, order) => 
                      sum + order.items.filter(item => item.serviceId === service.id).length, 0
                    )
                    return (
                      <div key={service.id} className="flex items-center justify-between">
                        <span className="text-bark-700">{service.name}</span>
                        <span className="font-bold text-bark-900">{count}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Order Modal */}
      {showNewOrderModal && (
        <div className="fixed inset-0 bg-bark-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="popout-glassmorphic bg-white/90 max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold text-bark-900 mb-6">Create New Order</h2>
            
            {/* Generation Mode Selector */}
            <div className="mb-6 bg-bark-50 border-2 border-bark-200 p-4">
              <label className="block text-sm font-medium text-bark-700 mb-3">Order Generation Mode</label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setNewOrderForm({...newOrderForm, generationMode: 'manual'})}
                  className={`p-4 border-2 transition-all ${
                    newOrderForm.generationMode === 'manual'
                      ? 'border-leaf-600 bg-leaf-50'
                      : 'border-bark-300 bg-white hover:border-bark-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <FileText className={`w-6 h-6 ${newOrderForm.generationMode === 'manual' ? 'text-leaf-600' : 'text-bark-600'}`} />
                    <span className={`font-bold ${newOrderForm.generationMode === 'manual' ? 'text-leaf-900' : 'text-bark-900'}`}>
                      Manual
                    </span>
                  </div>
                  <p className="text-xs text-bark-600 text-center">
                    Manually select services and fill details
                  </p>
                </button>

                <button
                  onClick={() => setNewOrderForm({...newOrderForm, generationMode: 'ai'})}
                  className={`p-4 border-2 transition-all ${
                    newOrderForm.generationMode === 'ai'
                      ? 'border-wisdom-600 bg-wisdom-50'
                      : 'border-bark-300 bg-white hover:border-bark-400'
                  }`}
                >
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <Sparkles className={`w-6 h-6 ${newOrderForm.generationMode === 'ai' ? 'text-wisdom-600' : 'text-bark-600'}`} />
                    <span className={`font-bold ${newOrderForm.generationMode === 'ai' ? 'text-wisdom-900' : 'text-bark-900'}`}>
                      AI Automated
                    </span>
                  </div>
                  <p className="text-xs text-bark-600 text-center">
                    Let AI analyze requirements and suggest services
                  </p>
                </button>
              </div>
            </div>

            {/* AI Prompt Section (only shown in AI mode) */}
            {newOrderForm.generationMode === 'ai' && (
              <div className="mb-6 bg-gradient-to-br from-wisdom-50 to-leaf-50 border-2 border-wisdom-300 p-4">
                <div className="flex items-center space-x-2 mb-3">
                  <Zap className="w-5 h-5 text-wisdom-600" />
                  <label className="text-sm font-medium text-wisdom-900">AI Requirements Analysis</label>
                </div>
                <textarea
                  value={newOrderForm.aiPrompt}
                  onChange={(e) => setNewOrderForm({...newOrderForm, aiPrompt: e.target.value})}
                  className="w-full px-4 py-3 border border-wisdom-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-wisdom-500 mb-3"
                  rows={4}
                  placeholder="Describe the project requirements... e.g., 'I need a modern e-commerce website with mobile app, payment integration, and cloud deployment'"
                />
                <button
                  onClick={handleGenerateWithAI}
                  disabled={isGeneratingAI}
                  className={`w-full py-3 font-medium transition-colors flex items-center justify-center space-x-2 ${
                    isGeneratingAI
                      ? 'bg-bark-300 text-bark-600 cursor-not-allowed'
                      : 'bg-wisdom-600 text-white hover:bg-wisdom-700'
                  }`}
                >
                  {isGeneratingAI ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent"></div>
                      <span>Analyzing with AI...</span>
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5" />
                      <span>Generate with AI</span>
                    </>
                  )}
                </button>
              </div>
            )}
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Customer Name *</label>
                <input
                  type="text"
                  value={newOrderForm.customerName}
                  onChange={(e) => setNewOrderForm({...newOrderForm, customerName: e.target.value})}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  placeholder="John Smith"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Customer Email</label>
                <input
                  type="email"
                  value={newOrderForm.customerEmail}
                  onChange={(e) => setNewOrderForm({...newOrderForm, customerEmail: e.target.value})}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  placeholder="john@company.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Company Name</label>
                <input
                  type="text"
                  value={newOrderForm.companyName}
                  onChange={(e) => setNewOrderForm({...newOrderForm, companyName: e.target.value})}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  placeholder="Company Inc."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Project Name *</label>
                <input
                  type="text"
                  value={newOrderForm.projectName}
                  onChange={(e) => setNewOrderForm({...newOrderForm, projectName: e.target.value})}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  placeholder="E-commerce Platform"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Description</label>
                <textarea
                  value={newOrderForm.description}
                  onChange={(e) => setNewOrderForm({...newOrderForm, description: e.target.value})}
                  className="w-full px-4 py-2 border border-bark-300 bg-white text-bark-800 focus:outline-none focus:ring-2 focus:ring-leaf-500"
                  rows={3}
                  placeholder="Project description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">
                  Select Services * 
                  {newOrderForm.generationMode === 'ai' && newOrderForm.selectedServices.length > 0 && (
                    <span className="ml-2 text-xs text-wisdom-600 font-normal">
                      (AI Suggested)
                    </span>
                  )}
                </label>
                <div className="space-y-2">
                  {services.map((service) => {
                    const isAISuggested = newOrderForm.generationMode === 'ai' && newOrderForm.selectedServices.includes(service.id)
                    return (
                      <label 
                        key={service.id} 
                        className={`flex items-center space-x-3 p-3 border cursor-pointer transition-colors ${
                          isAISuggested 
                            ? 'border-wisdom-400 bg-wisdom-50 hover:bg-wisdom-100' 
                            : 'border-bark-200 hover:bg-bark-50'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={newOrderForm.selectedServices.includes(service.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setNewOrderForm({...newOrderForm, selectedServices: [...newOrderForm.selectedServices, service.id]})
                            } else {
                              setNewOrderForm({...newOrderForm, selectedServices: newOrderForm.selectedServices.filter(id => id !== service.id)})
                            }
                          }}
                          className="w-4 h-4 text-leaf-600 border-bark-300 focus:ring-leaf-500"
                        />
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-bark-900">{service.name}</span>
                            {isAISuggested && (
                              <span className="px-2 py-0.5 bg-wisdom-600 text-white text-xs font-bold">
                                AI
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-bark-600">${service.basePrice.toLocaleString()} • {service.timeline}</div>
                        </div>
                      </label>
                    )
                  })}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 mt-8">
              <button
                onClick={() => setShowNewOrderModal(false)}
                className="px-6 py-2 border border-bark-300 text-bark-700 hover:bg-bark-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateOrder}
                className="px-6 py-2 bg-leaf-600 text-white hover:bg-leaf-700 transition-colors"
              >
                Create Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

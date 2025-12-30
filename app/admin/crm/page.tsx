'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  TrendingUp,
  DollarSign,
  Target,
  Activity,
  Filter,
  Search,
  MoreVertical,
  Mail,
  Phone,
  Building,
  Tag
} from 'feather-icons-react'
import { getCustomers, getLeads, getDeals, getCRMMetrics } from '@/libs/shared-utils/crm'
import { Customer, Lead, Deal, CRMMetrics } from '@/libs/shared-types/crm'
import PipelineBoard from '@/libs/shared-ui/components/PipelineBoard'

export default function CRMDashboard() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [deals, setDeals] = useState<Deal[]>([])
  const [metrics, setMetrics] = useState<CRMMetrics | null>(null)
  const [selectedView, setSelectedView] = useState<'overview' | 'customers' | 'leads' | 'deals' | 'pipeline'>('overview')
  const [searchTerm, setSearchTerm] = useState('')
  const [/*selectedCustomer*/, setSelectedCustomer] = useState<Customer | null>(null)

  useEffect(() => {
    setCustomers(getCustomers())
    setLeads(getLeads())
    setDeals(getDeals())
    setMetrics(getCRMMetrics())
  }, [])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredLeads = leads.filter(lead =>
    lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Users className="h-8 w-8 text-blue-500" />
              <h1 className="text-xl font-bold">CRM Dashboard</h1>
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 bg-green-500 "></div>
                <span className="text-sm text-gray-300">All systems operational</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="bg-blue-600 text-white px-4 py-2  text-sm font-medium hover:bg-blue-700 flex items-center space-x-2">
                <UserPlus className="w-4 h-4" />
                <span>Add Customer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-dark-800 border-r border-dark-700 p-6">
          {/* Navigation */}
          <div className="space-y-2 mb-6">
            <button
              onClick={() => setSelectedView('overview')}
              className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors flex items-center space-x-3 ${
                selectedView === 'overview' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => setSelectedView('customers')}
              className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors flex items-center space-x-3 ${
                selectedView === 'customers' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Customers</span>
              <span className="ml-auto bg-dark-600 px-2 py-1 rounded text-xs">{customers.length}</span>
            </button>
            <button
              onClick={() => setSelectedView('leads')}
              className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors flex items-center space-x-3 ${
                selectedView === 'leads' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <Target className="w-4 h-4" />
              <span>Leads</span>
              <span className="ml-auto bg-dark-600 px-2 py-1 rounded text-xs">{leads.length}</span>
            </button>
            <button
              onClick={() => setSelectedView('deals')}
              className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors flex items-center space-x-3 ${
                selectedView === 'deals' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>Deals</span>
              <span className="ml-auto bg-dark-600 px-2 py-1 rounded text-xs">{deals.length}</span>
            </button>
            <button
              onClick={() => setSelectedView('pipeline')}
              className={`w-full text-left px-4 py-3  text-sm font-medium transition-colors flex items-center space-x-3 ${
                selectedView === 'pipeline' 
                  ? 'bg-blue-600 text-white' 
                  : 'text-gray-300 hover:bg-dark-700'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>Pipeline</span>
            </button>
          </div>

          {/* Quick Stats */}
          {metrics && (
            <div className="space-y-4 mb-6">
              <div className="bg-dark-700  p-4">
                <div className="text-2xl font-bold text-green-400">${metrics.totalRevenue.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Total Revenue</div>
              </div>
              <div className="bg-dark-700  p-4">
                <div className="text-2xl font-bold text-blue-400">{metrics.conversionRate.toFixed(1)}%</div>
                <div className="text-sm text-gray-400">Conversion Rate</div>
              </div>
              <div className="bg-dark-700  p-4">
                <div className="text-2xl font-bold text-purple-400">${metrics.averageDealSize.toLocaleString()}</div>
                <div className="text-sm text-gray-400">Avg Deal Size</div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="bg-dark-700  p-4">
            <h3 className="font-semibold mb-4">Recent Activity</h3>
            <div className="space-y-3">
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-green-500  mt-2"></div>
                <div>
                  <div className="text-sm font-medium">New customer added</div>
                  <div className="text-xs text-gray-400">John Smith - TechCorp Inc.</div>
                  <div className="text-xs text-gray-500">2 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-blue-500  mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Deal updated</div>
                  <div className="text-xs text-gray-400">E-commerce Platform - $27K</div>
                  <div className="text-xs text-gray-500">4 hours ago</div>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-yellow-500  mt-2"></div>
                <div>
                  <div className="text-sm font-medium">Lead qualified</div>
                  <div className="text-xs text-gray-400">Michael Chen - Startup Co</div>
                  <div className="text-xs text-gray-500">6 hours ago</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Search and Filters */}
          {(selectedView === 'customers' || selectedView === 'leads') && (
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder={`Search ${selectedView}...`}
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-dark-700 border border-dark-600  pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 w-80"
                  />
                </div>
                <button className="bg-dark-700 border border-dark-600  px-4 py-2 text-sm font-medium hover:bg-dark-600 flex items-center space-x-2">
                  <Filter className="w-4 h-4" />
                  <span>Filters</span>
                </button>
              </div>
            </div>
          )}

          {/* Content Area */}
          <div className="bg-dark-800  p-6 h-full overflow-auto">
            {selectedView === 'overview' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">CRM Overview</h2>
                {metrics && (
                  <div className="grid grid-cols-4 gap-6 mb-8">
                    <div className="bg-dark-700  p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Total Customers</h3>
                        <Users className="w-5 h-5 text-blue-500" />
                      </div>
                      <div className="text-3xl font-bold text-blue-400">{metrics.totalCustomers}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {metrics.activeCustomers} active
                      </div>
                    </div>
                    <div className="bg-dark-700  p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Total Leads</h3>
                        <Target className="w-5 h-5 text-green-500" />
                      </div>
                      <div className="text-3xl font-bold text-green-400">{metrics.totalLeads}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {metrics.qualifiedLeads} qualified
                      </div>
                    </div>
                    <div className="bg-dark-700  p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Revenue</h3>
                        <DollarSign className="w-5 h-5 text-purple-500" />
                      </div>
                      <div className="text-3xl font-bold text-purple-400">${metrics.totalRevenue.toLocaleString()}</div>
                      <div className="text-sm text-gray-400 mt-2">
                        ${metrics.averageDealSize.toLocaleString()} avg deal
                      </div>
                    </div>
                    <div className="bg-dark-700  p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold">Win Rate</h3>
                        <TrendingUp className="w-5 h-5 text-yellow-500" />
                      </div>
                      <div className="text-3xl font-bold text-yellow-400">{metrics.winRate.toFixed(1)}%</div>
                      <div className="text-sm text-gray-400 mt-2">
                        {metrics.salesCycleLength} days avg cycle
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'customers' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Customer Management</h2>
                <div className="space-y-4">
                  {filteredCustomers.map((customer) => (
                    <motion.div
                      key={customer.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-700  p-6 hover:bg-dark-600 transition-colors cursor-pointer"
                      onClick={() => setSelectedCustomer(customer)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-blue-600  flex items-center justify-center">
                            <span className="text-lg font-bold">{customer.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{customer.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <div className="flex items-center space-x-1">
                                <Mail className="w-4 h-4" />
                                <span>{customer.email}</span>
                              </div>
                              {customer.phone && (
                                <div className="flex items-center space-x-1">
                                  <Phone className="w-4 h-4" />
                                  <span>{customer.phone}</span>
                                </div>
                              )}
                              {customer.company && (
                                <div className="flex items-center space-x-1">
                                  <Building className="w-4 h-4" />
                                  <span>{customer.company}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">${customer.totalValue.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">{customer.projectsCount} projects</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              customer.status === 'active' ? 'bg-green-600 text-white' :
                              customer.status === 'prospect' ? 'bg-yellow-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {customer.status}
                            </span>
                            <button className="text-gray-400 hover:text-white">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                      {customer.tags.length > 0 && (
                        <div className="flex items-center space-x-2 mt-4">
                          <Tag className="w-4 h-4 text-gray-400" />
                          <div className="flex flex-wrap gap-2">
                            {customer.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-dark-600 rounded text-xs">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'leads' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Lead Management</h2>
                <div className="space-y-4">
                  {filteredLeads.map((lead) => (
                    <motion.div
                      key={lead.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-700  p-6 hover:bg-dark-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-green-600  flex items-center justify-center">
                            <span className="text-lg font-bold">{lead.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{lead.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>{lead.email}</span>
                              {lead.company && <span>{lead.company}</span>}
                              {lead.jobTitle && <span>{lead.jobTitle}</span>}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-purple-400">Score: {lead.score}</div>
                            {lead.estimatedValue && (
                              <div className="text-sm text-gray-400">${lead.estimatedValue.toLocaleString()} est.</div>
                            )}
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.status === 'qualified' ? 'bg-green-600 text-white' :
                              lead.status === 'proposal' ? 'bg-blue-600 text-white' :
                              lead.status === 'new' ? 'bg-yellow-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {lead.status}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              lead.priority === 'high' ? 'bg-red-600 text-white' :
                              lead.priority === 'medium' ? 'bg-yellow-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {lead.priority}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {selectedView === 'pipeline' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Sales Pipeline</h2>
                <PipelineBoard deals={deals} />
              </div>
            )}

            {selectedView === 'deals' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Deal Management</h2>
                <div className="space-y-4">
                  {deals.map((deal) => (
                    <motion.div
                      key={deal.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-dark-700  p-6 hover:bg-dark-600 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-purple-600  flex items-center justify-center">
                            <DollarSign className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-lg">{deal.name}</h3>
                            <div className="flex items-center space-x-4 text-sm text-gray-400">
                              <span>Customer: {customers.find(c => c.id === deal.customerId)?.name}</span>
                              <span>Assigned to: {deal.assignedTo}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-right">
                            <div className="text-lg font-bold text-green-400">${deal.value.toLocaleString()}</div>
                            <div className="text-sm text-gray-400">Due: {deal.expectedCloseDate.toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              deal.stage === 'closed_won' ? 'bg-green-600 text-white' :
                              deal.stage === 'contract' ? 'bg-purple-600 text-white' :
                              deal.stage === 'negotiation' ? 'bg-orange-600 text-white' :
                              deal.stage === 'proposal' ? 'bg-blue-600 text-white' :
                              'bg-gray-600 text-white'
                            }`}>
                              {deal.stage.replace('_', ' ')}
                            </span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${
                              deal.probability >= 75 ? 'bg-green-600 text-white' :
                              deal.probability >= 50 ? 'bg-yellow-600 text-white' :
                              'bg-red-600 text-white'
                            }`}>
                              {deal.probability}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

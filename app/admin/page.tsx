'use client'

import { useState, useEffect } from 'react'
import { 
  TreePine,
  DollarSign,
  BarChart3,
  PieChart,
  FileText,
  Calendar
} from 'lucide-react'
import { getOrders, developers } from '@/lib/orders'
import { Order } from '@/libs/shared-types/order'

export default function AdminDashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [selectedView, setSelectedView] = useState<'architecture' | 'sow' | 'roadmap' | 'code'>('architecture')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)

  useEffect(() => {
    const allOrders = getOrders()
    // Add some mock data for demonstration
    if (allOrders.length === 0) {
      // Create sample orders for demo
      const sampleOrders: Order[] = [
        {
          id: 'ORD-0001',
          customerId: 'CUST-001',
          customerName: 'John Smith',
          customerEmail: 'john@techcorp.com',
          companyName: 'TechCorp Inc.',
          projectName: 'E-commerce Platform',
          description: 'Modern e-commerce platform with React, Node.js, and PostgreSQL',
          items: [
            {
              serviceId: 'frontend',
              serviceName: 'Frontend Development',
              price: 15000,
              timeline: '6-8 weeks',
              features: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS']
            },
            {
              serviceId: 'backend',
              serviceName: 'Backend Systems',
              price: 12000,
              timeline: '4-6 weeks',
              features: ['Node.js', 'PostgreSQL', 'API Development', 'Authentication']
            }
          ],
          totalAmount: 27000,
          estimatedTimeline: '8-10 weeks',
          status: 'in_progress',
          priority: 'high',
          createdAt: new Date('2024-01-15'),
          updatedAt: new Date('2024-01-20'),
          assignedDevelopers: ['sarah-chen', 'marcus-johnson'],
          techStack: ['React', 'Node.js', 'PostgreSQL', 'AWS'],
          architecture: {
            frontend: 45,
            backend: 30,
            database: 15,
            integrations: 5,
            infrastructure: 3,
            testing: 2
          },
          milestones: [
            {
              id: 'M1',
              title: 'Project Setup & Architecture',
              description: 'Initial project setup and architecture design',
              dueDate: new Date('2024-02-01'),
              status: 'completed',
              progress: 100
            },
            {
              id: 'M2',
              title: 'Frontend Development',
              description: 'Core frontend components and pages',
              dueDate: new Date('2024-02-15'),
              status: 'in_progress',
              progress: 65
            },
            {
              id: 'M3',
              title: 'Backend API Development',
              description: 'REST API and database integration',
              dueDate: new Date('2024-02-20'),
              status: 'in_progress',
              progress: 40
            }
          ]
        }
      ]
      setOrders(sampleOrders)
      setSelectedOrder(sampleOrders[0])
    } else {
      setOrders(allOrders)
      setSelectedOrder(allOrders[0])
    }
  }, [])

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0)
  const activeProjects = orders.filter(order => order.status === 'in_progress').length
  const completedProjects = orders.filter(order => order.status === 'completed').length

  return (
    <div className="min-h-screen bg-dark-900 text-white">
      {/* Header */}
      <div className="bg-dark-800 border-b border-dark-700">
        <div className="max-w-full px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <TreePine className="h-8 w-8 text-leaf-500" />
              <h1 className="text-xl font-bold">Tree of Life Agency</h1>
              <div className="flex items-center space-x-2 ml-8">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-300">All systems operational</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-dark-700 rounded-lg px-3 py-2">
                <span className="text-sm text-gray-300">Total Hours:</span>
                <span className="text-white font-bold">1134</span>
              </div>
              <div className="flex items-center space-x-2 bg-green-600 rounded-lg px-3 py-2">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-screen">
        {/* Sidebar */}
        <div className="w-80 bg-dark-800 border-r border-dark-700 p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-green-400">{activeProjects}</div>
              <div className="text-sm text-gray-400">Active Projects</div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4">
              <div className="text-2xl font-bold text-blue-400">{completedProjects}</div>
              <div className="text-sm text-gray-400">Completed</div>
            </div>
          </div>

          {/* Cost Analysis Chart */}
          <div className="bg-dark-700 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Cost Analysis</h3>
              <BarChart3 className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Frontend</span>
                <span className="text-white">$45K</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '45%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Backend</span>
                <span className="text-white">$30K</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Database</span>
                <span className="text-white">$15K</span>
              </div>
              <div className="w-full bg-dark-600 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '15%' }}></div>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-dark-600">
              <div className="flex justify-between">
                <span className="text-gray-400">Total Cost</span>
                <span className="text-white font-bold">${totalRevenue.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Architecture Breakdown */}
          {selectedOrder?.architecture && (
            <div className="bg-dark-700 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Architecture Breakdown</h3>
                <PieChart className="w-4 h-4 text-gray-400" />
              </div>
              <div className="space-y-3">
                {Object.entries(selectedOrder.architecture).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        key === 'frontend' ? 'bg-blue-500' :
                        key === 'backend' ? 'bg-green-500' :
                        key === 'database' ? 'bg-yellow-500' :
                        key === 'integrations' ? 'bg-purple-500' :
                        key === 'infrastructure' ? 'bg-red-500' :
                        'bg-gray-500'
                      }`}></div>
                      <span className="text-sm text-gray-300 capitalize">{key}</span>
                    </div>
                    <span className="text-white font-medium">{value}%</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Projects List */}
          <div className="bg-dark-700 rounded-lg p-4">
            <h3 className="font-semibold mb-4">Recent Projects</h3>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`p-3 rounded-lg cursor-pointer transition-colors ${
                    selectedOrder?.id === order.id ? 'bg-dark-600' : 'hover:bg-dark-600'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium">{order.projectName}</span>
                    <span className={`w-2 h-2 rounded-full ${
                      order.status === 'completed' ? 'bg-green-500' :
                      order.status === 'in_progress' ? 'bg-blue-500' :
                      'bg-yellow-500'
                    }`}></span>
                  </div>
                  <div className="text-xs text-gray-400">{order.customerName}</div>
                  <div className="text-xs text-gray-500">${order.totalAmount.toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-6">
          {/* Top Navigation */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSelectedView('architecture')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'architecture' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                Architecture
              </button>
              <button
                onClick={() => setSelectedView('sow')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'sow' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                SOW
              </button>
              <button
                onClick={() => setSelectedView('roadmap')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'roadmap' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                Roadmap
              </button>
              <button
                onClick={() => setSelectedView('code')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedView === 'code' 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-dark-700 text-gray-300 hover:bg-dark-600'
                }`}
              >
                Code Generation
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <a 
                href="/admin/crm"
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors"
              >
                CRM Dashboard
              </a>
              <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700">
                Request SOW
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="bg-dark-800 rounded-lg p-6 h-full">
            {selectedView === 'architecture' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Project Architecture</h2>
                {selectedOrder ? (
                  <div className="grid grid-cols-2 gap-8">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">System Components</h3>
                      <div className="space-y-4">
                        <div className="bg-dark-700 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Frontend Layer</h4>
                          <p className="text-gray-400 text-sm mb-3">React-based user interface with modern design patterns</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.techStack?.filter(tech => 
                              ['React', 'Next.js', 'TypeScript', 'Tailwind'].includes(tech)
                            ).map(tech => (
                              <span key={tech} className="px-2 py-1 bg-blue-600 rounded text-xs">{tech}</span>
                            ))}
                          </div>
                        </div>
                        <div className="bg-dark-700 rounded-lg p-4">
                          <h4 className="font-medium mb-2">Backend Services</h4>
                          <p className="text-gray-400 text-sm mb-3">Scalable API and business logic layer</p>
                          <div className="flex flex-wrap gap-2">
                            {selectedOrder.techStack?.filter(tech => 
                              ['Node.js', 'PostgreSQL', 'AWS'].includes(tech)
                            ).map(tech => (
                              <span key={tech} className="px-2 py-1 bg-green-600 rounded text-xs">{tech}</span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">Data Flow</h3>
                      <div className="bg-dark-700 rounded-lg p-4 h-64 flex items-center justify-center">
                        <div className="text-center text-gray-400">
                          <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                          <p>Architecture Diagram</p>
                          <p className="text-sm">Interactive system flow visualization</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <p>Select a project to view architecture</p>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'sow' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Statement of Work</h2>
                {selectedOrder ? (
                  <div className="bg-gradient-to-br from-blue-900/20 to-purple-900/20 rounded-lg p-8 text-center">
                    <h3 className="text-3xl font-bold mb-4">Access transparent cost breakdown and master vibe coding prompt</h3>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                      Stay within budget whether its tokens or human dev hours with a bulletproof development plan.
                    </p>
                    <button className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700">
                      Unlock SOW
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <FileText className="w-16 h-16 mx-auto mb-4" />
                    <p>Select a project to view SOW</p>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'roadmap' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Project Roadmap</h2>
                {selectedOrder ? (
                  <div className="bg-gradient-to-br from-green-900/20 to-teal-900/20 rounded-lg p-8 text-center">
                    <h3 className="text-3xl font-bold mb-4">Track your project timeline with interactive roadmaps</h3>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                      From milestones to user stories - see your entire development journey mapped out with realistic timelines.
                    </p>
                    <button className="bg-green-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-green-700">
                      Unlock Roadmap
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <Calendar className="w-16 h-16 mx-auto mb-4" />
                    <p>Select a project to view roadmap</p>
                  </div>
                )}
              </div>
            )}

            {selectedView === 'code' && (
              <div>
                <h2 className="text-2xl font-bold mb-6">Smart Code Generation</h2>
                {selectedOrder ? (
                  <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 rounded-lg p-8 text-center">
                    <h3 className="text-3xl font-bold mb-4">Smart code generation that already knows your business requirements</h3>
                    <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
                      Skip months of development. Get a complete, exportable prototype codebase built with the most performant SSR stack — ready for deployment and developer handoff.
                    </p>
                    <button className="bg-purple-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-purple-700">
                      Unlock Code Generation
                    </button>
                  </div>
                ) : (
                  <div className="text-center text-gray-400 py-12">
                    <BarChart3 className="w-16 h-16 mx-auto mb-4" />
                    <p>Select a project to generate code</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Panel - Developer Recommendations */}
        <div className="w-80 bg-dark-800 border-l border-dark-700 p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold">Auto-match with developers</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-xs text-gray-400">Vetted</span>
              </div>
            </div>
            <div className="bg-dark-700 rounded-lg p-4 mb-4">
              <h4 className="font-medium mb-2">Secure Your Project</h4>
              <p className="text-sm text-gray-400 mb-3">Get an NDA before sharing with developers.</p>
              <button className="bg-blue-600 text-white px-4 py-2 rounded text-sm font-medium w-full">
                Request NDA
              </button>
            </div>
          </div>

          <h3 className="font-semibold mb-4">Recommended Developers</h3>
          <div className="space-y-4">
            {developers.slice(0, 3).map((developer) => (
              <div key={developer.id} className="bg-dark-700 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="text-2xl">{developer.avatar}</div>
                    <div>
                      <h4 className="font-medium">{developer.name}</h4>
                      <p className="text-sm text-gray-400">{developer.role}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-xs text-gray-400">Vetted</span>
                  </div>
                </div>
                <p className="text-sm text-gray-300 mb-3">
                  {developer.role === 'Frontend Architect' 
                    ? 'Expert in React ecosystem with 8+ years experience building scalable applications.'
                    : developer.role === 'Backend Engineer'
                    ? 'Specialized in Node.js and cloud architecture with proven track record.'
                    : 'Full-stack developer with expertise in modern web technologies.'
                  }
                </p>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-4 text-sm text-gray-400">
                    <span>Reviews</span>
                    <span>LinkedIn</span>
                  </div>
                  <div className="text-sm text-gray-400">
                    Website ↗
                  </div>
                </div>
                <p className="text-xs text-gray-500 mb-3">
                  {developer.role === 'Frontend Architect' 
                    ? 'We provide tailored software solution for over 140+ Startups and Scale ups.'
                    : 'Specialized in building robust backend systems for enterprise clients.'
                  }
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

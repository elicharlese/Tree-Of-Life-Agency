'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  TreePine,
  Plus,
  Minus,
  Check,
  Clock,
  User,
  Mail,
  Building,
  FileText
} from 'lucide-react'
import Link from 'next/link'
import { services, createOrder, calculateOrderTotal, estimateTimeline } from '@/lib/orders'
import { OrderItem } from '@/libs/shared-types/order'

export default function OrderPage() {
  const [selectedServices, setSelectedServices] = useState<OrderItem[]>([])
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    companyName: '',
    projectName: '',
    description: ''
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [orderSubmitted, setOrderSubmitted] = useState(false)
  const [orderId, setOrderId] = useState('')

  const addService = (serviceId: string) => {
    const service = services.find(s => s.id === serviceId)
    if (!service) return

    const orderItem: OrderItem = {
      serviceId: service.id,
      serviceName: service.name,
      price: service.basePrice,
      timeline: service.timeline,
      features: service.features
    }

    setSelectedServices([...selectedServices, orderItem])
  }

  const removeService = (index: number) => {
    setSelectedServices(selectedServices.filter((_, i) => i !== index))
  }

  const updateServicePrice = (index: number, newPrice: number) => {
    const updated = [...selectedServices]
    updated[index].price = newPrice
    setSelectedServices(updated)
  }

  const handleSubmitOrder = async () => {
    if (selectedServices.length === 0 || !customerInfo.name || !customerInfo.email) {
      return
    }

    setIsSubmitting(true)

    try {
      const order = createOrder({
        customerId: `CUST-${Date.now()}`,
        customerName: customerInfo.name,
        customerEmail: customerInfo.email,
        companyName: customerInfo.companyName,
        projectName: customerInfo.projectName,
        description: customerInfo.description,
        items: selectedServices,
        totalAmount: calculateOrderTotal(selectedServices),
        estimatedTimeline: estimateTimeline(selectedServices),
        status: 'pending',
        priority: 'medium'
      })

      setOrderId(order.id)
      setOrderSubmitted(true)
    } catch (error) {
      console.error('Failed to submit order:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (orderSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="card-organic p-12 text-center max-w-2xl mx-4"
        >
          <div className="w-20 h-20 bg-leaf-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-leaf-600" />
          </div>
          <h1 className="text-3xl font-serif text-bark-800 mb-4">Order Submitted Successfully!</h1>
          <p className="text-bark-600 mb-6">
            Your order <strong>{orderId}</strong> has been received and is being reviewed by our team.
            You&apos;ll receive a confirmation email shortly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href={`/app/orders/${orderId}`} className="btn-leaf">
              View Order Status
            </Link>
            <Link href="/" className="btn-secondary">
              Back to Home
            </Link>
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      {/* Header */}
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/services" className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Services
              </Link>
              <div className="flex items-center">
                <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
                <h1 className="text-2xl font-serif text-bark-800">Place Your Order</h1>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div
                  key={step}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    currentStep >= step
                      ? 'bg-leaf-500 text-white'
                      : 'bg-bark-200 text-bark-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="card-organic p-6">
                  <h2 className="text-2xl font-serif text-bark-800 mb-6">Select Services</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {services.map((service) => (
                      <div
                        key={service.id}
                        className="border border-bark-200 rounded-organic p-4 hover:border-leaf-300 transition-colors"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="font-semibold text-bark-800">{service.name}</h3>
                          <button
                            onClick={() => addService(service.id)}
                            className="p-1 text-leaf-600 hover:bg-leaf-50 rounded"
                          >
                            <Plus className="w-5 h-5" />
                          </button>
                        </div>
                        <p className="text-sm text-bark-600 mb-3">{service.description}</p>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-leaf-600 font-medium">Starting at ${service.basePrice.toLocaleString()}</span>
                          <span className="text-bark-500">{service.timeline}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedServices.length > 0 && (
                  <div className="card-organic p-6">
                    <h3 className="text-xl font-semibold text-bark-800 mb-4">Selected Services</h3>
                    <div className="space-y-4">
                      {selectedServices.map((item, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-leaf-50 rounded-organic">
                          <div className="flex-1">
                            <h4 className="font-medium text-bark-800">{item.serviceName}</h4>
                            <div className="flex items-center space-x-4 text-sm text-bark-600 mt-1">
                              <span>{item.timeline}</span>
                              <span>•</span>
                              <span>{item.features.length} features</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <input
                              type="number"
                              value={item.price}
                              onChange={(e) => updateServicePrice(index, parseInt(e.target.value) || 0)}
                              className="w-24 px-2 py-1 border border-bark-300 rounded text-right"
                            />
                            <button
                              onClick={() => removeService(index)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-organic p-6"
              >
                <h2 className="text-2xl font-serif text-bark-800 mb-6">Project Details</h2>
                <div className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-2">
                        <User className="w-4 h-4 inline mr-2" />
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                        className="input-organic w-full"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-2">
                        <Mail className="w-4 h-4 inline mr-2" />
                        Email Address *
                      </label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                        className="input-organic w-full"
                        placeholder="john@company.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-2">
                        <Building className="w-4 h-4 inline mr-2" />
                        Company Name
                      </label>
                      <input
                        type="text"
                        value={customerInfo.companyName}
                        onChange={(e) => setCustomerInfo({...customerInfo, companyName: e.target.value})}
                        className="input-organic w-full"
                        placeholder="Acme Inc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-bark-700 mb-2">
                        <FileText className="w-4 h-4 inline mr-2" />
                        Project Name
                      </label>
                      <input
                        type="text"
                        value={customerInfo.projectName}
                        onChange={(e) => setCustomerInfo({...customerInfo, projectName: e.target.value})}
                        className="input-organic w-full"
                        placeholder="My Awesome Project"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-bark-700 mb-2">
                      Project Description
                    </label>
                    <textarea
                      value={customerInfo.description}
                      onChange={(e) => setCustomerInfo({...customerInfo, description: e.target.value})}
                      className="input-organic w-full h-32 resize-none"
                      placeholder="Tell us about your project goals, requirements, and any specific features you need..."
                    />
                  </div>
                </div>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="card-organic p-6"
              >
                <h2 className="text-2xl font-serif text-bark-800 mb-6">Review & Submit</h2>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-semibold text-bark-800 mb-3">Customer Information</h3>
                    <div className="bg-bark-50 rounded-organic p-4 space-y-2">
                      <p><strong>Name:</strong> {customerInfo.name}</p>
                      <p><strong>Email:</strong> {customerInfo.email}</p>
                      {customerInfo.companyName && <p><strong>Company:</strong> {customerInfo.companyName}</p>}
                      {customerInfo.projectName && <p><strong>Project:</strong> {customerInfo.projectName}</p>}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-bark-800 mb-3">Selected Services</h3>
                    <div className="space-y-3">
                      {selectedServices.map((item, index) => (
                        <div key={index} className="flex justify-between items-center p-3 bg-bark-50 rounded-organic">
                          <span>{item.serviceName}</span>
                          <span className="font-medium">${item.price.toLocaleString()}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
                className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {currentStep < 3 ? (
                <button
                  onClick={() => setCurrentStep(currentStep + 1)}
                  disabled={currentStep === 1 && selectedServices.length === 0}
                  className="btn-leaf disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleSubmitOrder}
                  disabled={isSubmitting || !customerInfo.name || !customerInfo.email}
                  className="btn-leaf disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit Order'}
                </button>
              )}
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <div className="card-organic p-6">
                <h3 className="text-xl font-semibold text-bark-800 mb-4">Order Summary</h3>
                {selectedServices.length === 0 ? (
                  <p className="text-bark-500 text-center py-8">No services selected</p>
                ) : (
                  <div className="space-y-4">
                    {selectedServices.map((item, index) => (
                      <div key={index} className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-medium text-bark-800">{item.serviceName}</p>
                          <p className="text-sm text-bark-500">{item.timeline}</p>
                        </div>
                        <p className="font-medium text-bark-800">${item.price.toLocaleString()}</p>
                      </div>
                    ))}
                    <div className="border-t border-bark-200 pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-bark-800">Total</span>
                        <span className="font-bold text-xl text-leaf-600">
                          ${calculateOrderTotal(selectedServices).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center text-sm text-bark-600">
                        <Clock className="w-4 h-4 mr-1" />
                        Estimated timeline: {estimateTimeline(selectedServices)}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

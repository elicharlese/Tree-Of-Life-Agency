'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, CreditCard, Shield, TreePine } from 'lucide-react'
import Link from 'next/link'

export default function Checkout() {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  })
  
  const [isProcessing, setIsProcessing] = useState(false)
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsProcessing(true)
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      // Redirect to success page
      window.location.href = '/checkout/success'
    }, 2000)
  }

  // Mock cart items and total
  const cartItems = [
    { id: 1, name: 'Seedling Access', description: 'Basic knowledge sharing access', price: 29.99 },
    { id: 2, name: 'Wisdom Guide', description: 'Curated expertise documentation', price: 9.99 }
  ]
  
  const subtotal = cartItems.reduce((sum, item) => sum + item.price, 0)
  const tax = subtotal * 0.08
  const total = subtotal + tax

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="flex items-center text-bark-600 hover:text-leaf-600 w-fit">
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back to Library
          </Link>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Checkout Form */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="card-organic p-8"
          >
            <div className="flex items-center mb-6">
              <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
              <h1 className="text-2xl font-serif text-bark-800">Tree of Life Checkout</h1>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-lg font-semibold text-bark-800 mb-4">Contact Information</h2>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-organic w-full"
                  placeholder="Email address"
                  required
                />
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-bark-800 mb-4">Billing Address</h2>
                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input-organic w-full"
                    placeholder="Full name"
                    required
                  />
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="input-organic w-full"
                    placeholder="Address"
                    required
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className="input-organic"
                      placeholder="City"
                      required
                    />
                    <input
                      type="text"
                      name="state"
                      value={formData.state}
                      onChange={handleChange}
                      className="input-organic"
                      placeholder="State"
                      required
                    />
                  </div>
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    className="input-organic w-full"
                    placeholder="ZIP code"
                    required
                  />
                </div>
              </div>
              
              <div>
                <h2 className="text-lg font-semibold text-bark-800 mb-4">Payment Information</h2>
                <div className="space-y-4">
                  <div className="relative">
                    <input
                      type="text"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      className="input-organic w-full pl-10"
                      placeholder="Card number"
                      required
                    />
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-bark-400" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="text"
                      name="expiry"
                      value={formData.expiry}
                      onChange={handleChange}
                      className="input-organic"
                      placeholder="MM/YY"
                      required
                    />
                    <input
                      type="text"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleChange}
                      className="input-organic"
                      placeholder="CVV"
                      required
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-leaf-50 ">
                <Shield className="h-5 w-5 text-leaf-500 mr-2" />
                <p className="text-sm text-bark-600">
                  Your payment information is securely encrypted and processed.
                </p>
              </div>
              
              <button
                type="submit"
                disabled={isProcessing}
                className="btn-organic w-full flex items-center justify-center"
              >
                {isProcessing ? (
                  <span>Processing...</span>
                ) : (
                  <>
                    <CreditCard className="mr-2 h-5 w-5" />
                    Complete Purchase
                  </>
                )}
              </button>
            </form>
          </motion.div>
          
          {/* Order Summary */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="card-organic p-8 h-fit"
          >
            <h2 className="text-xl font-serif text-bark-800 mb-6">Order Summary</h2>
            
            <div className="space-y-4 mb-6">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium text-bark-800">{item.name}</h3>
                    <p className="text-sm text-bark-600">{item.description}</p>
                  </div>
                  <div className="font-medium text-bark-800">${item.price.toFixed(2)}</div>
                </div>
              ))}
            </div>
            
            <div className="border-t border-bark-200 pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-bark-600">Subtotal</span>
                <span className="text-bark-800">${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-bark-600">Tax</span>
                <span className="text-bark-800">${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-semibold">
                <span className="text-bark-800">Total</span>
                <span className="text-bark-800">${total.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="mt-8 p-4 bg-wisdom-50 ">
              <h3 className="font-semibold text-bark-800 mb-2">Knowledge Investment</h3>
              <p className="text-sm text-bark-600">
                Your purchase supports our collective wisdom initiative and helps maintain our living library 
                for all members of the Tree of Life Agency community.
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

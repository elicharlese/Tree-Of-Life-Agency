'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Mail, 
  ArrowLeft,
  TreePine
} from 'lucide-react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [isSubmitted, setIsSubmitted] = useState(false)
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle forgot password logic here
    console.log('Reset password for:', email)
    setIsSubmitted(true)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="card-organic p-8">
          <div className="text-center mb-8">
            <TreePine className="h-12 w-12 text-leaf-500 mx-auto mb-4" />
            <h1 className="text-2xl font-serif text-bark-800 mb-2">Tree of Life Agency</h1>
            <p className="text-bark-600">Reset your password</p>
          </div>
          
          {isSubmitted ? (
            <div className="text-center py-8">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-6"
              >
                <Mail className="h-16 w-16 text-leaf-500 mx-auto" />
              </motion.div>
              <h2 className="text-xl font-serif text-bark-800 mb-4">Check Your Email</h2>
              <p className="text-bark-600 mb-6">
                We&apos;ve sent a password reset link to <span className="font-medium">{email}</span>. 
                Please check your inbox and follow the instructions to reset your password.
              </p>
              <Link href="/auth/signin" className="btn-organic w-full flex items-center justify-center">
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-bark-700 mb-2">
                  Email Address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input-organic"
                  placeholder="your.email@example.com"
                  required
                />
                <p className="mt-2 text-sm text-bark-500">
                  Enter your email address and we&#39;ll send you a link to reset your password.
                </p>
              </div>
              
              <button
                type="submit"
                className="btn-organic w-full flex items-center justify-center"
              >
                <Mail className="mr-2 h-5 w-5" />
                Send Reset Link
              </button>
              
              <div className="text-center">
                <Link href="/auth/signin" className="flex items-center justify-center text-sm text-bark-500 hover:text-bark-700">
                  <ArrowLeft className="mr-1 h-4 w-4" />
                  Back to sign in
                </Link>
              </div>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  )
}

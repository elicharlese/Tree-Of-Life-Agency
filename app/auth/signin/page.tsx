'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Eye, EyeOff, LogIn, TreePine } from 'lucide-react'
import Link from 'next/link'
import { Input } from '@/libs/shared-ui/components'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (data.success) {
        // Store token and user data
        localStorage.setItem('authToken', data.data.token)
        localStorage.setItem('user', JSON.stringify(data.data.user))

        // Redirect to dashboard
        window.location.href = '/dashboard'
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (error) {
      setError('Network error. Please try again.')
    } finally {
      setIsLoading(false)
    }
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
            <p className="text-bark-600">Sign in to your knowledge library</p>
          </div>
          
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 p-4 flex items-center space-x-3">
              <div className="text-red-500">⚠️</div>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-bark-700 mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full"
                placeholder="your.email@example.com"
                required
              />
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-bark-700 mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pr-12"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-bark-400" />
                  ) : (
                    <Eye className="h-5 w-5 text-bark-400" />
                  )}
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-leaf-600 focus:ring-leaf-500 border-bark-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-bark-700">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link href="/auth/forgot-password" className="font-medium text-leaf-600 hover:text-leaf-500">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="btn-organic w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2"></div>
              ) : (
                <LogIn className="mr-2 h-5 w-5" />
              )}
              {isLoading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-bark-600">
              Don&apos;t have an account?{' '}
              <Link href="/auth/signup" className="font-medium text-leaf-600 hover:text-leaf-500">
                Sign up
              </Link>
            </p>
          </div>
          
          <div className="mt-4 text-center">
            <Link href="/" className="flex items-center justify-center text-sm text-bark-500 hover:text-bark-700">
              <ArrowLeft className="mr-1 h-4 w-4" />
              Back to home
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

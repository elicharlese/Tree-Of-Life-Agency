'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Eye, 
  EyeOff, 
  LogIn, 
  TreePine,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle sign in logic here
    console.log('Sign in with:', { email, password })
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
            </div>
            
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-bark-700 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-organic w-full"
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
              className="btn-organic w-full flex items-center justify-center"
            >
              <LogIn className="mr-2 h-5 w-5" />
              Sign In
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

'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, User } from 'lucide-react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'

export default function AccountSettings() {
  const { user, updateProfile, isLoading } = useAuth()
  const [formState, setFormState] = useState({
    firstName: '',
    lastName: '',
    email: '',
  })
  const [status, setStatus] = useState<'idle' | 'saving' | 'success'>('idle')

  useEffect(() => {
    if (user) {
      setFormState({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
      })
    }
  }, [user])

  const handleChange = (field: keyof typeof formState, value: string) => {
    setFormState(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!user) return
    setStatus('saving')
    await updateProfile({
      ...user,
      firstName: formState.firstName,
      lastName: formState.lastName,
      email: formState.email,
    })
    setStatus('success')
    setTimeout(() => setStatus('idle'), 2000)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center">
        <div className="text-bark-600 text-sm uppercase tracking-[0.4em]">Loading settings…</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50">
      <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/app" className="flex items-center text-bark-600 hover:text-leaf-600">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to dashboard
            </Link>
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-bark-400">Account</p>
              <h1 className="text-2xl font-serif text-bark-800">Settings</h1>
            </div>
          </div>
          <div className="flex items-center space-x-2 text-sm text-bark-500">
            <User className="w-4 h-4" />
            <span>{user?.role ?? 'Member'}</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="card-organic p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">First Name</label>
                <input
                  type="text"
                  value={formState.firstName}
                  onChange={(e) => handleChange('firstName', e.target.value)}
                  className="input-organic w-full"
                  placeholder="First name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-bark-700 mb-2">Last Name</label>
                <input
                  type="text"
                  value={formState.lastName}
                  onChange={(e) => handleChange('lastName', e.target.value)}
                  className="input-organic w-full"
                  placeholder="Last name"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-bark-700 mb-2">Email</label>
              <input
                type="email"
                value={formState.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="input-organic w-full"
                placeholder="you@email.com"
              />
              <p className="text-xs text-bark-500 mt-2">We’ll send notifications to this email.</p>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-bark-200">
              <p className="text-sm text-bark-500">
                Need to update something else? Contact support@treeoflife.agency
              </p>
              <button
                type="submit"
                className="btn-leaf flex items-center space-x-2"
                disabled={status === 'saving'}
              >
                <Save className="w-4 h-4" />
                <span>{status === 'saving' ? 'Saving…' : 'Save changes'}</span>
              </button>
            </div>
            {status === 'success' && (
              <div className="text-sm text-leaf-600">
                Profile updated. Changes will reflect across your dashboard.
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </div>
  )
}

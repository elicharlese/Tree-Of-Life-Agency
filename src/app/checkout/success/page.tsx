'use client'

import { motion } from 'framer-motion'
import { 
  CheckCircle, 
  TreePine
} from 'lucide-react'
import Link from 'next/link'

export default function CheckoutSuccess() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-bark-50 via-leaf-50 to-root-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <div className="card-organic p-8">
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="mb-6"
          >
            <CheckCircle className="h-16 w-16 text-leaf-500 mx-auto" />
          </motion.div>
          
          <h1 className="text-2xl font-serif text-bark-800 mb-4">Purchase Successful!</h1>
          <p className="text-bark-600 mb-2">
            Thank you for your investment in knowledge. Your access to the Tree of Life Agency library 
            has been upgraded.
          </p>
          <p className="text-bark-600 mb-8">
            A confirmation email has been sent to your inbox with details about your purchase.
          </p>
          
          <div className="space-y-4">
            <Link href="/" className="btn-organic w-full flex items-center justify-center">
              <TreePine className="mr-2 h-5 w-5" />
              Return to Library
            </Link>
            
            <Link href="/auth/signin" className="btn-leaf w-full flex items-center justify-center">
              Sign In to Access
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

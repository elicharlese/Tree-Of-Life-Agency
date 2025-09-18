import React from 'react'
import Link from 'next/link'
import { ArrowLeft, TreePine } from 'lucide-react'
import { Button } from '../Button'

interface PageHeaderProps {
  title: string
  showBackButton?: boolean
  backHref?: string
  actionButton?: {
    label: string
    href?: string
    onClick?: () => void
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  }
}

export function PageHeader({ 
  title, 
  showBackButton = true, 
  backHref = '/',
  actionButton 
}: PageHeaderProps) {
  return (
    <div className="bg-white/90 backdrop-blur-sm border-b border-bark-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {showBackButton && (
              <Link href={backHref} className="flex items-center text-bark-600 hover:text-leaf-600 mr-6">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Home
              </Link>
            )}
            <div className="flex items-center">
              <TreePine className="h-8 w-8 text-leaf-500 mr-3" />
              <h1 className="text-2xl font-serif text-bark-800">{title}</h1>
            </div>
          </div>
          {actionButton && (
            <div className="flex items-center space-x-4">
              {actionButton.href ? (
                <Link href={actionButton.href}>
                  <Button variant={actionButton.variant || 'primary'}>
                    {actionButton.label}
                  </Button>
                </Link>
              ) : (
                <Button 
                  variant={actionButton.variant || 'primary'}
                  onClick={actionButton.onClick}
                >
                  {actionButton.label}
                </Button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

import React from 'react'
import { cn } from '@/lib/utils'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'organic' | 'leaf' | 'wisdom' | 'secondary' | 'ghost' | 'link'
  size?: 'sm' | 'md' | 'lg' | 'icon'
  children: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'organic', size = 'md', children, ...props }, ref) => {
    const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:pointer-events-none disabled:opacity-50'
    
    const variants = {
      organic: 'bg-bark-600 hover:bg-bark-700 text-white shadow-organic hover:shadow-bark focus:ring-bark-500 transform hover:scale-105 ',
      leaf: 'bg-leaf-500 hover:bg-leaf-600 text-white shadow-organic hover:shadow-leaf focus:ring-leaf-500 transform hover:scale-105 ',
      wisdom: 'bg-wisdom-500 hover:bg-wisdom-600 text-white shadow-organic hover:shadow-lg focus:ring-wisdom-500 transform hover:scale-105 ',
      secondary: 'bg-white hover:bg-bark-50 text-bark-700 border border-bark-300 shadow-sm hover:shadow-organic focus:ring-bark-500 ',
      ghost: 'hover:bg-bark-100 text-bark-700 ',
      link: 'text-leaf-600 hover:text-leaf-700 underline-offset-4 hover:underline'
    }

    const sizes = {
      sm: 'h-9 px-4 py-2 text-sm',
      md: 'h-10 px-6 py-3 text-sm',
      lg: 'h-12 px-8 py-3 text-base',
      icon: 'h-10 w-10'
    }

    return (
      <button
        className={cn(
          baseStyles,
          variants[variant],
          sizes[size],
          className
        )}
        ref={ref}
        {...props}
      >
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }

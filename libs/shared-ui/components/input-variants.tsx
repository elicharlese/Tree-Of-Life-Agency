import React from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'organic'
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant = 'default', error = false, type, ...props }, ref) => {
    const baseStyles = 'flex h-10 w-full  border px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-bark-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all duration-200'
    
    const variants = {
      default: 'border-gray-300 bg-white focus-visible:ring-blue-500',
      organic: 'bg-white/90 border-bark-300 focus-visible:ring-leaf-500 focus-visible:border-leaf-500 shadow-sm '
    }

    const errorStyles = error ? 'border-red-500 focus-visible:ring-red-500' : ''

    return (
      <input
        type={type}
        className={cn(
          baseStyles,
          variants[variant],
          errorStyles,
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Input.displayName = 'Input'

export { Input }

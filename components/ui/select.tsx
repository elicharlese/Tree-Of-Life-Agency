import React from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  variant?: 'default' | 'organic'
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    const variants = {
      default: 'border-gray-300 focus:ring-blue-500 focus:border-blue-500',
      organic: 'border-bark-300 focus:ring-leaf-500 focus:border-leaf-500 bg-white/90'
    }

    return (
      <div className="relative">
        <select
          className={cn(
            'flex h-10 w-full rounded-md border bg-white px-3 py-2 pr-10 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 appearance-none',
            variants[variant],
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-bark-500 pointer-events-none" />
      </div>
    )
  }
)

Select.displayName = 'Select'

export { Select }

'use client'

import { Sprout, Leaf, TreeDeciduous, TreePine } from 'lucide-react'
import { OrderSize } from '../../shared-utils/orders'
import { getOrderSizeInfo } from '../../shared-utils/orderSizes'

interface OrderSizeBadgeProps {
  size: OrderSize
  showLabel?: boolean
  className?: string
}

const iconMap = {
  Sprout,
  Leaf,
  TreeDeciduous,
  TreePine
} as const

export function OrderSizeBadge({ size, showLabel = true, className = '' }: OrderSizeBadgeProps) {
  const sizeInfo = getOrderSizeInfo(size)
  
  if (!sizeInfo) return null
  
  const IconComponent = iconMap[sizeInfo.icon as keyof typeof iconMap]
  
  const colorClasses = {
    leaf: 'bg-leaf-100 text-leaf-800 border-leaf-300',
    wisdom: 'bg-wisdom-100 text-wisdom-800 border-wisdom-300',
    bark: 'bg-bark-100 text-bark-800 border-bark-300',
    root: 'bg-root-100 text-root-800 border-root-300'
  }
  
  return (
    <span className={`inline-flex items-center space-x-2 px-3 py-1 border text-sm font-medium ${colorClasses[sizeInfo.color as keyof typeof colorClasses]} ${className}`}>
      <IconComponent className="w-4 h-4" />
      {showLabel && <span>{sizeInfo.displayName}</span>}
    </span>
  )
}

import { OrderSize } from './orders'

export interface OrderSizeInfo {
  id: OrderSize
  name: string
  displayName: string
  description: string
  priceRange: string
  icon: string
  color: string
}

export const orderSizes: OrderSizeInfo[] = [
  {
    id: 'seedling',
    name: 'Seedling',
    displayName: 'Seedlings',
    description: 'Small projects perfect for startups and MVPs',
    priceRange: '$1,000 - $5,000',
    icon: 'Sprout',
    color: 'leaf'
  },
  {
    id: 'sapling',
    name: 'Sapling',
    displayName: 'Saplings',
    description: 'Medium projects for growing businesses',
    priceRange: '$5,000 - $15,000',
    icon: 'Leaf',
    color: 'leaf'
  },
  {
    id: 'stalk',
    name: 'Stalk',
    displayName: 'Stalks',
    description: 'Large projects with complex requirements',
    priceRange: '$15,000 - $50,000',
    icon: 'TreeDeciduous',
    color: 'wisdom'
  },
  {
    id: 'sequoia',
    name: 'Sequoia',
    displayName: 'Sequoias',
    description: 'Enterprise-level solutions and platforms',
    priceRange: '$50,000+',
    icon: 'TreePine',
    color: 'root'
  }
]

export function getOrderSizeInfo(size: OrderSize): OrderSizeInfo | undefined {
  return orderSizes.find(s => s.id === size)
}

export function determineOrderSize(totalAmount: number): OrderSize {
  if (totalAmount < 5000) return 'seedling'
  if (totalAmount < 15000) return 'sapling'
  if (totalAmount < 50000) return 'stalk'
  return 'sequoia'
}

export function getOrderSizeByName(name: string): OrderSizeInfo | undefined {
  return orderSizes.find(s => s.name.toLowerCase() === name.toLowerCase())
}

// Mock types for orders since shared-types may not be available
export type OrderSize = 'seedling' | 'sapling' | 'stalk' | 'sequoia';

export interface Order {
  id: string;
  customerId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  size?: OrderSize;
  items: OrderItem[];
  total: number;
  totalAmount?: number;
  createdAt: Date;
  updatedAt: Date;
  projectName?: string;
  customerName?: string;
  description?: string;
  estimatedTimeline?: string;
  milestones?: any[];
  customerEmail?: string;
  companyName?: string;
  priority?: string;
  assignedDevelopers?: string[];
  techStack?: string[];
}

export interface OrderItem {
  id: string;
  serviceId: string;
  name: string;
  serviceName?: string;
  price: number;
  timeline: string;
  features?: string[];
  customizations?: Record<string, unknown>;
}

export interface Developer {
  id: string;
  name: string;
  role: string;
  avatar: string;
  skills: string[];
  rating: number;
  hourlyRate: number;
  availability: 'available' | 'busy';
}

// Mock data storage - in production, this would be a database
const orders: Order[] = []
let orderCounter = 1

export const services = [
  {
    id: 'frontend',
    name: 'Frontend Development',
    basePrice: 3000,
    timeline: '2-4 weeks',
    features: ['React & Next.js', 'TypeScript', 'Responsive Design', 'Performance Optimization'],
    description: 'Modern web applications built with React, Next.js, and cutting-edge technologies.'
  },
  {
    id: 'mobile',
    name: 'Mobile Applications',
    basePrice: 5000,
    timeline: '4-8 weeks',
    features: ['React Native', 'Native iOS/Android', 'App Store Deployment', 'Push Notifications'],
    description: 'Native and cross-platform mobile apps for iOS and Android.'
  },
  {
    id: 'design',
    name: 'UI/UX Design',
    basePrice: 2000,
    timeline: '1-3 weeks',
    features: ['User Research', 'Wireframing', 'Prototyping', 'Design Systems'],
    description: 'Beautiful, user-centered designs that convert visitors into customers.'
  },
  {
    id: 'backend',
    name: 'Backend Systems',
    basePrice: 4000,
    timeline: '3-6 weeks',
    features: ['Node.js & Python', 'Database Design', 'API Development', 'Security Implementation'],
    description: 'Scalable server architecture and API development.'
  },
  {
    id: 'devops',
    name: 'DevOps & Infrastructure',
    basePrice: 2500,
    timeline: '1-2 weeks',
    features: ['AWS/Azure/GCP', 'Docker & Kubernetes', 'CI/CD Pipelines', 'Monitoring & Logging'],
    description: 'Cloud deployment, CI/CD pipelines, and infrastructure management.'
  },
  {
    id: 'strategy',
    name: 'Business Strategy',
    basePrice: 1500,
    timeline: '1-2 weeks',
    features: ['Technical Audits', 'Architecture Planning', 'Team Training', 'Growth Strategy'],
    description: 'Technical consulting and product strategy to grow your business.'
  },
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    basePrice: 6000,
    timeline: '6-12 weeks',
    features: ['Machine Learning Models', 'Natural Language Processing', 'Computer Vision', 'Predictive Analytics'],
    description: 'Intelligent solutions powered by machine learning and artificial intelligence.'
  },
  {
    id: 'blockchain',
    name: 'Blockchain & Web3',
    basePrice: 8000,
    timeline: '8-16 weeks',
    features: ['Smart Contracts', 'DeFi Applications', 'NFT Platforms', 'Blockchain Integration'],
    description: 'Decentralized applications and blockchain solutions for the future.'
  },
  {
    id: 'ecommerce',
    name: 'E-commerce Solutions',
    basePrice: 4500,
    timeline: '4-8 weeks',
    features: ['Custom Storefronts', 'Payment Integration', 'Inventory Management', 'Analytics Dashboard'],
    description: 'Custom online stores and marketplace platforms with seamless checkout.'
  },
  {
    id: 'cms',
    name: 'Content Management Systems',
    basePrice: 3500,
    timeline: '3-6 weeks',
    features: ['Custom CMS Development', 'Headless Architecture', 'Multi-language Support', 'SEO Optimization'],
    description: 'Flexible CMS solutions for content creators and marketing teams.'
  },
  {
    id: 'testing',
    name: 'Testing & Quality Assurance',
    basePrice: 2000,
    timeline: '2-4 weeks',
    features: ['Automated Testing', 'Manual QA', 'Performance Testing', 'Security Testing'],
    description: 'Comprehensive testing services to ensure software reliability and performance.'
  },
  {
    id: 'security',
    name: 'Security Audits & Implementation',
    basePrice: 3000,
    timeline: '2-6 weeks',
    features: ['Security Audits', 'Vulnerability Assessment', 'Compliance Implementation', 'Penetration Testing'],
    description: 'Protect your applications with enterprise-grade security solutions.'
  }
]

export const developers: Developer[] = [
  {
    id: 'sarah-chen',
    name: 'Sarah Chen',
    role: 'Frontend Architect',
    avatar: '👩‍💻',
    skills: ['React', 'TypeScript', 'Next.js', 'Tailwind CSS'],
    rating: 4.9,
    hourlyRate: 120,
    availability: 'available'
  },
  {
    id: 'marcus-johnson',
    name: 'Marcus Johnson',
    role: 'Backend Engineer',
    avatar: '👨‍💻',
    skills: ['Node.js', 'AWS', 'Docker', 'PostgreSQL'],
    rating: 4.8,
    hourlyRate: 110,
    availability: 'available'
  },
  {
    id: 'elena-rodriguez',
    name: 'Elena Rodriguez',
    role: 'UX/UI Designer',
    avatar: '🎨',
    skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
    rating: 4.9,
    hourlyRate: 100,
    availability: 'busy'
  },
  {
    id: 'david-kim',
    name: 'David Kim',
    role: 'DevOps Specialist',
    avatar: '⚙️',
    skills: ['Kubernetes', 'CI/CD', 'Terraform', 'Monitoring'],
    rating: 4.8,
    hourlyRate: 115,
    availability: 'available'
  }
]

export function createOrder(orderData: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Order {
  const totalAmount = orderData.totalAmount || orderData.total || 0
  
  // Auto-determine order size based on total amount
  let size: OrderSize = 'seedling'
  if (totalAmount >= 50000) size = 'sequoia'
  else if (totalAmount >= 15000) size = 'stalk'
  else if (totalAmount >= 5000) size = 'sapling'
  
  const order: Order = {
    ...orderData,
    size: orderData.size || size,
    id: `ORD-${orderCounter.toString().padStart(4, '0')}`,
    createdAt: new Date(),
    updatedAt: new Date()
  }
  
  orders.push(order)
  orderCounter++
  
  return order
}

export function getOrders(): Order[] {
  return orders
}

export function getOrderById(id: string): Order | undefined {
  return orders.find(order => order.id === id)
}

export function getOrdersByCustomer(customerId: string): Order[] {
  return orders.filter(order => order.customerId === customerId)
}

export function updateOrder(id: string, updates: Partial<Order>): Order | undefined {
  const orderIndex = orders.findIndex(order => order.id === id)
  if (orderIndex === -1) return undefined
  
  orders[orderIndex] = {
    ...orders[orderIndex],
    ...updates,
    updatedAt: new Date()
  }
  
  return orders[orderIndex]
}

export function getServiceById(id: string) {
  return services.find(service => service.id === id)
}

export function calculateOrderTotal(items: OrderItem[]): number {
  return items.reduce((total, item) => total + item.price, 0)
}

export function estimateTimeline(items: OrderItem[]): string {
  // Simple timeline estimation - in reality this would be more complex
  const totalWeeks = items.reduce((total, item) => {
    const weeks = parseInt(item.timeline.split('-')[1] || item.timeline.split(' ')[0])
    return total + weeks
  }, 0)
  
  return `${Math.ceil(totalWeeks * 0.8)}-${totalWeeks} weeks`
}

export interface OrderItem {
  serviceId: string
  serviceName: string
  price: number
  timeline: string
  features: string[]
  customizations?: string
}

export interface Order {
  id: string
  customerId: string
  customerName: string
  customerEmail: string
  companyName?: string
  projectName: string
  description: string
  items: OrderItem[]
  totalAmount: number
  estimatedTimeline: string
  status: 'pending' | 'approved' | 'in_progress' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  createdAt: Date
  updatedAt: Date
  assignedDevelopers?: string[]
  milestones?: Milestone[]
  techStack?: string[]
  architecture?: ArchitectureBreakdown
}

export interface Milestone {
  id: string
  title: string
  description: string
  dueDate: Date
  status: 'pending' | 'in_progress' | 'completed'
  progress: number
}

export interface ArchitectureBreakdown {
  frontend: number
  backend: number
  database: number
  integrations: number
  infrastructure: number
  testing: number
}

export interface Developer {
  id: string
  name: string
  role: string
  avatar: string
  skills: string[]
  rating: number
  hourlyRate: number
  availability: 'available' | 'busy' | 'unavailable'
}

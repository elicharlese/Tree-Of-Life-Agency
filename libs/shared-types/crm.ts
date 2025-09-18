export interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  website?: string
  industry?: string
  size?: 'startup' | 'small' | 'medium' | 'enterprise'
  status: 'active' | 'inactive' | 'prospect' | 'churned'
  source: 'website' | 'referral' | 'social' | 'advertising' | 'cold_outreach' | 'other'
  assignedTo?: string
  tags: string[]
  address?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  socialProfiles?: {
    linkedin?: string
    twitter?: string
    github?: string
  }
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date
  totalValue: number
  projectsCount: number
  notes?: string
}

export interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  source: 'website' | 'referral' | 'social' | 'advertising' | 'cold_outreach' | 'event' | 'other'
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  score: number // Lead scoring 0-100
  assignedTo?: string
  estimatedValue?: number
  expectedCloseDate?: Date
  tags: string[]
  notes?: string
  activities: Activity[]
  createdAt: Date
  updatedAt: Date
  convertedAt?: Date
  convertedToCustomerId?: string
}

export interface Contact {
  id: string
  customerId: string
  name: string
  email: string
  phone?: string
  jobTitle?: string
  department?: string
  isPrimary: boolean
  tags: string[]
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface Deal {
  id: string
  name: string
  customerId: string
  contactId?: string
  value: number
  stage: 'discovery' | 'proposal' | 'negotiation' | 'contract' | 'closed_won' | 'closed_lost'
  probability: number // 0-100
  expectedCloseDate: Date
  actualCloseDate?: Date
  assignedTo: string
  description?: string
  tags: string[]
  activities: Activity[]
  documents: Document[]
  createdAt: Date
  updatedAt: Date
  lostReason?: string
}

export interface Activity {
  id: string
  type: 'call' | 'email' | 'meeting' | 'task' | 'note' | 'proposal_sent' | 'contract_signed'
  subject: string
  description?: string
  relatedTo: {
    type: 'customer' | 'lead' | 'deal' | 'contact'
    id: string
  }
  assignedTo: string
  status: 'pending' | 'completed' | 'cancelled'
  priority: 'low' | 'medium' | 'high'
  dueDate?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Document {
  id: string
  name: string
  type: 'proposal' | 'contract' | 'nda' | 'invoice' | 'other'
  url: string
  size: number
  uploadedBy: string
  createdAt: Date
}

export interface CRMMetrics {
  totalCustomers: number
  activeCustomers: number
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  averageDealSize: number
  totalRevenue: number
  monthlyRecurringRevenue: number
  customerLifetimeValue: number
  churnRate: number
  salesCycleLength: number
  winRate: number
}

export interface Pipeline {
  stage: string
  deals: Deal[]
  totalValue: number
  averageProbability: number
  count: number
}

export interface CRMFilters {
  status?: string[]
  source?: string[]
  assignedTo?: string[]
  tags?: string[]
  dateRange?: {
    start: Date
    end: Date
  }
  valueRange?: {
    min: number
    max: number
  }
}
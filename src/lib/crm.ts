import { Customer, Lead, Deal, Activity, CRMMetrics } from '@/types/crm'

// Mock data for demonstration
export const mockCustomers: Customer[] = [
  {
    id: 'CUST-001',
    name: 'John Smith',
    email: 'john@techcorp.com',
    phone: '+1 (555) 123-4567',
    company: 'TechCorp Inc.',
    website: 'https://techcorp.com',
    industry: 'Technology',
    size: 'medium',
    status: 'active',
    source: 'website',
    assignedTo: 'sarah-chen',
    tags: ['enterprise', 'high-value'],
    address: {
      street: '123 Tech Street',
      city: 'San Francisco',
      state: 'CA',
      zipCode: '94105',
      country: 'USA'
    },
    socialProfiles: {
      linkedin: 'https://linkedin.com/in/johnsmith',
      twitter: '@johnsmith'
    },
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
    lastContactDate: new Date('2024-01-18'),
    totalValue: 27000,
    projectsCount: 1,
    notes: 'Key decision maker for e-commerce platform project'
  },
  {
    id: 'CUST-002',
    name: 'Sarah Johnson',
    email: 'sarah@innovate.io',
    phone: '+1 (555) 987-6543',
    company: 'Innovate Solutions',
    website: 'https://innovate.io',
    industry: 'Fintech',
    size: 'startup',
    status: 'active',
    source: 'referral',
    assignedTo: 'marcus-johnson',
    tags: ['fintech', 'mobile-first'],
    address: {
      street: '456 Innovation Ave',
      city: 'Austin',
      state: 'TX',
      zipCode: '73301',
      country: 'USA'
    },
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-05'),
    lastContactDate: new Date('2024-02-03'),
    totalValue: 45000,
    projectsCount: 2,
    notes: 'Looking for mobile app development and backend services'
  }
]

export const mockLeads: Lead[] = [
  {
    id: 'LEAD-001',
    name: 'Michael Chen',
    email: 'michael@startup.co',
    phone: '+1 (555) 456-7890',
    company: 'Startup Co',
    jobTitle: 'CTO',
    source: 'social',
    status: 'qualified',
    priority: 'high',
    score: 85,
    assignedTo: 'sarah-chen',
    estimatedValue: 35000,
    expectedCloseDate: new Date('2024-03-15'),
    tags: ['ai', 'machine-learning'],
    notes: 'Interested in AI-powered analytics platform',
    activities: [],
    createdAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12')
  },
  {
    id: 'LEAD-002',
    name: 'Emily Rodriguez',
    email: 'emily@growth.com',
    phone: '+1 (555) 321-0987',
    company: 'Growth Marketing Inc',
    jobTitle: 'VP of Technology',
    source: 'advertising',
    status: 'proposal',
    priority: 'medium',
    score: 72,
    assignedTo: 'marcus-johnson',
    estimatedValue: 28000,
    expectedCloseDate: new Date('2024-03-01'),
    tags: ['marketing', 'automation'],
    notes: 'Needs marketing automation platform',
    activities: [],
    createdAt: new Date('2024-02-05'),
    updatedAt: new Date('2024-02-08')
  }
]

export const mockDeals: Deal[] = [
  {
    id: 'DEAL-001',
    name: 'E-commerce Platform Development',
    customerId: 'CUST-001',
    value: 27000,
    stage: 'contract',
    probability: 90,
    expectedCloseDate: new Date('2024-02-28'),
    assignedTo: 'sarah-chen',
    description: 'Full-stack e-commerce platform with React and Node.js',
    tags: ['e-commerce', 'full-stack'],
    activities: [],
    documents: [],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-02-10')
  },
  {
    id: 'DEAL-002',
    name: 'Mobile App Development',
    customerId: 'CUST-002',
    value: 45000,
    stage: 'negotiation',
    probability: 75,
    expectedCloseDate: new Date('2024-03-15'),
    assignedTo: 'marcus-johnson',
    description: 'React Native mobile app with backend API',
    tags: ['mobile', 'react-native'],
    activities: [],
    documents: [],
    createdAt: new Date('2024-02-01'),
    updatedAt: new Date('2024-02-12')
  }
]

export const mockActivities: Activity[] = [
  {
    id: 'ACT-001',
    type: 'call',
    subject: 'Discovery call with John Smith',
    description: 'Discussed project requirements and timeline',
    relatedTo: { type: 'customer', id: 'CUST-001' },
    assignedTo: 'sarah-chen',
    status: 'completed',
    priority: 'high',
    completedAt: new Date('2024-01-18'),
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-18')
  },
  {
    id: 'ACT-002',
    type: 'email',
    subject: 'Follow-up proposal for Sarah Johnson',
    description: 'Sent detailed proposal for mobile app development',
    relatedTo: { type: 'customer', id: 'CUST-002' },
    assignedTo: 'marcus-johnson',
    status: 'completed',
    priority: 'medium',
    completedAt: new Date('2024-02-03'),
    createdAt: new Date('2024-02-03'),
    updatedAt: new Date('2024-02-03')
  }
]

// Helper functions
export function getCustomers(): Customer[] {
  return mockCustomers
}

export function getCustomerById(id: string): Customer | undefined {
  return mockCustomers.find(customer => customer.id === id)
}

export function getLeads(): Lead[] {
  return mockLeads
}

export function getLeadById(id: string): Lead | undefined {
  return mockLeads.find(lead => lead.id === id)
}

export function getDeals(): Deal[] {
  return mockDeals
}

export function getDealById(id: string): Deal | undefined {
  return mockDeals.find(deal => deal.id === id)
}

export function getActivities(): Activity[] {
  return mockActivities
}

export function getActivitiesByRelatedId(type: string, id: string): Activity[] {
  return mockActivities.filter(activity => 
    activity.relatedTo.type === type && activity.relatedTo.id === id
  )
}

export function getCRMMetrics(): CRMMetrics {
  const customers = getCustomers()
  const leads = getLeads()
  const deals = getDeals()
  
  const activeCustomers = customers.filter(c => c.status === 'active').length
  const qualifiedLeads = leads.filter(l => l.status === 'qualified').length
  const wonDeals = deals.filter(d => d.stage === 'closed_won')
  const totalDeals = deals.length
  
  return {
    totalCustomers: customers.length,
    activeCustomers,
    totalLeads: leads.length,
    qualifiedLeads,
    conversionRate: totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0,
    averageDealSize: deals.length > 0 ? deals.reduce((sum, deal) => sum + deal.value, 0) / deals.length : 0,
    totalRevenue: customers.reduce((sum, customer) => sum + customer.totalValue, 0),
    monthlyRecurringRevenue: 0, // Would be calculated based on subscription data
    customerLifetimeValue: customers.length > 0 ? customers.reduce((sum, customer) => sum + customer.totalValue, 0) / customers.length : 0,
    churnRate: 0, // Would be calculated based on churned customers
    salesCycleLength: 45, // Average days
    winRate: totalDeals > 0 ? (wonDeals.length / totalDeals) * 100 : 0
  }
}

export function getPipelineData() {
  const deals = getDeals()
  const stages = ['discovery', 'proposal', 'negotiation', 'contract', 'closed_won', 'closed_lost']
  
  return stages.map(stage => {
    const stageDeals = deals.filter(deal => deal.stage === stage)
    return {
      stage,
      deals: stageDeals,
      totalValue: stageDeals.reduce((sum, deal) => sum + deal.value, 0),
      averageProbability: stageDeals.length > 0 
        ? stageDeals.reduce((sum, deal) => sum + deal.probability, 0) / stageDeals.length 
        : 0,
      count: stageDeals.length
    }
  })
}

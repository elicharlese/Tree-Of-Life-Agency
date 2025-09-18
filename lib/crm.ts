// CRM utilities and types

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';
  source: 'WEBSITE' | 'REFERRAL' | 'PHONE' | 'EMAIL' | 'SOCIAL' | 'OTHER';
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
  source: 'WEBSITE' | 'REFERRAL' | 'PHONE' | 'EMAIL' | 'SOCIAL' | 'OTHER';
  score: number;
  probability: number;
  estimatedValue?: number;
  assignedTo?: string;
  tags?: string[];
  notes?: string;
  convertedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  customerId: string;
  customer?: Customer;
  status: 'PLANNING' | 'ACTIVE' | 'ON_HOLD' | 'COMPLETED' | 'CANCELLED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  budget?: number;
  progress: number;
  startDate?: Date;
  endDate?: Date;
  assignedUsers?: string[];
  tags?: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Mock data for development
export const mockCustomers: Customer[] = [
  {
    id: '1',
    firstName: 'John',
    lastName: 'Smith',
    email: 'john.smith@example.com',
    company: 'Acme Corp',
    status: 'ACTIVE',
    source: 'WEBSITE',
    tags: ['vip', 'enterprise'],
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date('2024-01-20'),
  },
  {
    id: '2',
    firstName: 'Sarah',
    lastName: 'Johnson',
    email: 'sarah.j@techstart.com',
    company: 'TechStart',
    status: 'PROSPECT',
    source: 'REFERRAL',
    tags: ['startup', 'potential'],
    createdAt: new Date('2024-01-18'),
    updatedAt: new Date('2024-01-22'),
  },
];

export const mockLeads: Lead[] = [
  {
    id: '1',
    firstName: 'Michael',
    lastName: 'Brown',
    email: 'michael.brown@innovate.com',
    company: 'Innovate Solutions',
    status: 'QUALIFIED',
    source: 'WEBSITE',
    score: 85,
    probability: 75,
    estimatedValue: 50000,
    tags: ['qualified', 'high-value'],
    createdAt: new Date('2024-01-10'),
    updatedAt: new Date('2024-01-25'),
  },
  {
    id: '2',
    firstName: 'Emily',
    lastName: 'Davis',
    email: 'emily.davis@startup.io',
    company: 'Startup.io',
    status: 'NEW',
    source: 'SOCIAL',
    score: 45,
    probability: 25,
    estimatedValue: 15000,
    tags: ['new', 'social-media'],
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-20'),
  },
];

// Utility functions
export function getCustomerFullName(customer: Customer): string {
  return `${customer.firstName} ${customer.lastName}`;
}

export function getLeadFullName(lead: Lead): string {
  return `${lead.firstName} ${lead.lastName}`;
}

export function calculateLeadScore(lead: Partial<Lead>): number {
  let score = 0;
  
  // Base score from status
  const statusScores = {
    NEW: 10,
    CONTACTED: 25,
    QUALIFIED: 50,
    PROPOSAL: 75,
    NEGOTIATION: 90,
    WON: 100,
    LOST: 0,
  };
  
  if (lead.status) {
    score += statusScores[lead.status];
  }
  
  // Company bonus
  if (lead.company) score += 10;
  
  // Value bonus
  if (lead.estimatedValue) {
    if (lead.estimatedValue > 100000) score += 20;
    else if (lead.estimatedValue > 50000) score += 15;
    else if (lead.estimatedValue > 10000) score += 10;
    else score += 5;
  }
  
  return Math.min(score, 100);
}

export function getStatusColor(status: string): string {
  const colors: Record<string, string> = {
    // Customer statuses
    ACTIVE: 'green',
    INACTIVE: 'gray',
    PROSPECT: 'blue',
    CHURNED: 'red',
    
    // Lead statuses
    NEW: 'blue',
    CONTACTED: 'yellow',
    QUALIFIED: 'green',
    PROPOSAL: 'purple',
    NEGOTIATION: 'orange',
    WON: 'green',
    LOST: 'red',
    
    // Project statuses
    PLANNING: 'blue',
    ON_HOLD: 'yellow',
    COMPLETED: 'green',
    CANCELLED: 'red',
  };
  
  return colors[status] || 'gray';
}

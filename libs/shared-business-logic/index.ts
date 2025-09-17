// Shared business logic across all applications
// Following Windsurf Global Rules for monorepo structure

import { UserRole, InvitationStatus, CustomerStatus, ProjectStatus, LeadStatus, OrderStatus } from '../shared-types';

// Role Hierarchy and Permissions
export const ROLE_HIERARCHY = {
  CLIENT: 1,
  AGENT: 2,
  ADMIN: 3,
  SUPER_ADMIN: 4,
  DEVELOPER: 5,
} as const;

export const hasPermission = (userRole: UserRole, requiredRole: UserRole): boolean => {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[requiredRole];
};

export const canAccessResource = (userRole: UserRole, resourceOwner?: string, userId?: string): boolean => {
  // Developers and Super Admins can access everything
  if (userRole === 'DEVELOPER' || userRole === 'SUPER_ADMIN') {
    return true;
  }
  
  // Admins can access most resources
  if (userRole === 'ADMIN') {
    return true;
  }
  
  // Agents can access their own resources and client resources assigned to them
  if (userRole === 'AGENT') {
    return !resourceOwner || resourceOwner === userId;
  }
  
  // Clients can only access their own resources
  if (userRole === 'CLIENT') {
    return resourceOwner === userId;
  }
  
  return false;
};

// Invitation Business Logic
export const isInvitationValid = (invitation: { status: InvitationStatus; expiresAt: string }): boolean => {
  if (invitation.status !== 'PENDING') {
    return false;
  }
  
  const expirationDate = new Date(invitation.expiresAt);
  const now = new Date();
  
  return expirationDate > now;
};

export const generateInvitationToken = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const getInvitationExpiryDate = (daysFromNow: number = 7): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysFromNow);
  return date;
};

// Customer Business Logic
export const getCustomerDisplayName = (customer: { firstName: string; lastName: string; company?: string }): string => {
  const fullName = `${customer.firstName} ${customer.lastName}`;
  return customer.company ? `${fullName} (${customer.company})` : fullName;
};

export const isCustomerActive = (status: CustomerStatus): boolean => {
  return status === 'ACTIVE';
};

export const getCustomerStatusColor = (status: CustomerStatus): string => {
  switch (status) {
    case 'ACTIVE':
      return 'green';
    case 'PROSPECT':
      return 'blue';
    case 'INACTIVE':
      return 'gray';
    case 'CHURNED':
      return 'red';
    default:
      return 'gray';
  }
};

// Project Business Logic
export const isProjectActive = (status: ProjectStatus): boolean => {
  return ['ACTIVE', 'IN_PROGRESS'].includes(status);
};

export const getProjectStatusColor = (status: ProjectStatus): string => {
  switch (status) {
    case 'PLANNING':
      return 'blue';
    case 'ACTIVE':
    case 'IN_PROGRESS':
      return 'green';
    case 'COMPLETED':
      return 'emerald';
    case 'ON_HOLD':
      return 'yellow';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
};

export const calculateProjectProgress = (project: {
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
}): number => {
  if (!project.startDate || !project.endDate) {
    return 0;
  }
  
  if (project.status === 'COMPLETED') {
    return 100;
  }
  
  if (project.status === 'CANCELLED') {
    return 0;
  }
  
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const now = Date.now();
  
  if (now < start) {
    return 0;
  }
  
  if (now > end) {
    return 100;
  }
  
  const progress = ((now - start) / (end - start)) * 100;
  return Math.round(progress);
};

// Lead Business Logic
export const isLeadActive = (status: LeadStatus): boolean => {
  return !['WON', 'LOST'].includes(status);
};

export const getLeadStatusColor = (status: LeadStatus): string => {
  switch (status) {
    case 'NEW':
      return 'blue';
    case 'CONTACTED':
      return 'yellow';
    case 'QUALIFIED':
      return 'purple';
    case 'PROPOSAL':
      return 'orange';
    case 'NEGOTIATION':
      return 'indigo';
    case 'WON':
      return 'green';
    case 'LOST':
      return 'red';
    default:
      return 'gray';
  }
};

export const getLeadConversionRate = (leads: { status: LeadStatus }[]): number => {
  const total = leads.length;
  if (total === 0) return 0;
  
  const won = leads.filter(lead => lead.status === 'WON').length;
  return Math.round((won / total) * 100);
};

// Order Business Logic
export const isOrderActive = (status: OrderStatus): boolean => {
  return ['CONFIRMED', 'IN_PROGRESS'].includes(status);
};

export const getOrderStatusColor = (status: OrderStatus): string => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'CONFIRMED':
      return 'blue';
    case 'IN_PROGRESS':
      return 'purple';
    case 'COMPLETED':
      return 'green';
    case 'CANCELLED':
      return 'red';
    default:
      return 'gray';
  }
};

export const calculateOrderTotal = (baseAmount: number, taxRate: number = 0, discountAmount: number = 0): number => {
  const subtotal = baseAmount - discountAmount;
  const tax = subtotal * taxRate;
  return subtotal + tax;
};

// Validation Logic
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^\+?[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
};

export const validatePassword = (password: string): {
  isValid: boolean;
  score: number;
  feedback: string[];
} => {
  const feedback: string[] = [];
  let score = 0;

  if (password.length >= 8) {
    score += 1;
  } else {
    feedback.push('At least 8 characters');
  }

  if (/[A-Z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One uppercase letter');
  }

  if (/[a-z]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One lowercase letter');
  }

  if (/\d/.test(password)) {
    score += 1;
  } else {
    feedback.push('One number');
  }

  if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    score += 1;
  } else {
    feedback.push('One special character');
  }

  return {
    isValid: score >= 3,
    score,
    feedback,
  };
};

// Date and Time Utilities
export const formatDate = (dateString: string, options?: Intl.DateTimeFormatOptions): string => {
  const date = new Date(dateString);
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', options || defaultOptions);
};

export const formatDateTime = (dateString: string): string => {
  return formatDate(dateString, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const getRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Just now';
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
  }

  return formatDate(dateString);
};

// Currency and Number Formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('en-US').format(number);
};

export const formatPercentage = (value: number, decimals: number = 1): string => {
  return `${value.toFixed(decimals)}%`;
};

// Search and Filter Utilities
export const searchItems = <T>(
  items: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] => {
  if (!searchTerm.trim()) {
    return items;
  }

  const lowercaseSearch = searchTerm.toLowerCase();
  
  return items.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      if (typeof value === 'string') {
        return value.toLowerCase().includes(lowercaseSearch);
      }
      return false;
    })
  );
};

export const sortItems = <T>(
  items: T[],
  sortField: keyof T,
  sortDirection: 'asc' | 'desc' = 'asc'
): T[] => {
  return [...items].sort((a, b) => {
    const aValue = a[sortField];
    const bValue = b[sortField];
    
    if (aValue < bValue) {
      return sortDirection === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortDirection === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

// Analytics and Statistics
export const calculateGrowthRate = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0;
  return Math.round(((current - previous) / previous) * 100);
};

export const calculateAverage = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  return sum / numbers.length;
};

export const calculateMedian = (numbers: number[]): number => {
  if (numbers.length === 0) return 0;
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  
  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  } else {
    return sorted[middle];
  }
};

// Export all utilities
export * from './validation';
export * from './formatting';
export * from './permissions';
export * from './analytics';

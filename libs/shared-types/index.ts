// Shared TypeScript types across all applications
// Following Windsurf Global Rules for monorepo structure

// User and Authentication Types
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  invitationId?: string;
}

export type UserRole = 'CLIENT' | 'AGENT' | 'ADMIN' | 'SUPER_ADMIN' | 'DEVELOPER';

export interface Invitation {
  id: string;
  email: string;
  role: UserRole;
  token: string;
  status: InvitationStatus;
  expiresAt: string;
  createdAt: string;
  acceptedAt?: string;
  invitedBy: string;
}

export type InvitationStatus = 'PENDING' | 'ACCEPTED' | 'EXPIRED' | 'REVOKED';

// Business Entity Types
export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  status: CustomerStatus;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export type CustomerStatus = 'ACTIVE' | 'INACTIVE' | 'PROSPECT' | 'CHURNED';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: ProjectStatus;
  customerId: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'PLANNING' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ON_HOLD';

export interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  category: ServiceCategory;
  isActive: boolean;
  features?: string[];
  createdAt: string;
  updatedAt: string;
}

export type ServiceCategory = 'DEVELOPMENT' | 'DESIGN' | 'MARKETING' | 'CONSULTING' | 'OTHER';

export interface Lead {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  company?: string;
  message?: string;
  status: LeadStatus;
  source: LeadSource;
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus = 'NEW' | 'CONTACTED' | 'QUALIFIED' | 'PROPOSAL' | 'NEGOTIATION' | 'WON' | 'LOST';
export type LeadSource = 'WEBSITE' | 'REFERRAL' | 'SOCIAL_MEDIA' | 'EMAIL' | 'PHONE' | 'OTHER';

export interface Order {
  id: string;
  customerId: string;
  serviceId: string;
  status: OrderStatus;
  totalAmount: number;
  description?: string;
  requirements?: string;
  deliverables?: string[];
  createdAt: string;
  updatedAt: string;
}

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  userId: string;
  entityType?: EntityType;
  entityId?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type ActivityType = 
  | 'USER_CREATED' 
  | 'USER_UPDATED' 
  | 'USER_DELETED'
  | 'INVITATION_SENT'
  | 'INVITATION_ACCEPTED'
  | 'CUSTOMER_CREATED'
  | 'CUSTOMER_UPDATED'
  | 'PROJECT_CREATED'
  | 'PROJECT_UPDATED'
  | 'PROJECT_COMPLETED'
  | 'LEAD_CREATED'
  | 'LEAD_UPDATED'
  | 'LEAD_CONVERTED'
  | 'ORDER_CREATED'
  | 'ORDER_UPDATED'
  | 'ORDER_COMPLETED';

export type EntityType = 'USER' | 'CUSTOMER' | 'PROJECT' | 'SERVICE' | 'LEAD' | 'ORDER' | 'INVITATION';

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  pagination?: PaginationInfo;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form and UI Types
export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'email' | 'password' | 'number' | 'select' | 'textarea' | 'checkbox' | 'date';
  required?: boolean;
  placeholder?: string;
  options?: SelectOption[];
  validation?: ValidationRule[];
}

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface ValidationRule {
  type: 'required' | 'email' | 'minLength' | 'maxLength' | 'pattern';
  value?: any;
  message: string;
}

// Dashboard and Analytics Types
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  invitations: {
    pending: number;
    accepted: number;
    expired: number;
  };
  customers: {
    total: number;
    active: number;
    newThisMonth: number;
  };
  projects: {
    total: number;
    active: number;
    completed: number;
    inProgress: number;
  };
  leads: {
    total: number;
    new: number;
    qualified: number;
    converted: number;
  };
  orders: {
    total: number;
    pending: number;
    completed: number;
    revenue: number;
  };
}

// Permission and Access Control Types
export interface Permission {
  resource: string;
  action: string;
  conditions?: Record<string, any>;
}

export interface RolePermissions {
  role: UserRole;
  permissions: Permission[];
}

// Blockchain and Solana Types (for future integration)
export interface WalletConnection {
  publicKey: string;
  connected: boolean;
  balance?: number;
}

export interface Transaction {
  id: string;
  signature: string;
  amount: number;
  from: string;
  to: string;
  status: TransactionStatus;
  createdAt: string;
}

export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED';

// Utility Types
export type Omit<T, K extends keyof T> = Pick<T, Exclude<keyof T, K>>;
export type Partial<T> = { [P in keyof T]?: T[P] };
export type Required<T> = { [P in keyof T]-?: T[P] };

// Event Types for Real-time Updates
export interface WebSocketMessage {
  type: string;
  payload: any;
  timestamp: string;
  userId?: string;
}

export interface NotificationMessage {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  userId: string;
  read: boolean;
  createdAt: string;
}

// Export all types for easy importing
export * from './auth';
export * from './business';
export * from './ui';
export * from './api';

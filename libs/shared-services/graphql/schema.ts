import { gql } from 'apollo-server-express';

export const typeDefs = gql`
  scalar DateTime
  scalar JSON

  type User {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    role: UserRole!
    isActive: Boolean!
    profilePhoto: String
    phone: String
    bio: String
    timezone: String
    mfaEnabled: Boolean!
    lastLoginAt: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
    assignedCustomers: [Customer!]!
    assignedLeads: [Lead!]!
    assignedProjects: [Project!]!
  }

  enum UserRole {
    CLIENT
    AGENT
    ADMIN
    SUPER_ADMIN
    DEVELOPER
  }

  type Customer {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    company: String
    website: String
    status: CustomerStatus!
    source: CustomerSource!
    assignedTo: String
    assignedUser: User
    tags: [String!]!
    totalValue: Float!
    projects: [Project!]!
    orders: [Order!]!
    communications: [CommunicationLog!]!
    createdAt: DateTime!
    updatedAt: DateTime!
    lastContactDate: DateTime
    nextFollowUpDate: DateTime
  }

  enum CustomerStatus {
    ACTIVE
    INACTIVE
    PROSPECT
    CHURNED
  }

  enum CustomerSource {
    WEBSITE
    REFERRAL
    SOCIAL_MEDIA
    EMAIL
    PHONE
    EVENT
    ADVERTISEMENT
    OTHER
  }

  type Lead {
    id: ID!
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    company: String
    jobTitle: String
    source: LeadSource!
    status: LeadStatus!
    score: Int!
    assignedTo: String
    assignedUser: User
    estimatedValue: Float
    probability: Int!
    expectedCloseDate: DateTime
    tags: [String!]!
    notes: String
    createdAt: DateTime!
    updatedAt: DateTime!
    convertedAt: DateTime
    convertedToCustomerId: String
  }

  enum LeadStatus {
    NEW
    CONTACTED
    QUALIFIED
    PROPOSAL
    NEGOTIATION
    WON
    LOST
    NURTURING
  }

  enum LeadSource {
    WEBSITE
    REFERRAL
    SOCIAL_MEDIA
    EMAIL
    PHONE
    EVENT
    ADVERTISEMENT
    COLD_OUTREACH
    OTHER
  }

  type Project {
    id: ID!
    name: String!
    description: String
    customerId: String!
    customer: Customer!
    status: ProjectStatus!
    priority: ProjectPriority!
    assignedTo: String
    assignedUser: User
    startDate: DateTime
    endDate: DateTime
    budget: Float
    actualCost: Float
    progress: Int!
    tags: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum ProjectStatus {
    PLANNING
    ACTIVE
    IN_PROGRESS
    ON_HOLD
    COMPLETED
    CANCELLED
  }

  enum ProjectPriority {
    LOW
    MEDIUM
    HIGH
    URGENT
  }

  type Order {
    id: ID!
    customerId: String!
    customer: Customer!
    serviceId: String!
    status: OrderStatus!
    totalAmount: Float!
    currency: String!
    paymentStatus: PaymentStatus!
    description: String
    assignedTo: String
    assignedUser: User
    startDate: DateTime
    dueDate: DateTime
    completedDate: DateTime
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum OrderStatus {
    PENDING
    CONFIRMED
    IN_PROGRESS
    COMPLETED
    CANCELLED
    REFUNDED
  }

  enum PaymentStatus {
    PENDING
    PAID
    PARTIAL
    FAILED
    REFUNDED
  }

  type CommunicationLog {
    id: ID!
    type: CommunicationType!
    direction: CommunicationDirection!
    subject: String
    content: String!
    customerId: String
    customer: Customer
    leadId: String
    lead: Lead
    userId: String!
    user: User!
    status: CommunicationStatus!
    tags: [String!]!
    createdAt: DateTime!
    updatedAt: DateTime!
  }

  enum CommunicationType {
    EMAIL
    PHONE
    SMS
    MEETING
    NOTE
    TASK
    VIDEO_CALL
  }

  enum CommunicationDirection {
    INBOUND
    OUTBOUND
  }

  enum CommunicationStatus {
    DRAFT
    SCHEDULED
    SENT
    DELIVERED
    READ
    REPLIED
    FAILED
  }

  type Activity {
    id: ID!
    type: String!
    description: String!
    userId: String!
    user: User!
    entityType: String
    entityId: String
    metadata: JSON
    createdAt: DateTime!
  }

  type DashboardMetrics {
    totalCustomers: Int!
    activeCustomers: Int!
    prospectCustomers: Int!
    totalCustomerValue: Float!
    totalLeads: Int!
    newLeads: Int!
    qualifiedLeads: Int!
    wonLeads: Int!
    wonValue: Float!
    conversionRate: Float!
    qualificationRate: Float!
    totalProjects: Int!
    activeProjects: Int!
    completedProjects: Int!
  }

  type SalesPipelineStage {
    status: String!
    count: Int!
    value: Float!
  }

  type RecentActivity {
    id: ID!
    type: String!
    description: String!
    userName: String!
    createdAt: DateTime!
  }

  type DashboardData {
    overview: DashboardMetrics!
    salesPipeline: [SalesPipelineStage!]!
    recentActivities: [RecentActivity!]!
  }

  type UserPerformance {
    user: User!
    metrics: UserMetrics!
  }

  type UserMetrics {
    customers: CustomerMetrics!
    leads: LeadMetrics!
    projects: ProjectMetrics!
    activity: ActivityMetrics!
  }

  type CustomerMetrics {
    total: Int!
    active: Int!
    totalValue: Float!
  }

  type LeadMetrics {
    total: Int!
    won: Int!
    conversionRate: Float!
    totalRevenue: Float!
    averageDealSize: Float!
  }

  type ProjectMetrics {
    total: Int!
    completed: Int!
    completionRate: Float!
  }

  type ActivityMetrics {
    totalLast30Days: Int!
  }

  type PaginationInfo {
    page: Int!
    limit: Int!
    total: Int!
    totalPages: Int!
    hasNext: Boolean!
    hasPrev: Boolean!
  }

  type CustomerConnection {
    customers: [Customer!]!
    pagination: PaginationInfo!
  }

  type LeadConnection {
    leads: [Lead!]!
    pagination: PaginationInfo!
  }

  type ProjectConnection {
    projects: [Project!]!
    pagination: PaginationInfo!
  }

  input CustomerInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    company: String
    website: String
    status: CustomerStatus
    source: CustomerSource
    assignedTo: String
    tags: [String!]
    notes: String
  }

  input CustomerUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    company: String
    website: String
    status: CustomerStatus
    source: CustomerSource
    assignedTo: String
    tags: [String!]
    notes: String
  }

  input LeadInput {
    firstName: String!
    lastName: String!
    email: String!
    phone: String
    company: String
    jobTitle: String
    source: LeadSource
    status: LeadStatus
    score: Int
    assignedTo: String
    estimatedValue: Float
    probability: Int
    expectedCloseDate: DateTime
    tags: [String!]
    notes: String
  }

  input LeadUpdateInput {
    firstName: String
    lastName: String
    email: String
    phone: String
    company: String
    jobTitle: String
    source: LeadSource
    status: LeadStatus
    score: Int
    assignedTo: String
    estimatedValue: Float
    probability: Int
    expectedCloseDate: DateTime
    tags: [String!]
    notes: String
  }

  input ProjectInput {
    name: String!
    description: String
    customerId: String!
    status: ProjectStatus
    priority: ProjectPriority
    assignedTo: String
    startDate: DateTime
    endDate: DateTime
    budget: Float
    tags: [String!]
  }

  input CommunicationLogInput {
    type: CommunicationType!
    direction: CommunicationDirection!
    subject: String
    content: String!
    customerId: String
    leadId: String
    tags: [String!]
  }

  input FilterInput {
    search: String
    status: String
    source: String
    assignedTo: String
    tags: [String!]
    dateRange: DateRangeInput
  }

  input DateRangeInput {
    start: DateTime
    end: DateTime
  }

  input PaginationInput {
    page: Int = 1
    limit: Int = 10
  }

  input SortInput {
    field: String = "createdAt"
    order: SortOrder = DESC
  }

  enum SortOrder {
    ASC
    DESC
  }

  type Query {
    # User queries
    me: User!
    users(filter: FilterInput, pagination: PaginationInput, sort: SortInput): [User!]!
    user(id: ID!): User

    # Customer queries
    customers(filter: FilterInput, pagination: PaginationInput, sort: SortInput): CustomerConnection!
    customer(id: ID!): Customer
    customerMetrics(customerId: ID!): JSON

    # Lead queries
    leads(filter: FilterInput, pagination: PaginationInput, sort: SortInput): LeadConnection!
    lead(id: ID!): Lead
    leadsByStatus(status: LeadStatus!): [Lead!]!

    # Project queries
    projects(filter: FilterInput, pagination: PaginationInput, sort: SortInput): ProjectConnection!
    project(id: ID!): Project
    projectsByCustomer(customerId: ID!): [Project!]!

    # Communication queries
    communicationLogs(filter: FilterInput, pagination: PaginationInput): [CommunicationLog!]!
    communicationsByEntity(entityType: String!, entityId: ID!): [CommunicationLog!]!

    # Dashboard queries
    dashboardAnalytics(dateRange: String): DashboardData!
    userPerformanceMetrics(userId: ID): UserPerformance!
    salesFunnel: [SalesPipelineStage!]!

    # Activity queries
    activities(filter: FilterInput, pagination: PaginationInput): [Activity!]!
    recentActivities(limit: Int = 10): [Activity!]!
  }

  type Mutation {
    # Customer mutations
    createCustomer(input: CustomerInput!): Customer!
    updateCustomer(id: ID!, input: CustomerUpdateInput!): Customer!
    deleteCustomer(id: ID!): Boolean!

    # Lead mutations
    createLead(input: LeadInput!): Lead!
    updateLead(id: ID!, input: LeadUpdateInput!): Lead!
    deleteLead(id: ID!): Boolean!
    convertLeadToCustomer(id: ID!): Customer!

    # Project mutations
    createProject(input: ProjectInput!): Project!
    updateProject(id: ID!, input: ProjectInput!): Project!
    deleteProject(id: ID!): Boolean!

    # Communication mutations
    createCommunicationLog(input: CommunicationLogInput!): CommunicationLog!
    updateCommunicationLog(id: ID!, input: CommunicationLogInput!): CommunicationLog!
    deleteCommunicationLog(id: ID!): Boolean!
  }

  type Subscription {
    # Real-time updates
    customerUpdated(customerId: ID): Customer!
    leadUpdated(leadId: ID): Lead!
    projectUpdated(projectId: ID): Project!
    newActivity(userId: ID): Activity!
    dashboardUpdated: DashboardData!
    communicationAdded(entityType: String!, entityId: ID!): CommunicationLog!
  }
`;

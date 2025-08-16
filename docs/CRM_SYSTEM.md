# CRM System Documentation

## Overview

The Tree of Life Agency CRM system is a comprehensive customer relationship management solution built with modern web technologies. It provides complete customer lifecycle management from lead generation through deal closure.

## Features

### Customer Management
- **Complete Profiles**: Store comprehensive customer information including contact details, company information, and project history
- **Status Tracking**: Monitor customer status (active, inactive, prospect, churned)
- **Source Attribution**: Track how customers found your agency
- **Value Tracking**: Monitor total customer value and project count
- **Tag System**: Organize customers with custom tags
- **Social Integration**: Link to LinkedIn, Twitter, and GitHub profiles

### Lead Management
- **Lead Scoring**: Automated scoring system (0-100) based on engagement and qualification criteria
- **Status Pipeline**: Track leads through stages (new, contacted, qualified, proposal, negotiation, won, lost)
- **Priority System**: Classify leads by priority (low, medium, high, urgent)
- **Value Estimation**: Track estimated deal value and expected close dates
- **Activity Tracking**: Monitor all interactions and touchpoints
- **Conversion Tracking**: Track lead-to-customer conversion rates

### Sales Pipeline
- **Visual Pipeline**: Drag-and-drop Kanban-style pipeline board
- **Six Stages**: Discovery → Proposal → Negotiation → Contract → Closed Won → Closed Lost
- **Probability Scoring**: Assign probability percentages to deals
- **Value Tracking**: Monitor total pipeline value by stage
- **Timeline Management**: Track expected and actual close dates
- **Deal History**: Complete audit trail of deal progression

### Activity Management
- **Communication History**: Track all calls, emails, meetings, and notes
- **Task Management**: Create and assign follow-up tasks
- **Calendar Integration**: Schedule and track meetings
- **Document Management**: Attach proposals, contracts, and other documents
- **Automated Logging**: Capture interactions automatically where possible

### Analytics & Reporting
- **Revenue Metrics**: Total revenue, monthly recurring revenue, average deal size
- **Conversion Analytics**: Lead-to-customer conversion rates, win/loss ratios
- **Performance Tracking**: Sales cycle length, pipeline velocity
- **Customer Analytics**: Customer lifetime value, churn rate analysis
- **Team Performance**: Individual and team performance metrics

## Technical Implementation

### Data Models

#### Customer
```typescript
interface Customer {
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
  address?: Address
  socialProfiles?: SocialProfiles
  createdAt: Date
  updatedAt: Date
  lastContactDate?: Date
  totalValue: number
  projectsCount: number
  notes?: string
}
```

#### Lead
```typescript
interface Lead {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  jobTitle?: string
  source: string
  status: 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost'
  priority: 'low' | 'medium' | 'high' | 'urgent'
  score: number // 0-100
  assignedTo?: string
  estimatedValue?: number
  expectedCloseDate?: Date
  tags: string[]
  notes?: string
  activities: Activity[]
  createdAt: Date
  updatedAt: Date
}
```

#### Deal
```typescript
interface Deal {
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
}
```

### Components

#### CRM Dashboard (`/src/app/admin/crm/page.tsx`)
Main CRM interface with multiple views:
- Overview: Key metrics and recent activity
- Customers: Customer list and management
- Leads: Lead tracking and qualification
- Deals: Deal management and tracking
- Pipeline: Visual pipeline board

#### Pipeline Board (`/src/components/PipelineBoard.tsx`)
Interactive drag-and-drop pipeline:
- Visual deal cards with key information
- Drag-and-drop between stages
- Real-time value calculations
- Stage-specific metrics

#### Activity Feed (`/src/components/ActivityFeed.tsx`)
Activity management component:
- Chronological activity list
- Activity type icons and colors
- Status indicators
- Related entity linking

### Data Layer (`/src/lib/crm.ts`)
CRM data management functions:
- Mock data for development
- CRUD operations for all entities
- Metrics calculation functions
- Pipeline data aggregation

## Usage Guide

### Accessing the CRM
1. Navigate to the admin dashboard at `/admin`
2. Click the "CRM Dashboard" button
3. Or go directly to `/admin/crm`

### Managing Customers
1. Click "Customers" in the sidebar
2. Use the search bar to find specific customers
3. Click on a customer card to view details
4. Use filters to segment customers by status, source, or tags

### Tracking Leads
1. Navigate to the "Leads" section
2. View lead scores and priorities
3. Update lead status as they progress
4. Convert qualified leads to customers

### Managing the Sales Pipeline
1. Go to the "Pipeline" view
2. Drag deals between stages
3. Click on deals to view/edit details
4. Monitor stage values and probabilities

### Viewing Analytics
1. The "Overview" section shows key metrics
2. Monitor conversion rates and revenue
3. Track pipeline health and velocity
4. Analyze customer lifetime value

## Best Practices

### Lead Scoring
- Score leads based on engagement level
- Consider company size and budget
- Factor in decision-making authority
- Update scores based on interactions

### Pipeline Management
- Keep deals moving through stages
- Update probabilities regularly
- Set realistic close dates
- Document reasons for lost deals

### Activity Tracking
- Log all customer interactions
- Set follow-up reminders
- Maintain detailed notes
- Track communication preferences

### Data Quality
- Keep customer information current
- Remove duplicate entries
- Standardize data entry formats
- Regular data cleanup and validation

## Future Enhancements

### Planned Features
- Email integration and tracking
- Calendar synchronization
- Advanced reporting and dashboards
- Mobile application
- API integrations with external tools
- Automated lead scoring
- Email marketing campaigns
- Customer portal access

### Technical Improvements
- Database integration (PostgreSQL/MongoDB)
- Real-time updates with WebSockets
- Advanced search and filtering
- Data export capabilities
- Role-based access control
- Audit logging
- Performance optimization
- Offline capability

## Troubleshooting

### Common Issues
- **Data not loading**: Check browser console for errors
- **Drag-and-drop not working**: Ensure JavaScript is enabled
- **Search not returning results**: Check search term spelling
- **Performance issues**: Clear browser cache and reload

### Support
For technical support or feature requests, contact the development team or create an issue in the GitHub repository.

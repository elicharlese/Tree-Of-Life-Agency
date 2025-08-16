# Tree of Life Agency - Documentation

Welcome to the Tree of Life Agency platform documentation. This comprehensive guide covers all aspects of our development agency platform, including the CRM system, admin dashboard, and core features.

## Table of Contents

- [Overview](#overview)
- [Features](#features)
- [CRM System](#crm-system)
- [Admin Dashboard](#admin-dashboard)
- [Technical Architecture](#technical-architecture)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Deployment](#deployment)

## Overview

Tree of Life Agency is a modern development agency platform built with Next.js 14, TypeScript, and Tailwind CSS. The platform provides a comprehensive solution for managing client relationships, projects, and business operations.

## Features

### Core Platform
- **Modern Web Interface**: Built with Next.js 14 and React
- **TypeScript**: Full type safety throughout the application
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark Theme**: Professional dark theme with organic tree-inspired colors
- **Animation**: Smooth animations powered by Framer Motion

### CRM System
- **Customer Management**: Complete customer lifecycle management
- **Lead Tracking**: Advanced lead scoring and conversion tracking
- **Sales Pipeline**: Visual drag-and-drop pipeline management
- **Deal Management**: Opportunity tracking with probability scoring
- **Activity Management**: Communication history and task tracking
- **Analytics Dashboard**: Real-time metrics and performance insights

### Admin Dashboard
- **Project Management**: Track development projects and milestones
- **Developer Matching**: Auto-match projects with qualified developers
- **SOW Generation**: Automated Statement of Work creation
- **Code Generation**: Smart code generation based on requirements
- **Architecture Planning**: Visual system architecture tools

## CRM System

The CRM system is the heart of our client management platform, providing comprehensive tools for managing the entire customer journey.

### Customer Management
- Complete customer profiles with contact information
- Company details and industry classification
- Project history and value tracking
- Tag-based organization system
- Social media profile integration

### Lead Management
- Lead scoring algorithm (0-100 scale)
- Status tracking through the sales funnel
- Priority classification system
- Estimated value and close date tracking
- Source attribution and ROI analysis

### Sales Pipeline
- Visual Kanban-style pipeline board
- Drag-and-drop deal management
- Six-stage pipeline: Discovery → Proposal → Negotiation → Contract → Closed Won/Lost
- Probability scoring for accurate forecasting
- Real-time pipeline value calculations

### Analytics & Reporting
- Revenue metrics and trends
- Conversion rate analysis
- Average deal size tracking
- Sales cycle length monitoring
- Win/loss rate analysis
- Customer lifetime value calculations

## Technical Architecture

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom theme
- **Animations**: Framer Motion for smooth interactions
- **Icons**: Lucide React icon library

### Data Layer
- **Type System**: Comprehensive TypeScript interfaces
- **Mock Data**: Sample data for development and testing
- **State Management**: React hooks and local state
- **Data Validation**: Runtime validation with type guards

### File Structure
```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard pages
│   │   ├── crm/          # CRM system pages
│   │   └── page.tsx      # Main admin dashboard
│   ├── auth/             # Authentication pages
│   ├── checkout/         # Payment and checkout
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── ActivityFeed.tsx  # Activity management
│   ├── PipelineBoard.tsx # Sales pipeline
│   └── ...              # Other components
├── lib/                 # Utility functions and data
│   ├── crm.ts          # CRM data and helpers
│   └── orders.ts       # Order management
└── types/              # TypeScript type definitions
    ├── crm.ts         # CRM-related types
    └── order.ts       # Order-related types
```

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn package manager
- Git for version control

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/elicharlese/Tree-Of-Life.git
   cd Tree-Of-Life
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Environment Setup
Create a `.env.local` file for environment variables:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
# Add other environment variables as needed
```

## API Reference

### CRM API Functions

#### Customer Management
- `getCustomers()`: Retrieve all customers
- `getCustomerById(id)`: Get specific customer
- `createCustomer(data)`: Create new customer
- `updateCustomer(id, data)`: Update customer information

#### Lead Management
- `getLeads()`: Retrieve all leads
- `getLeadById(id)`: Get specific lead
- `createLead(data)`: Create new lead
- `updateLead(id, data)`: Update lead information

#### Deal Management
- `getDeals()`: Retrieve all deals
- `getDealById(id)`: Get specific deal
- `createDeal(data)`: Create new deal
- `updateDeal(id, data)`: Update deal information

#### Analytics
- `getCRMMetrics()`: Get comprehensive CRM metrics
- `getPipelineData()`: Get pipeline stage data
- `getActivities()`: Get activity feed data

## Deployment

### Production Build
```bash
npm run build
npm start
```

### Environment Variables
Set the following environment variables for production:
- `NEXT_PUBLIC_APP_URL`: Your production URL
- Database connection strings (when implemented)
- API keys for external services

### Recommended Hosting
- **Vercel**: Optimized for Next.js applications
- **Netlify**: Good alternative with easy deployment
- **AWS/GCP/Azure**: For enterprise deployments

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Commit your changes: `git commit -m 'Add new feature'`
4. Push to the branch: `git push origin feature/new-feature`
5. Submit a pull request

## License

This project is proprietary software owned by Tree of Life Agency.

## Support

For support and questions, please contact:
- Email: support@treeoflifeagency.com
- Documentation: [docs.treeoflifeagency.com](https://docs.treeoflifeagency.com)
- GitHub Issues: [GitHub Repository Issues](https://github.com/elicharlese/Tree-Of-Life/issues)

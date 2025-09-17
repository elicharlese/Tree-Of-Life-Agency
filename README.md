# Tree of Life Agency 🌳

**Live Demo:** [https://tree-of-life-agency.vercel.app](https://tree-of-life-agency.vercel.app)  
**Version:** 1.0.0-beta  
**Status:** In Development (Invite-Only System)

A comprehensive, invite-only CRM and agent management platform built with modern TypeScript, React, and Next.js. Features role-based access control, advanced analytics, and real-time collaboration tools for managing clients, agents, and business operations.

## 🌟 Features

### 🔐 Authentication & Security
- **Invite-Only Registration**: No public signups - secure invitation system only
- **Role-Based Access Control**: CLIENT(1) < AGENT(2) < ADMIN(3) < SUPER_ADMIN(4) < DEVELOPER(5)
- **JWT Authentication**: Secure token-based authentication with refresh capabilities
- **Multi-Factor Authentication**: Enhanced security for admin roles and above
- **Session Management**: Automatic timeout and secure session handling
- **Audit Logging**: Complete tracking of all authentication and user activities

### 👥 User & Agent Management
- **User Profiles**: Customizable profiles with role-specific fields and permissions
- **Agent Performance Tracking**: KPIs, metrics, and commission calculations
- **Territory Management**: Client and territory assignment for agents
- **Team Hierarchy**: Structured agent teams and reporting relationships
- **Invitation Management**: Token-based invitations with tracking and analytics

### 📊 CRM & Client Management
- **Customer Lifecycle Management**: Complete customer profiles with project history
- **Lead Tracking**: Advanced lead scoring (0-100) and conversion tracking
- **Sales Pipeline**: Visual drag-and-drop pipeline with 6 stages
- **Deal Management**: Opportunity tracking with probability scoring
- **Activity Management**: Communication history, tasks, and interaction tracking
- **Document Management**: Secure file storage with version control

### 📈 Analytics & Reporting
- **Real-Time Dashboards**: Role-specific dashboards with customizable widgets
- **Advanced Analytics**: Performance metrics, conversion rates, and business intelligence
- **Custom Reports**: Report builder with export capabilities (CSV, PDF, Excel)
- **Predictive Analytics**: Sales forecasting and trend analysis
- **Data Visualization**: Interactive charts and graphs

### 💬 Communication & Collaboration
- **Internal Messaging**: Real-time messaging system with notifications
- **Email Integration**: Template management and automated workflows
- **Video Call Integration**: Scheduling and meeting management
- **File Sharing**: Secure document sharing with version control
- **Team Collaboration**: Dedicated spaces and channels for team communication

### 🛠️ Technical Excellence
- **Modern Stack**: Next.js 14, React 18+, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with PWA capabilities
- **Real-Time Updates**: WebSocket connections for live data
- **Performance Optimized**: Code splitting, lazy loading, and caching
- **Type Safety**: Full TypeScript coverage with Zod validation

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm or yarn
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/elicharlese/Tree-Of-Life.git
   cd Tree-Of-Life
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

Following Windsurf Global Rules with Nx monorepo architecture:

```
app/                # React TypeScript web app (Next.js 14)
├── admin/         # Admin dashboard and management
├── auth/          # Authentication pages and flows
├── crm/           # CRM system components
└── globals.css    # Global styles and Tailwind config

apps/              # Nx-managed platforms
├── mobile/        # Expo React Native mobile app
└── desktop/       # Electron desktop application

libs/              # Shared TypeScript libraries
├── shared-business-logic/  # Core business logic
├── shared-types/          # TypeScript definitions
├── shared-ui/             # Tailwind-based design system
└── test-utilities/        # Jest testing utilities

components/        # Reusable React components (atomic design)
├── ui/           # Base UI components
├── forms/        # Form components with Zod validation
└── layouts/      # Page layout components

server/           # Backend API and services
├── api/          # RESTful API endpoints
├── auth/         # Authentication middleware
├── middleware/   # Request/response middleware
└── utils/        # Server utilities

docs/             # Documentation suite
├── guidelines.md # Development guidelines (this file)
├── architecture/ # Mermaid C4 diagrams
├── patches/      # Change log and patch history
└── batches/      # Release batches and notes

reports/          # Analytics & audit trail
├── coverage/     # Jest + Cypress coverage reports
├── performance/  # Lighthouse, Playwright metrics
└── audits/       # Security scans, dependency reports

resources/        # Shared optimization + data layer
├── optimization-maps/  # Algorithm efficiency profiles
├── data/              # Datasets, schema snapshots
└── models/            # AI/ML or simulation models

infrastructure/   # Infrastructure as Code
├── terraform/    # Terraform plans
├── docker/       # Dockerfiles and compose
└── vercel/       # Vercel deployment configs
```

## 🎯 CRM System Overview

### Customer Management
- Complete customer profiles with contact information
- Company details and industry classification
- Project history and value tracking
- Tag-based organization system

### Lead Pipeline
- **New** → **Contacted** → **Qualified** → **Proposal** → **Negotiation** → **Won/Lost**
- Lead scoring algorithm based on engagement and qualification
- Priority classification (Low, Medium, High, Urgent)
- Source attribution tracking

### Sales Pipeline
- **Discovery** → **Proposal** → **Negotiation** → **Contract** → **Closed Won/Lost**
- Drag-and-drop deal management
- Probability scoring (0-100%)
- Real-time pipeline value calculations

## 📊 Analytics & Metrics

- **Revenue Tracking**: Total revenue, average deal size, monthly trends
- **Conversion Analytics**: Lead-to-customer conversion rates
- **Performance Metrics**: Sales cycle length, win/loss ratios
- **Customer Analytics**: Lifetime value, churn rate analysis

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **UI Library**: React 18+ (functional components + hooks)
- **Language**: TypeScript 5.0+ (strict mode)
- **Styling**: Tailwind CSS with atomic design
- **Validation**: Zod for runtime type checking
- **Testing**: Jest + Cypress + Playwright
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: JWT with role-based access control
- **API**: RESTful endpoints + GraphQL
- **Real-time**: WebSocket connections
- **Caching**: Redis for performance optimization

### DevOps & Infrastructure
- **Deployment**: Vercel with automatic previews
- **CI/CD**: GitHub Actions with Kilo pipeline
- **Monitoring**: Error tracking and performance metrics
- **Database**: Hosted PostgreSQL with connection pooling
- **CDN**: Integrated asset optimization

### Development Tools
- **Monorepo**: Nx for workspace management
- **Linting**: ESLint with TypeScript rules
- **Formatting**: Prettier with consistent config
- **Git Hooks**: Pre-commit validation
- **Documentation**: Markdown with Mermaid diagrams

## 🔄 Development Workflow

### Patch & Batch System
Following the Windsurf Global Rules patch→batch spiral:

1. **Bootstrap** → Scaffold docs and initial setup
2. **Pipeline** → Configure CI/CD with Kilo + Vercel
3. **Patch Development** → Feature implementation in branches
4. **Batch Release** → Group patches into milestone releases
5. **Deploy & Test** → Automated deployment with user testing
6. **Iterate** → Continue until END_GOAL.md is complete

### Quality Gates
- ✅ TypeScript compilation passes
- ✅ ESLint rules pass without warnings
- ✅ Test coverage ≥90% for all new code
- ✅ UI follows atomic design principles
- ✅ CLI commands use explicit flags only
- ✅ Security audit passes
- ✅ Performance benchmarks met

### Branch Strategy
- `main` → Production-ready code
- `windsprint/batch-N` → Development branches
- `proposed-tech/<name>` → Stack deviation proposals

## 📖 Documentation

Comprehensive documentation is available in the `/docs` folder:

- [Complete Documentation](./docs/README.md)
- [CRM System Guide](./docs/CRM_SYSTEM.md)
- [Changelog](./docs/CHANGELOG.md)

## 🚀 Deployment

### Build for Production
```bash
npm run build
npm start
```

### Recommended Hosting
- **Vercel**: Optimized for Next.js (recommended)
- **Netlify**: Easy deployment with continuous integration
- **AWS/GCP/Azure**: Enterprise-grade hosting solutions

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📝 License

This project is proprietary software owned by Tree of Life Agency.

## 📞 Support

- **Email**: support@treeoflifeagency.com
- **Documentation**: [docs.treeoflifeagency.com](https://docs.treeoflifeagency.com)
- **Issues**: [GitHub Issues](https://github.com/elicharlese/Tree-Of-Life/issues)

---

**Tree of Life Agency** - Growing digital solutions from the ground up 🌳

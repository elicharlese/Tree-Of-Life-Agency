# Tree of Life Agency Platform

A modern development agency platform built with Next.js 14, TypeScript, and Tailwind CSS. Features a comprehensive CRM system, admin dashboard, and client management tools.

## 🌟 Features

### CRM System
- **Customer Management**: Complete customer lifecycle management with profiles, project history, and value tracking
- **Lead Tracking**: Advanced lead scoring (0-100) and conversion tracking through sales funnel
- **Sales Pipeline**: Visual drag-and-drop pipeline with 6 stages (Discovery → Proposal → Negotiation → Contract → Closed)
- **Deal Management**: Opportunity tracking with probability scoring and timeline management
- **Activity Management**: Communication history, tasks, and interaction tracking
- **Analytics Dashboard**: Real-time metrics, conversion rates, and performance insights

### Admin Dashboard
- **Project Management**: Track development projects and milestones
- **Developer Matching**: Auto-match projects with qualified developers
- **SOW Generation**: Automated Statement of Work creation
- **Code Generation**: Smart code generation based on requirements
- **Architecture Planning**: Visual system architecture tools

### Core Platform
- **Modern Stack**: Next.js 14 with App Router, TypeScript, Tailwind CSS
- **Responsive Design**: Mobile-first approach with dark theme
- **Animations**: Smooth interactions powered by Framer Motion
- **Type Safety**: Full TypeScript coverage throughout the application

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

```
src/
├── app/                    # Next.js app router pages
│   ├── admin/             # Admin dashboard
│   │   ├── crm/          # CRM system
│   │   └── page.tsx      # Main admin dashboard
│   ├── auth/             # Authentication pages
│   └── globals.css       # Global styles
├── components/           # Reusable React components
│   ├── ActivityFeed.tsx  # Activity management
│   ├── PipelineBoard.tsx # Sales pipeline
│   └── ...              # Other components
├── lib/                 # Utility functions and data
│   ├── crm.ts          # CRM data and helpers
│   └── orders.ts       # Order management
└── types/              # TypeScript definitions
    ├── crm.ts         # CRM-related types
    └── order.ts       # Order-related types
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

- **Frontend**: Next.js 14, React, TypeScript
- **Styling**: Tailwind CSS with custom dark theme
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Development**: ESLint, PostCSS

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

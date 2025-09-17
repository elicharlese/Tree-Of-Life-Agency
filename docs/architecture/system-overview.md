# Tree of Life Agency - System Architecture Overview

## System Context

The Tree of Life Agency is a professional services marketplace built on blockchain technology, featuring an invite-only system with role-based access control.

```mermaid
C4Context
    title System Context Diagram for Tree of Life Agency

    Person(customer, "Customer", "Clients who purchase services")
    Person(agent, "Agent", "Service providers and sales representatives")
    Person(admin, "Admin", "System administrators")
    Person(developer, "Developer", "System developers and maintainers")

    System(tola, "Tree of Life Agency", "Professional services marketplace with blockchain integration")

    System_Ext(solana, "Solana Blockchain", "Decentralized payment processing")
    System_Ext(email, "Email Service", "Notification and invitation system")
    System_Ext(storage, "Cloud Storage", "File and media storage")

    Rel(customer, tola, "Purchases services, makes payments")
    Rel(agent, tola, "Manages customers, delivers services")
    Rel(admin, tola, "Manages users, sends invitations")
    Rel(developer, tola, "Maintains system, deploys updates")

    Rel(tola, solana, "Processes payments")
    Rel(tola, email, "Sends notifications")
    Rel(tola, storage, "Stores files")
```

## Container Architecture

```mermaid
C4Container
    title Container Diagram for Tree of Life Agency

    Person(user, "User", "Any system user")

    Container_Boundary(tola, "Tree of Life Agency") {
        Container(web, "Web Application", "Next.js 14", "React-based web interface with TypeScript")
        Container(mobile, "Mobile App", "React Native/Expo", "Cross-platform mobile application")
        Container(api, "API Server", "Express.js", "RESTful API with authentication and business logic")
        Container(db, "Database", "PostgreSQL", "Relational database with Prisma ORM")
        Container(cache, "Cache Layer", "In-Memory/Redis", "Application caching and session storage")
    }

    System_Ext(blockchain, "Solana Network", "Blockchain for payments")
    System_Ext(email, "Email Service", "SMTP/SendGrid")

    Rel(user, web, "Uses", "HTTPS")
    Rel(user, mobile, "Uses", "HTTPS")
    Rel(web, api, "Makes API calls", "JSON/HTTPS")
    Rel(mobile, api, "Makes API calls", "JSON/HTTPS")
    Rel(api, db, "Reads/Writes", "SQL")
    Rel(api, cache, "Caches data", "Key-Value")
    Rel(api, blockchain, "Payment processing", "RPC")
    Rel(api, email, "Sends notifications", "SMTP")
```

## Component Architecture

```mermaid
C4Component
    title Component Diagram for API Server

    Container_Boundary(api, "API Server") {
        Component(auth, "Authentication", "Middleware", "JWT-based authentication and authorization")
        Component(invitations, "Invitation System", "Controller", "Manages user invitations and registration")
        Component(users, "User Management", "Controller", "CRUD operations for users")
        Component(customers, "Customer Management", "Controller", "CRM functionality")
        Component(projects, "Project Management", "Controller", "Project lifecycle management")
        Component(services, "Service Catalog", "Controller", "Service offerings and pricing")
        Component(orders, "Order Processing", "Controller", "Order management and fulfillment")
        Component(payments, "Payment Processing", "Service", "Blockchain payment integration")
        Component(notifications, "Notification Service", "Service", "Email and real-time notifications")
        Component(logging, "Logging Service", "Middleware", "Application logging and monitoring")
        Component(cache, "Cache Service", "Middleware", "Data caching and performance optimization")
    }

    ContainerDb(db, "PostgreSQL", "Database", "Data persistence")
    System_Ext(solana, "Solana Blockchain", "Payment processing")

    Rel(auth, users, "Validates users")
    Rel(invitations, users, "Creates users")
    Rel(customers, projects, "Links to projects")
    Rel(projects, orders, "Generates orders")
    Rel(orders, payments, "Processes payments")
    Rel(payments, solana, "Blockchain transactions")
    Rel_Back(notifications, orders, "Order updates")
    Rel(logging, cache, "Performance monitoring")

    Rel_Down(users, db, "CRUD operations")
    Rel_Down(customers, db, "CRUD operations")
    Rel_Down(projects, db, "CRUD operations")
    Rel_Down(orders, db, "CRUD operations")
```

## Role-Based Access Control

```mermaid
graph TB
    subgraph "Role Hierarchy"
        DEV[DEVELOPER - Level 5]
        SUPER[SUPER_ADMIN - Level 4]
        ADMIN[ADMIN - Level 3]
        AGENT[AGENT - Level 2]
        CLIENT[CLIENT - Level 1]
    end

    subgraph "Permissions"
        DEV --> |Full System Access| SYS[System Management]
        DEV --> |All Admin Functions| ADM[Admin Functions]
        DEV --> |All Agent Functions| AGT[Agent Functions]
        DEV --> |All Client Functions| CLT[Client Functions]

        SUPER --> |System Configuration| ADM
        SUPER --> |User Management| AGT
        SUPER --> |Service Management| CLT

        ADMIN --> |Invitation Management| INV[Send Invitations]
        ADMIN --> |User Oversight| USR[Manage Users]
        ADMIN --> |Agent Functions| AGT

        AGENT --> |Customer Management| CUS[Manage Customers]
        AGENT --> |Project Management| PRJ[Manage Projects]
        AGENT --> |Lead Management| LED[Manage Leads]

        CLIENT --> |Service Access| SRV[View Services]
        CLIENT --> |Order Management| ORD[Manage Orders]
        CLIENT --> |Profile Management| PRF[Update Profile]
    end
```

## Data Flow Architecture

```mermaid
flowchart TD
    subgraph "Frontend Layer"
        WEB[Web App - Next.js]
        MOB[Mobile App - React Native]
    end

    subgraph "API Layer"
        AUTH[Authentication Middleware]
        PERM[Permission Middleware]
        CACHE[Cache Middleware]
        LOG[Logging Middleware]
        CTRL[Controllers]
    end

    subgraph "Business Logic Layer"
        INV[Invitation Service]
        USER[User Service]
        CRM[CRM Service]
        PAY[Payment Service]
        NOTIF[Notification Service]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        REDIS[(Cache)]
        FILES[(File Storage)]
    end

    subgraph "External Services"
        SOLANA[Solana Blockchain]
        EMAIL[Email Service]
    end

    WEB --> AUTH
    MOB --> AUTH
    AUTH --> PERM
    PERM --> CACHE
    CACHE --> LOG
    LOG --> CTRL
    CTRL --> INV
    CTRL --> USER
    CTRL --> CRM
    CTRL --> PAY
    CTRL --> NOTIF

    INV --> DB
    USER --> DB
    CRM --> DB
    PAY --> SOLANA
    NOTIF --> EMAIL

    CACHE --> REDIS
    USER --> FILES
```

## Security Architecture

```mermaid
graph TB
    subgraph "Security Layers"
        subgraph "Network Security"
            HTTPS[HTTPS/TLS 1.3]
            CORS[CORS Policy]
            HELMET[Security Headers]
        end

        subgraph "Authentication"
            JWT[JWT Tokens]
            BCRYPT[Password Hashing]
            INVITE[Invite-Only Registration]
        end

        subgraph "Authorization"
            RBAC[Role-Based Access Control]
            PERM[Permission Middleware]
            RESOURCE[Resource-Level Security]
        end

        subgraph "Data Protection"
            ENCRYPT[Data Encryption]
            AUDIT[Audit Logging]
            RATE[Rate Limiting]
        end
    end

    subgraph "Blockchain Security"
        WALLET[Wallet Integration]
        ESCROW[Escrow Services]
        VERIFY[Transaction Verification]
    end

    HTTPS --> JWT
    JWT --> RBAC
    RBAC --> ENCRYPT
    ENCRYPT --> WALLET
    WALLET --> ESCROW
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_ENV[Development Environment]
        DEV_DB[(Dev Database)]
        DEV_CACHE[(Dev Cache)]
    end

    subgraph "Staging"
        STAGE_ENV[Staging Environment]
        STAGE_DB[(Staging Database)]
        STAGE_CACHE[(Staging Cache)]
    end

    subgraph "Production"
        subgraph "Frontend"
            VERCEL[Vercel Deployment]
            CDN[Global CDN]
        end

        subgraph "Backend"
            API_PROD[Production API]
            DB_PROD[(Production Database)]
            CACHE_PROD[(Production Cache)]
        end

        subgraph "Monitoring"
            LOGS[Centralized Logging]
            METRICS[Performance Metrics]
            ALERTS[Alert System]
        end
    end

    subgraph "CI/CD Pipeline"
        GITHUB[GitHub Actions]
        BUILD[Build & Test]
        DEPLOY[Automated Deployment]
    end

    DEV_ENV --> |Push| GITHUB
    GITHUB --> BUILD
    BUILD --> |Deploy| STAGE_ENV
    STAGE_ENV --> |Promote| VERCEL
    STAGE_ENV --> |Promote| API_PROD

    API_PROD --> LOGS
    API_PROD --> METRICS
    METRICS --> ALERTS
```

## Technology Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, React 18, TypeScript 5.0 | Web application with App Router |
| **Mobile** | React Native, Expo | Cross-platform mobile app |
| **Backend** | Express.js, Node.js | RESTful API server |
| **Database** | PostgreSQL, Prisma ORM | Data persistence and modeling |
| **Authentication** | JWT, bcrypt | Secure authentication |
| **Blockchain** | Solana Web3.js | Payment processing |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **Testing** | Jest, Playwright | Unit and E2E testing |
| **CI/CD** | GitHub Actions, Vercel | Automated deployment |
| **Monitoring** | Custom logging, Performance tracking | System observability |

## Key Architectural Decisions

### 1. Invite-Only System
- **Decision**: Implement token-based invitation system
- **Rationale**: Ensures controlled access and quality user base
- **Implementation**: 7-day expiring tokens with role assignment

### 2. Role Hierarchy
- **Decision**: Five-tier role system (CLIENT → AGENT → ADMIN → SUPER_ADMIN → DEVELOPER)
- **Rationale**: Granular permission control and clear responsibility separation
- **Implementation**: Hierarchical permissions with resource-level access control

### 3. Blockchain Integration
- **Decision**: Solana blockchain for payments
- **Rationale**: Low fees, fast transactions, growing ecosystem
- **Implementation**: Web3.js integration with escrow services

### 4. Monorepo Structure
- **Decision**: Organized monorepo with apps/, libs/, tools/ structure
- **Rationale**: Code reuse, consistent tooling, easier maintenance
- **Implementation**: Shared types, business logic, and UI components

### 5. TypeScript-First
- **Decision**: Strict TypeScript across all layers
- **Rationale**: Type safety, better developer experience, fewer runtime errors
- **Implementation**: Strict mode enabled, comprehensive type definitions

## Performance Considerations

- **Caching Strategy**: Multi-layer caching (in-memory, Redis, CDN)
- **Database Optimization**: Indexed queries, connection pooling
- **Frontend Optimization**: Code splitting, lazy loading, image optimization
- **API Optimization**: Response compression, rate limiting, request deduplication
- **Monitoring**: Real-time performance tracking and alerting

## Security Considerations

- **Authentication**: JWT with secure storage and rotation
- **Authorization**: Role-based with resource-level permissions
- **Data Protection**: Encryption at rest and in transit
- **Input Validation**: Comprehensive validation using Zod
- **Rate Limiting**: API endpoint protection
- **Audit Logging**: Complete activity tracking
- **Blockchain Security**: Wallet integration with transaction verification

# API Structure and Integration Points

## Overview

The Tree of Life Agency platform implements a comprehensive API architecture supporting the service-selling marketplace, wallet authentication, and smart contract interactions. The API is built with Next.js API routes and follows RESTful conventions with GraphQL considerations for complex queries.

## API Architecture

### Core Principles
- **RESTful Design**: Resource-based endpoints with standard HTTP methods
- **Versioning**: API versioning for backward compatibility
- **Authentication**: JWT-based auth with wallet verification
- **Rate Limiting**: Request throttling to prevent abuse
- **Caching**: Redis-based caching for performance
- **Documentation**: OpenAPI/Swagger documentation

### Base URL Structure
```
https://api.treeoflifeagency.com/v1/
├── auth/          # Authentication endpoints
├── users/         # User management
├── services/      # Service marketplace
├── orders/        # Order management
├── escrow/        # Blockchain escrow
├── analytics/     # Analytics and reporting
└── admin/         # Administrative functions
```

## Authentication Endpoints

### Wallet Authentication
```http
POST /api/v1/auth/connect-wallet
Content-Type: application/json

{
  "address": "0x1234...",
  "signature": "0x5678...",
  "message": "Sign this message to authenticate with Tree of Life Agency"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "user_123",
    "walletAddress": "0x1234...",
    "role": "CLIENT",
    "profile": {
      "firstName": "John",
      "lastName": "Doe"
    }
  },
  "expiresIn": 86400
}
```

### Token Refresh
```http
POST /api/v1/auth/refresh
Authorization: Bearer <current_token>
```

### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>
```

## User Management Endpoints

### Get User Profile
```http
GET /api/v1/users/{userId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "user_123",
  "walletAddress": "0x1234...",
  "role": "AGENT",
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Full-stack developer with 5+ years experience",
    "skills": ["React", "Node.js", "PostgreSQL"],
    "hourlyRate": 150
  },
  "reputation": {
    "score": 4.8,
    "reviews": 24,
    "completedProjects": 22
  },
  "createdAt": "2024-01-15T10:30:00Z"
}
```

### Update User Profile
```http
PUT /api/v1/users/{userId}
Authorization: Bearer <token>
Content-Type: application/json

{
  "profile": {
    "firstName": "Jane",
    "lastName": "Smith",
    "bio": "Updated bio",
    "skills": ["React", "Node.js", "PostgreSQL", "TypeScript"]
  }
}
```

### Get User Services (for Agents)
```http
GET /api/v1/users/{userId}/services
Authorization: Bearer <token>
```

## Service Marketplace Endpoints

### List Services
```http
GET /api/v1/services?category=WEB_DEVELOPMENT&minRating=4.0&page=1&limit=20
```

**Response:**
```json
{
  "services": [
    {
      "id": "service_123",
      "title": "Full-Stack Web Application",
      "description": "Complete web app development using React and Node.js",
      "category": "WEB_DEVELOPMENT",
      "pricing": {
        "model": "FIXED_PRICE",
        "basePrice": 5000,
        "currency": "USD"
      },
      "agent": {
        "id": "user_456",
        "name": "Jane Smith",
        "rating": 4.8,
        "completedProjects": 22
      },
      "tags": ["React", "Node.js", "PostgreSQL"],
      "createdAt": "2024-01-20T14:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "pages": 8
  }
}
```

### Get Service Details
```http
GET /api/v1/services/{serviceId}
```

### Create Service (Agents only)
```http
POST /api/v1/services
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Mobile App Development",
  "description": "Native iOS and Android app development",
  "category": "MOBILE_APP",
  "pricing": {
    "model": "HOURLY",
    "hourlyRate": 120,
    "currency": "USD"
  },
  "tags": ["iOS", "Android", "React Native"],
  "portfolio": [
    "https://example.com/project1",
    "https://example.com/project2"
  ]
}
```

### Update Service
```http
PUT /api/v1/services/{serviceId}
Authorization: Bearer <token>
```

### Delete Service
```http
DELETE /api/v1/services/{serviceId}
Authorization: Bearer <token>
```

## Order Management Endpoints

### Create Order
```http
POST /api/v1/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "serviceId": "service_123",
  "title": "E-commerce Website Development",
  "description": "Build a modern e-commerce platform",
  "requirements": "Must include payment integration and admin panel",
  "milestones": [
    {
      "title": "Design Phase",
      "description": "UI/UX design and approval",
      "amount": 1500,
      "dueDate": "2024-02-15"
    },
    {
      "title": "Development Phase",
      "description": "Core functionality implementation",
      "amount": 3000,
      "dueDate": "2024-03-15"
    }
  ]
}
```

### Get Order Details
```http
GET /api/v1/orders/{orderId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "id": "order_123",
  "client": {
    "id": "user_789",
    "name": "John Client"
  },
  "service": {
    "id": "service_123",
    "title": "Web Development"
  },
  "status": "IN_PROGRESS",
  "totalAmount": 5000,
  "escrow": {
    "contractAddress": "0xabc123...",
    "status": "FUNDED",
    "amount": 5000
  },
  "milestones": [
    {
      "id": "milestone_1",
      "title": "Design Phase",
      "status": "COMPLETED",
      "amount": 1500,
      "completedAt": "2024-02-10T10:00:00Z"
    }
  ],
  "createdAt": "2024-01-25T09:00:00Z"
}
```

### Update Order Status
```http
PUT /api/v1/orders/{orderId}/status
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "COMPLETED",
  "notes": "All requirements met successfully"
}
```

### Submit Milestone Deliverable
```http
POST /api/v1/orders/{orderId}/milestones/{milestoneId}/deliver
Authorization: Bearer <token>
Content-Type: application/json

{
  "deliverables": [
    "https://drive.google.com/file1",
    "https://github.com/repo/commit/abc123"
  ],
  "notes": "Design mockups completed and ready for review"
}
```

### Approve Milestone
```http
POST /api/v1/orders/{orderId}/milestones/{milestoneId}/approve
Authorization: Bearer <token>
Content-Type: application/json

{
  "rating": 5,
  "feedback": "Excellent work, exactly as requested"
}
```

## Escrow and Blockchain Endpoints

### Create Escrow
```http
POST /api/v1/escrow
Authorization: Bearer <token>
Content-Type: application/json

{
  "orderId": "order_123",
  "amount": 5000,
  "currency": "ETH",
  "agentAddress": "0x4567..."
}
```

**Response:**
```json
{
  "escrowId": "escrow_123",
  "contractAddress": "0xabc123def456...",
  "transactionHash": "0x789abc...",
  "status": "PENDING"
}
```

### Get Escrow Status
```http
GET /api/v1/escrow/{escrowId}
Authorization: Bearer <token>
```

### Release Funds
```http
POST /api/v1/escrow/{escrowId}/release
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 1500,
  "milestoneId": "milestone_1"
}
```

### Raise Dispute
```http
POST /api/v1/escrow/{escrowId}/dispute
Authorization: Bearer <token>
Content-Type: application/json

{
  "reason": "Work not completed as specified",
  "description": "The delivered code has bugs and doesn't meet requirements"
}
```

## Analytics Endpoints

### Get User Analytics
```http
GET /api/v1/analytics/user/{userId}
Authorization: Bearer <token>
```

**Response:**
```json
{
  "period": "30d",
  "metrics": {
    "ordersCompleted": 5,
    "revenue": 12500,
    "averageRating": 4.7,
    "responseTime": "2.3h",
    "activeProjects": 2
  },
  "trends": {
    "revenue": [
      {"date": "2024-01-01", "value": 2000},
      {"date": "2024-01-02", "value": 2500}
    ]
  }
}
```

### Get Platform Analytics (Admin only)
```http
GET /api/v1/analytics/platform
Authorization: Bearer <admin_token>
```

## Webhook Endpoints

### Blockchain Transaction Webhook
```http
POST /api/v1/webhooks/blockchain
X-Signature: <webhook_signature>
Content-Type: application/json

{
  "event": "transaction_confirmed",
  "transactionHash": "0x123...",
  "contractAddress": "0xabc...",
  "escrowId": "escrow_123",
  "amount": 1500,
  "status": "FUNDED"
}
```

### ThirdWeb Webhook
```http
POST /api/v1/webhooks/thirdweb
Authorization: Bearer <thirdweb_secret>
Content-Type: application/json

{
  "event": "contract_interaction",
  "contractAddress": "0xabc...",
  "functionName": "releaseFunds",
  "args": ["escrow_123", 1500],
  "transactionHash": "0x123..."
}
```

## Error Handling

### Standard Error Response
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  }
}
```

### Common Error Codes
- `VALIDATION_ERROR`: Invalid request data
- `AUTHENTICATION_ERROR`: Invalid or missing authentication
- `AUTHORIZATION_ERROR`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `RATE_LIMITED`: Too many requests
- `BLOCKCHAIN_ERROR`: Smart contract interaction failed

## Rate Limiting

### Rate Limits by Endpoint Type
- **Authentication**: 10 requests per minute
- **Read operations**: 100 requests per minute
- **Write operations**: 30 requests per minute
- **File uploads**: 10 requests per minute
- **Admin operations**: 50 requests per minute

### Rate Limit Headers
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640995200
```

## Caching Strategy

### Cache Layers
- **Browser Cache**: Static assets and API responses
- **CDN Cache**: Vercel Edge Network caching
- **Application Cache**: Redis for dynamic data
- **Database Cache**: Query result caching

### Cache Keys
- User profiles: `user:{userId}`
- Service listings: `services:category:{category}:page:{page}`
- Order details: `order:{orderId}`
- Analytics: `analytics:user:{userId}:{period}`

## Monitoring and Logging

### Application Metrics
- Response times and error rates
- API usage patterns
- Database query performance
- Blockchain transaction success rates

### Logging Structure
```json
{
  "timestamp": "2024-01-15T10:30:00Z",
  "level": "info",
  "service": "api",
  "userId": "user_123",
  "requestId": "req_456",
  "method": "GET",
  "path": "/api/v1/services",
  "statusCode": 200,
  "duration": 150,
  "userAgent": "Mozilla/5.0...",
  "ip": "192.168.1.1"
}
```

This API structure provides a comprehensive, scalable foundation for the service-selling marketplace with robust authentication, blockchain integration, and real-time capabilities.</target_file>
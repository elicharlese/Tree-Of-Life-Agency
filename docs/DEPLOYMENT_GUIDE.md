# Production Deployment Guide

## Prerequisites

### 1. Server Requirements
- Node.js 18+ or 20+ (avoid v23.7.0 due to jest compatibility)
- PostgreSQL 14+
- Redis 6+ (recommended for production caching)
- SSL certificate for HTTPS
- Domain name configured

### 2. Environment Setup
```bash
# Clone repository
git clone <repository-url>
cd Tree-Of-Life-Agency

# Install dependencies
npm install

# Copy and configure production environment
cp .env.production .env
# Edit .env with your production values
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run db:generate

# Run database migrations
npm run db:migrate

# Seed initial data (optional)
npm run db:seed
```

## Build and Deploy

### 1. Build Application
```bash
# Build Next.js frontend
npm run build

# Build TypeScript server
npm run server:build
```

### 2. Start Production Server
```bash
# Start backend server (use PM2 for production)
npm install -g pm2
pm2 start dist/server/server.js --name "tree-of-life-api"

# Start Next.js (if serving frontend from same server)
pm2 start npm --name "tree-of-life-web" -- start
```

### 3. Nginx Configuration (Optional)
```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # API
    location /api/ {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Health check
    location /health {
        proxy_pass http://localhost:3001;
        access_log off;
    }
}
```

## Service Configuration

### 1. Third-Party Services

#### Stripe Setup
1. Create production Stripe account
2. Configure webhook endpoints:
   - `https://yourdomain.com/api/v1/webhooks/stripe`
3. Enable required payment methods
4. Set up products and pricing

#### Resend Email Setup
1. Create Resend account
2. Verify sending domain
3. Configure DNS records for domain authentication
4. Test email delivery

#### ThirdWeb Setup
1. Create production ThirdWeb project
2. Configure supported chains (Ethereum, Polygon, Solana)
3. Set up wallet connection options
4. Configure RPC endpoints

### 2. Database Configuration
```sql
-- Create production database
CREATE DATABASE tree_of_life_agency_prod;

-- Create database user
CREATE USER tree_of_life_user WITH PASSWORD 'secure_password';

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE tree_of_life_agency_prod TO tree_of_life_user;
```

### 3. Redis Setup (Optional but Recommended)
```bash
# Install Redis
sudo apt-get install redis-server

# Configure Redis
sudo systemctl enable redis-server
sudo systemctl start redis-server

# Test connection
redis-cli ping
```

## Security Checklist

### 1. Environment Variables
- [ ] All sensitive keys are properly set
- [ ] JWT_SECRET is strong (32+ characters)
- [ ] Database credentials are secure
- [ ] API keys are production-ready

### 2. Network Security
- [ ] HTTPS is properly configured
- [ ] Firewall rules are in place
- [ ] Database access is restricted
- [ ] Rate limiting is enabled

### 3. Application Security
- [ ] CORS is properly configured
- [ ] Input validation is active
- [ ] Authentication is working
- [ ] Error handling doesn't leak sensitive info

## Monitoring and Maintenance

### 1. Health Checks
```bash
# API health check
curl https://yourdomain.com/health

# Database connection check
curl https://yourdomain.com/api/v1/health/db
```

### 2. Log Monitoring
```bash
# View PM2 logs
pm2 logs tree-of-life-api
pm2 logs tree-of-life-web

# View system logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

### 3. Backup Strategy
```bash
# Database backup
pg_dump tree_of_life_agency_prod > backup_$(date +%Y%m%d_%H%M%S).sql

# Automated daily backups
echo "0 2 * * * pg_dump tree_of_life_agency_prod > /backups/backup_\$(date +\%Y\%m\%d_\%H\%M\%S).sql" | crontab -
```

## Troubleshooting

### Common Issues

#### 1. Database Connection Errors
```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Check connection
psql -h localhost -U tree_of_life_user -d tree_of_life_agency_prod
```

#### 2. API Authentication Issues
- Verify JWT_SECRET matches between frontend and backend
- Check token expiration settings
- Validate CORS configuration

#### 3. Payment Processing Errors
- Verify Stripe webhook signatures
- Check webhook endpoint accessibility
- Review Stripe dashboard for failed payments

#### 4. Email Delivery Problems
- Verify Resend API key
- Check domain authentication status
- Review email templates and content

### Performance Optimization

#### 1. Database Optimization
```sql
-- Add indexes for frequently queried fields
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_projects_customer_id ON projects(customer_id);
```

#### 2. Caching Strategy
- Enable Redis caching for session data
- Implement API response caching
- Use CDN for static assets

#### 3. Monitoring Tools
- Set up application monitoring (e.g., Sentry)
- Configure uptime monitoring
- Implement performance metrics collection

## Scaling Considerations

### 1. Horizontal Scaling
- Use load balancer for multiple API instances
- Implement database read replicas
- Consider microservices architecture

### 2. Container Deployment (Docker)
```dockerfile
# Example Dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build
RUN npm run server:build

EXPOSE 3001

CMD ["node", "dist/server/server.js"]
```

### 3. Cloud Deployment Options
- **AWS**: EC2, RDS, ElastiCache, Load Balancer
- **Google Cloud**: Compute Engine, Cloud SQL, Memorystore
- **Azure**: Virtual Machines, Azure Database, Redis Cache
- **Digital Ocean**: Droplets, Managed Databases, Load Balancer

## Post-Deployment Verification

### 1. Functionality Tests
- [ ] User registration and login work
- [ ] Payment processing is functional  
- [ ] Email notifications are sent
- [ ] Wallet connections work properly
- [ ] All API endpoints respond correctly

### 2. Performance Tests
- [ ] API response times are acceptable
- [ ] Database queries are optimized
- [ ] Rate limiting is working
- [ ] Error handling is proper

### 3. Security Verification
- [ ] SSL certificate is valid
- [ ] Authentication is required where needed
- [ ] Sensitive data is not exposed
- [ ] Input validation prevents attacks

---

**Note**: Always test deployment procedures in a staging environment before applying to production.

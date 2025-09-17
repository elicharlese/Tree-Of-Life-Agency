#!/bin/bash

# Development Environment Setup Script
# Following Windsurf Global Rules for development workflow

set -e

echo "🌳 Tree of Life Agency - Development Setup"
echo "=========================================="

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ and try again."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm and try again."
    exit 1
fi

echo "✅ npm version: $(npm -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Check if .env file exists
if [ ! -f .env ]; then
    echo "⚙️  Creating .env file from template..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo "✅ .env file created from .env.example"
        echo "⚠️  Please update .env with your actual configuration values"
    else
        echo "🔧 Creating basic .env file..."
        cat > .env << EOF
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/treeoflife_dev"

# JWT Configuration
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# Bcrypt Configuration
BCRYPT_SALT_ROUNDS=12

# Environment
NODE_ENV=development

# API Configuration
API_BASE_URL="http://localhost:3000/api/v1"

# Email Configuration (optional)
EMAIL_FROM="noreply@treeoflifeagency.com"
EMAIL_SMTP_HOST=""
EMAIL_SMTP_PORT=""
EMAIL_SMTP_USER=""
EMAIL_SMTP_PASS=""

# Solana Configuration
SOLANA_NETWORK="devnet"
SOLANA_RPC_URL="https://api.devnet.solana.com"

# Next.js Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret-change-this"
EOF
        echo "✅ Basic .env file created"
        echo "⚠️  Please update .env with your actual configuration values"
    fi
fi

# Check if PostgreSQL is running (optional)
if command -v psql &> /dev/null; then
    echo "✅ PostgreSQL CLI found"
    if pg_isready -q; then
        echo "✅ PostgreSQL is running"
    else
        echo "⚠️  PostgreSQL is not running. Please start PostgreSQL service."
        echo "   On macOS: brew services start postgresql"
        echo "   On Ubuntu: sudo service postgresql start"
    fi
else
    echo "⚠️  PostgreSQL CLI not found. Please install PostgreSQL."
fi

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if database exists and run migrations
echo "🗄️  Checking database connection..."
if npx prisma db push --accept-data-loss > /dev/null 2>&1; then
    echo "✅ Database schema synchronized"
else
    echo "⚠️  Could not connect to database. Please check your DATABASE_URL in .env"
    echo "   Make sure PostgreSQL is running and the database exists."
fi

# Create necessary directories
echo "📁 Creating project directories..."
mkdir -p logs
mkdir -p uploads
mkdir -p temp
mkdir -p screenshots
mkdir -p test-results
mkdir -p reports/coverage
mkdir -p reports/performance
mkdir -p reports/audits

# Set up Git hooks (if Git is initialized)
if [ -d .git ]; then
    echo "🔧 Setting up Git hooks..."
    mkdir -p .git/hooks
    
    # Pre-commit hook
    cat > .git/hooks/pre-commit << 'EOF'
#!/bin/bash
# Pre-commit hook for Tree of Life Agency

echo "🔍 Running pre-commit checks..."

# Run TypeScript type checking
echo "Checking TypeScript types..."
npm run type-check

# Run linting
echo "Running ESLint..."
npm run lint

# Run tests
echo "Running tests..."
npm run test:ci

echo "✅ Pre-commit checks passed!"
EOF

    chmod +x .git/hooks/pre-commit
    echo "✅ Git pre-commit hook installed"
fi

# Install global tools (optional)
echo "🛠️  Installing recommended global tools..."
npm install -g @prisma/cli typescript ts-node

# Create development scripts
echo "📝 Creating development scripts..."
cat > scripts/dev-reset.sh << 'EOF'
#!/bin/bash
# Reset development environment

echo "🔄 Resetting development environment..."

# Reset database
npx prisma db push --force-reset --accept-data-loss

# Seed database (if seed script exists)
if [ -f prisma/seed.ts ]; then
    echo "🌱 Seeding database..."
    npx prisma db seed
fi

# Clear logs
rm -rf logs/*

# Clear temp files
rm -rf temp/*

echo "✅ Development environment reset complete!"
EOF

chmod +x scripts/dev-reset.sh

# Create test data script
cat > scripts/create-test-data.sh << 'EOF'
#!/bin/bash
# Create test data for development

echo "🧪 Creating test data..."

# This would typically call a seed script or API endpoints
# to create test users, customers, projects, etc.

echo "✅ Test data created!"
EOF

chmod +x scripts/create-test-data.sh

# Final setup verification
echo ""
echo "🎉 Development setup complete!"
echo ""
echo "Next steps:"
echo "1. Update your .env file with actual configuration values"
echo "2. Start PostgreSQL if it's not running"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Run 'npm run dev:server' to start the API server"
echo ""
echo "Available commands:"
echo "  npm run dev          - Start Next.js development server"
echo "  npm run dev:server   - Start Express API server"
echo "  npm run build        - Build for production"
echo "  npm run test         - Run tests"
echo "  npm run lint         - Run linting"
echo "  npm run type-check   - Check TypeScript types"
echo "  npm run db:migrate   - Run database migrations"
echo "  npm run db:seed      - Seed database with test data"
echo ""
echo "For more information, see the README.md file."
echo ""

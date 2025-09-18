#!/bin/bash

# Tree of Life Agency - Production Build Script
# Following Windsurf Global Rules for build automation

set -e

echo "🏗️  Tree of Life Agency - Production Build"
echo "=========================================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Clean previous builds
echo "🧹 Cleaning previous builds..."
rm -rf .next
rm -rf dist
rm -rf build
rm -rf coverage
rm -rf test-results

# Install dependencies
echo "📦 Installing dependencies..."
npm ci --production=false

# Type checking
echo "🔍 Running TypeScript type checking..."
npm run type-check

# Linting
echo "🧹 Running ESLint..."
npm run lint

# Testing
echo "🧪 Running tests..."
npm run test:ci

# Build Next.js application
echo "🏗️  Building Next.js application..."
npm run build

# Build server application
echo "🏗️  Building server application..."
npm run build:server

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations (if needed)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "🗄️  Running database migrations..."
    npx prisma migrate deploy
fi

# Bundle analysis (optional)
if [ "$ANALYZE_BUNDLE" = "true" ]; then
    echo "📊 Analyzing bundle size..."
    npm run analyze
fi

# Security audit
echo "🔒 Running security audit..."
npm audit --audit-level high

# Performance tests
if [ "$RUN_PERFORMANCE_TESTS" = "true" ]; then
    echo "⚡ Running performance tests..."
    npm run test:performance
fi

echo ""
echo "✅ Build completed successfully!"
echo ""
echo "Build artifacts:"
echo "  - Next.js: .next/"
echo "  - Server: dist/"
echo "  - Static files: public/"
echo ""
echo "Next steps:"
echo "  1. Deploy to production environment"
echo "  2. Run health checks"
echo "  3. Monitor application performance"
echo ""

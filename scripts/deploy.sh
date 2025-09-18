#!/bin/bash

# Tree of Life Agency - Deployment Script
# Following Windsurf Global Rules for deployment automation

set -e

echo "🚀 Tree of Life Agency - Deployment"
echo "==================================="

# Parse command line arguments
ENVIRONMENT="staging"
SKIP_TESTS=false
SKIP_BUILD=false
DRY_RUN=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --env)
      ENVIRONMENT="$2"
      shift 2
      ;;
    --production)
      ENVIRONMENT="production"
      shift
      ;;
    --staging)
      ENVIRONMENT="staging"
      shift
      ;;
    --skip-tests)
      SKIP_TESTS=true
      shift
      ;;
    --skip-build)
      SKIP_BUILD=true
      shift
      ;;
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    *)
      echo "Unknown option $1"
      echo "Usage: $0 [--env staging|production] [--skip-tests] [--skip-build] [--dry-run]"
      exit 1
      ;;
  esac
done

echo "🎯 Target Environment: $ENVIRONMENT"

# Validate environment
if [ "$ENVIRONMENT" != "staging" ] && [ "$ENVIRONMENT" != "production" ]; then
    echo "❌ Invalid environment. Must be 'staging' or 'production'"
    exit 1
fi

# Production safety check
if [ "$ENVIRONMENT" = "production" ]; then
    echo "⚠️  PRODUCTION DEPLOYMENT DETECTED"
    echo "This will deploy to the live production environment."
    read -p "Are you sure you want to continue? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ Deployment cancelled"
        exit 1
    fi
fi

# Check Git status
if [ "$DRY_RUN" = false ]; then
    if [ -n "$(git status --porcelain)" ]; then
        echo "⚠️  Warning: You have uncommitted changes"
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Deployment cancelled"
            exit 1
        fi
    fi
fi

# Get current branch and commit
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
CURRENT_COMMIT=$(git rev-parse --short HEAD)

echo "📍 Current Branch: $CURRENT_BRANCH"
echo "📍 Current Commit: $CURRENT_COMMIT"

# Branch validation for production
if [ "$ENVIRONMENT" = "production" ] && [ "$CURRENT_BRANCH" != "main" ]; then
    echo "❌ Production deployments must be from 'main' branch"
    exit 1
fi

# Pre-deployment checks
echo ""
echo "🔍 Running Pre-deployment Checks..."
echo "==================================="

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

# Check environment variables
if [ "$ENVIRONMENT" = "production" ]; then
    if [ -z "$DATABASE_URL" ] || [[ "$DATABASE_URL" == *"localhost"* ]]; then
        echo "❌ Production DATABASE_URL not configured"
        exit 1
    fi
    
    if [ -z "$JWT_SECRET" ] || [ "$JWT_SECRET" = "your-super-secret-jwt-key-change-this-in-production" ]; then
        echo "❌ Production JWT_SECRET not configured"
        exit 1
    fi
fi

echo "✅ Pre-deployment checks passed"

# Run tests
if [ "$SKIP_TESTS" = false ]; then
    echo ""
    echo "🧪 Running Test Suite..."
    echo "========================"
    
    npm run test:ci
    
    echo "✅ All tests passed"
fi

# Build application
if [ "$SKIP_BUILD" = false ]; then
    echo ""
    echo "🏗️  Building Application..."
    echo "==========================="
    
    # Set environment variables for build
    export NODE_ENV=$ENVIRONMENT
    
    # Run build script
    ./scripts/build.sh
    
    echo "✅ Build completed successfully"
fi

# Database migrations
echo ""
echo "🗄️  Database Migrations..."
echo "=========================="

if [ "$DRY_RUN" = true ]; then
    echo "🔍 Dry run: Would run database migrations"
else
    echo "🔄 Running database migrations..."
    npx prisma migrate deploy
    echo "✅ Database migrations completed"
fi

# Deploy to Vercel
echo ""
echo "🚀 Deploying to Vercel..."
echo "========================="

if [ "$DRY_RUN" = true ]; then
    echo "🔍 Dry run: Would deploy to Vercel ($ENVIRONMENT)"
else
    if [ "$ENVIRONMENT" = "production" ]; then
        npx vercel --prod --yes
    else
        npx vercel --yes
    fi
    
    echo "✅ Deployment to Vercel completed"
fi

# Health check
echo ""
echo "🏥 Health Check..."
echo "=================="

if [ "$DRY_RUN" = false ]; then
    # Wait a moment for deployment to be ready
    sleep 10
    
    # Get deployment URL from Vercel
    if [ "$ENVIRONMENT" = "production" ]; then
        HEALTH_URL="https://treeoflifeagency.com/api/health"
    else
        HEALTH_URL=$(npx vercel ls | grep "tree-of-life-agency" | head -1 | awk '{print $2}')
        HEALTH_URL="https://$HEALTH_URL/api/health"
    fi
    
    echo "🔍 Checking health endpoint: $HEALTH_URL"
    
    # Health check with retry
    for i in {1..5}; do
        if curl -f -s "$HEALTH_URL" > /dev/null; then
            echo "✅ Health check passed"
            break
        else
            echo "⏳ Health check attempt $i/5 failed, retrying..."
            sleep 5
        fi
        
        if [ $i -eq 5 ]; then
            echo "❌ Health check failed after 5 attempts"
            exit 1
        fi
    done
else
    echo "🔍 Dry run: Would perform health check"
fi

# Post-deployment tasks
echo ""
echo "📋 Post-deployment Tasks..."
echo "==========================="

if [ "$DRY_RUN" = false ]; then
    # Tag the deployment
    DEPLOY_TAG="deploy-$ENVIRONMENT-$(date +%Y%m%d-%H%M%S)"
    git tag "$DEPLOY_TAG"
    git push origin "$DEPLOY_TAG"
    
    echo "🏷️  Created deployment tag: $DEPLOY_TAG"
    
    # Send notification (if configured)
    if [ -n "$SLACK_WEBHOOK_URL" ]; then
        curl -X POST -H 'Content-type: application/json' \
            --data "{\"text\":\"🚀 Tree of Life Agency deployed to $ENVIRONMENT\n📍 Branch: $CURRENT_BRANCH\n📍 Commit: $CURRENT_COMMIT\n🏷️  Tag: $DEPLOY_TAG\"}" \
            "$SLACK_WEBHOOK_URL"
        
        echo "📢 Slack notification sent"
    fi
else
    echo "🔍 Dry run: Would create deployment tag and send notifications"
fi

echo ""
echo "🎉 Deployment Completed Successfully!"
echo "===================================="
echo ""
echo "📋 Deployment Summary:"
echo "  Environment: $ENVIRONMENT"
echo "  Branch: $CURRENT_BRANCH"
echo "  Commit: $CURRENT_COMMIT"
if [ "$DRY_RUN" = false ]; then
    echo "  Tag: $DEPLOY_TAG"
    echo "  Health Check: ✅ PASSED"
fi
echo ""

if [ "$ENVIRONMENT" = "production" ]; then
    echo "🌐 Production URL: https://treeoflifeagency.com"
else
    echo "🌐 Staging URL: Check Vercel dashboard for URL"
fi

echo ""
echo "📊 Next Steps:"
echo "  1. Monitor application performance"
echo "  2. Check error logs and metrics"
echo "  3. Verify all features are working correctly"
echo "  4. Update team on deployment status"
echo ""

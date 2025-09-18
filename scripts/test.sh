#!/bin/bash

# Tree of Life Agency - Comprehensive Test Runner
# Following Windsurf Global Rules for testing automation

set -e

echo "🧪 Tree of Life Agency - Test Suite"
echo "=================================="

# Parse command line arguments
RUN_UNIT=true
RUN_INTEGRATION=true
RUN_E2E=false
RUN_PERFORMANCE=false
WATCH_MODE=false
COVERAGE=true

while [[ $# -gt 0 ]]; do
  case $1 in
    --unit-only)
      RUN_INTEGRATION=false
      RUN_E2E=false
      shift
      ;;
    --integration-only)
      RUN_UNIT=false
      RUN_E2E=false
      shift
      ;;
    --e2e)
      RUN_E2E=true
      shift
      ;;
    --performance)
      RUN_PERFORMANCE=true
      shift
      ;;
    --watch)
      WATCH_MODE=true
      shift
      ;;
    --no-coverage)
      COVERAGE=false
      shift
      ;;
    *)
      echo "Unknown option $1"
      exit 1
      ;;
  esac
done

# Check if test database is available
if [ "$NODE_ENV" != "test" ]; then
    export NODE_ENV=test
fi

echo "🔧 Setting up test environment..."

# Ensure test database exists
if [ -n "$DATABASE_URL" ]; then
    echo "🗄️  Preparing test database..."
    npx prisma db push --force-reset --accept-data-loss
    npx prisma db seed
fi

# Unit Tests
if [ "$RUN_UNIT" = true ]; then
    echo ""
    echo "🧪 Running Unit Tests..."
    echo "========================"
    
    if [ "$WATCH_MODE" = true ]; then
        npm run test:watch
    elif [ "$COVERAGE" = true ]; then
        npm run test:coverage
    else
        npm run test
    fi
fi

# Integration Tests
if [ "$RUN_INTEGRATION" = true ]; then
    echo ""
    echo "🔗 Running Integration Tests..."
    echo "=============================="
    
    npm run test:integration
fi

# E2E Tests
if [ "$RUN_E2E" = true ]; then
    echo ""
    echo "🌐 Running E2E Tests..."
    echo "======================"
    
    # Start the application in background
    echo "🚀 Starting application for E2E tests..."
    npm run dev &
    APP_PID=$!
    
    # Wait for application to start
    echo "⏳ Waiting for application to be ready..."
    sleep 10
    
    # Run Playwright tests
    npx playwright test
    
    # Stop the application
    kill $APP_PID
    
    echo "✅ E2E tests completed"
fi

# Performance Tests
if [ "$RUN_PERFORMANCE" = true ]; then
    echo ""
    echo "⚡ Running Performance Tests..."
    echo "=============================="
    
    # Start the application in background
    echo "🚀 Starting application for performance tests..."
    npm run start &
    APP_PID=$!
    
    # Wait for application to start
    sleep 10
    
    # Run Lighthouse CI
    npx lhci autorun
    
    # Stop the application
    kill $APP_PID
    
    echo "✅ Performance tests completed"
fi

# Generate test reports
echo ""
echo "📊 Generating Test Reports..."
echo "============================="

# Coverage report
if [ "$COVERAGE" = true ] && [ -d "coverage" ]; then
    echo "📈 Coverage report available at: coverage/lcov-report/index.html"
fi

# Playwright report
if [ "$RUN_E2E" = true ] && [ -d "playwright-report" ]; then
    echo "🎭 Playwright report available at: playwright-report/index.html"
fi

# Performance report
if [ "$RUN_PERFORMANCE" = true ] && [ -d ".lighthouseci" ]; then
    echo "⚡ Lighthouse report available in: .lighthouseci/"
fi

echo ""
echo "✅ All tests completed successfully!"
echo ""

# Test summary
echo "📋 Test Summary:"
echo "================"
if [ "$RUN_UNIT" = true ]; then
    echo "✅ Unit Tests: PASSED"
fi
if [ "$RUN_INTEGRATION" = true ]; then
    echo "✅ Integration Tests: PASSED"
fi
if [ "$RUN_E2E" = true ]; then
    echo "✅ E2E Tests: PASSED"
fi
if [ "$RUN_PERFORMANCE" = true ]; then
    echo "✅ Performance Tests: PASSED"
fi

echo ""
echo "🎉 Test suite execution complete!"
echo ""

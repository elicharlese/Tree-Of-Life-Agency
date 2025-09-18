/**
 * Test Setup Configuration
 * Global test setup and teardown for Tree of Life Agency
 */

import { PrismaClient } from '@prisma/client';

// Mock environment variables for testing
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/treeoflife_test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.ENCRYPTION_KEY = 'test-encryption-key-32-characters';

// Global test setup
beforeAll(async () => {
  console.log('🧪 Setting up global test environment...');
  
  // Initialize test database
  const prisma = new PrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Test database connected');
    await prisma.$disconnect();
  } catch (error) {
    console.warn('⚠️  Test database connection warning:', error);
  }
});

// Global test teardown
afterAll(async () => {
  console.log('🧹 Cleaning up global test environment...');
  
  // Cleanup any global resources
  const prisma = new PrismaClient();
  
  try {
    await prisma.$disconnect();
    console.log('✅ Test database disconnected');
  } catch (error) {
    console.warn('⚠️  Test database disconnection warning:', error);
  }
});

// Increase timeout for integration tests
jest.setTimeout(30000);

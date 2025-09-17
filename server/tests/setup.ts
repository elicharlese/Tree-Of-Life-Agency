import { PrismaClient } from '@prisma/client';

// Test setup configuration
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret';
process.env.BCRYPT_SALT_ROUNDS = '4'; // Faster for tests
process.env.JWT_EXPIRES_IN = '1h';

// Increase timeout for database operations
jest.setTimeout(30000);

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Global test utilities
global.mockUser = (role: string = 'CLIENT', overrides: any = {}) => ({
  id: `user-${role.toLowerCase()}-123`,
  email: `${role.toLowerCase()}@example.com`,
  role,
  isActive: true,
  firstName: 'Test',
  lastName: 'User',
  ...overrides
});

global.mockToken = (user: any, secret: string = 'test-jwt-secret') => {
  const jwt = require('jsonwebtoken');
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    secret
  );
};

const prisma = new PrismaClient();

beforeAll(async () => {
  // Connect to test database
  await prisma.$connect();
});

afterEach(() => {
  jest.clearAllMocks();
});

afterAll(async () => {
  // Disconnect from test database
  await prisma.$disconnect();
});

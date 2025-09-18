/**
 * Shared Database Library
 * Exports Prisma client, migrations, and database utilities
 */

// Prisma Client
export { PrismaClient } from '@prisma/client';

// Types
export * from '@prisma/client';

// Database utilities
export const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    errorFormat: 'pretty',
  });
};

// Connection management
export const connectDatabase = async () => {
  const prisma = createPrismaClient();
  
  try {
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    return prisma;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

export const disconnectDatabase = async (prisma: PrismaClient) => {
  try {
    await prisma.$disconnect();
    console.log('✅ Database disconnected successfully');
  } catch (error) {
    console.error('❌ Database disconnection failed:', error);
  }
};

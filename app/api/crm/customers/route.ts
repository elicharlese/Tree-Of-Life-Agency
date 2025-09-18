import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import { authenticateRequest } from '@/server/middleware/auth';
import { logger } from '@/server/middleware/logging';

const prisma = new PrismaClient();

// Validation schema
const createCustomerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email format'),
  phone: z.string().optional(),
  company: z.string().optional(),
  website: z.string().url().optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED']).default('PROSPECT'),
  source: z.enum(['WEBSITE', 'REFERRAL', 'SOCIAL_MEDIA', 'EMAIL', 'PHONE', 'EVENT', 'ADVERTISEMENT', 'OTHER']).default('OTHER'),
  assignedTo: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

// GET /api/crm/customers
export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const source = searchParams.get('source');
    const assignedTo = searchParams.get('assignedTo');
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // Build where clause
    const where: any = {};

    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { company: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (status) where.status = status;
    if (source) where.source = source;
    if (assignedTo) where.assignedTo = assignedTo;

    // Role-based filtering
    if (user.role === 'AGENT') {
      where.assignedTo = user.id;
    }

    const [customers, totalCount] = await Promise.all([
      prisma.customer.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder as 'asc' | 'desc' },
        include: {
          assignedUser: {
            select: { id: true, firstName: true, lastName: true, email: true },
          },
          _count: {
            select: { projects: true, orders: true },
          },
        },
      }),
      prisma.customer.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      data: {
        customers,
        pagination: {
          page,
          limit,
          total: totalCount,
          totalPages,
          hasNext: page < totalPages,
          hasPrev: page > 1,
        },
      },
    });
  } catch (error) {
    logger.error('GET /api/crm/customers error', { error });
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/crm/customers
export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = createCustomerSchema.parse(body);

    // Check if email already exists
    const existingCustomer = await prisma.customer.findUnique({
      where: { email: validatedData.email },
    });

    if (existingCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer with this email already exists' },
        { status: 400 }
      );
    }

    // Auto-assign to current user if agent and no assignedTo specified
    if (!validatedData.assignedTo && user.role === 'AGENT') {
      validatedData.assignedTo = user.id;
    }

    const customer = await prisma.customer.create({
      data: validatedData,
      include: {
        assignedUser: {
          select: { id: true, firstName: true, lastName: true, email: true },
        },
      },
    });

    // Log activity
    await prisma.activity.create({
      data: {
        type: 'CUSTOMER_CREATED',
        description: `Customer ${customer.firstName} ${customer.lastName} was created`,
        userId: user.id,
        entityType: 'CUSTOMER',
        entityId: customer.id,
        metadata: {
          customerEmail: customer.email,
          status: customer.status,
        },
      },
    });

    logger.info('Customer created', { customerId: customer.id, createdBy: user.id });

    return NextResponse.json({
      success: true,
      data: customer,
      message: 'Customer created successfully',
    }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/crm/customers error', { error });

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid input data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

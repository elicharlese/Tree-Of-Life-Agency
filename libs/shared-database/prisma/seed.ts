import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Create admin user
  const adminPasswordHash = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@treeoflife.agency' },
    update: {},
    create: {
      email: 'admin@treeoflife.agency',
      passwordHash: adminPasswordHash,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      isActive: true,
    },
  });

  // Create developer user
  const developerPasswordHash = await bcrypt.hash('dev123', 12);
  const developer = await prisma.user.upsert({
    where: { email: 'developer@treeoflife.agency' },
    update: {},
    create: {
      email: 'developer@treeoflife.agency',
      passwordHash: developerPasswordHash,
      firstName: 'John',
      lastName: 'Developer',
      role: 'AGENT',
      isActive: true,
    },
  });

  // Create sample customer
  const customer = await prisma.customer.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      name: 'Jane Client',      email: 'client@example.com',
      company: 'Example Corp',
      assignedToId: admin.id,
    },
  });

  // Create sample lead
  const lead = await prisma.lead.create({
    data: {
      name: 'Jane Prospect',
      email: 'prospect@example.com',
      phone: '+1-555-0123',
      company: 'Prospect Inc',
      source: 'Website',
      status: 'NEW',
      priority: 'HIGH',
      notes: 'Potential high-value client',
      estimatedValue: 25000,
      customerId: customer.id,
      assignedToId: admin.id,
    },
  });

  // Create client user with hashed password
  const clientPasswordHash = await bcrypt.hash('client123', 12);
  const clientUser = await prisma.user.upsert({
    where: { email: 'client@example.com' },
    update: {},
    create: {
      email: 'client@example.com',
      passwordHash: clientPasswordHash,
      firstName: 'Jane',
      lastName: 'Client',
      role: 'CLIENT',
      isActive: true,
    },
  });

  // Create sample order
  const order = await prisma.order.upsert({
    where: { orderNumber: 'ORD-001' },
    update: {},
    create: {
      orderNumber: 'ORD-001',
      customerId: customer.id,
      userId: clientUser.id,
      customerName: 'Jane Client',
      customerEmail: 'client@example.com',
      companyName: 'Example Corp',
      projectName: 'Corporate Website Redesign',
      description: 'Complete redesign of corporate website with modern UI/UX',
      totalAmount: 15000,
      estimatedTimeline: '8 weeks',
      status: 'CONFIRMED',
    },
  });

  // Create sample project
  const project = await prisma.project.create({
    data: {
      name: 'Corporate Website Redesign',
      description: 'Complete redesign of corporate website with modern UI/UX and CMS integration',
      orderId: order.id,
      customerId: customer.id,
      createdById: developer.id,
      assignedToId: developer.id,
      status: 'IN_PROGRESS',
      techStack: ['React', 'Next.js', 'TypeScript', 'Prisma', 'PostgreSQL'],
      estimatedHours: 320,
      actualHours: 120,
      budget: 15000,
      startDate: new Date(),
      endDate: new Date(Date.now() + 56 * 24 * 60 * 60 * 1000), // 8 weeks from now
    },
  });

  // Create sample milestone
  const milestone = await prisma.milestone.create({
    data: {
      title: 'UI/UX Design Phase',
      description: 'Complete wireframes and visual designs',
      projectId: project.id,
      assignedToId: developer.id,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks from now
      status: 'IN_PROGRESS',
      progress: 60,
    },
  });

  // Create sample activities
  await prisma.activity.createMany({
    data: [
      {
        entityType: 'customer',
        entityId: customer.id,
        type: 'note',
        title: 'Initial Contact',
        description: 'Customer reached out via website contact form',
        userId: admin.id,
        customerId: customer.id,
      },
      {
        entityType: 'lead',
        entityId: lead.id,
        type: 'call',
        title: 'Discovery Call',
        description: '30-minute discovery call to understand requirements',
        userId: admin.id,
        customerId: customer.id,
        leadId: lead.id,
      },
      {
        entityType: 'project',
        entityId: project.id,
        type: 'status_change',
        title: 'Project Started',
        description: 'Project moved to IN_PROGRESS status',
        userId: admin.id,
        customerId: customer.id,
        projectId: project.id,
      },
      {
        entityType: 'milestone',
        entityId: milestone.id,
        type: 'note',
        title: 'Design Progress Update',
        description: 'Wireframes completed, moving to visual design phase',
        userId: admin.id,
        customerId: customer.id,
        projectId: project.id,
        milestoneId: milestone.id,
      },
    ],
  });

  console.log('Database seeded successfully!');
  console.log('Sample users created:');
  console.log('- Admin: admin@treeoflifeagency.com (password: admin123)');
  console.log('- Developer: dev@treeoflifeagency.com (password: admin123)');
  console.log('- Client: client@example.com (password: admin123)');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

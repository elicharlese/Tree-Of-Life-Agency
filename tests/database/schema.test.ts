import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Database Schema Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('User Model', () => {
    it('should enforce unique email constraint', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'unique.test@example.com',
        password: 'hashedpassword',
        role: 'AGENT' as const,
      };

      // First user should be created successfully
      const user1 = await prisma.user.create({ data: userData });
      expect(user1).toBeDefined();

      // Second user with same email should fail
      await expect(
        prisma.user.create({ data: userData })
      ).rejects.toThrow();

      // Cleanup
      await prisma.user.delete({ where: { id: user1.id } });
    });

    it('should validate role enum values', async () => {
      const userData = {
        firstName: 'Test',
        lastName: 'User',
        email: 'role.test@example.com',
        password: 'hashedpassword',
        role: 'ADMIN' as const,
      };

      const user = await prisma.user.create({ data: userData });
      expect(['CLIENT', 'AGENT', 'ADMIN', 'SUPER_ADMIN', 'DEVELOPER']).toContain(user.role);

      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should handle MFA fields correctly', async () => {
      const userData = {
        firstName: 'MFA',
        lastName: 'User',
        email: 'mfa.test@example.com',
        password: 'hashedpassword',
        role: 'AGENT' as const,
        mfaEnabled: true,
        mfaSecret: 'JBSWY3DPEHPK3PXP',
        mfaBackupCodes: ['code1', 'code2', 'code3'],
      };

      const user = await prisma.user.create({ data: userData });
      expect(user.mfaEnabled).toBe(true);
      expect(user.mfaSecret).toBe('JBSWY3DPEHPK3PXP');
      expect(user.mfaBackupCodes).toHaveLength(3);

      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Customer Model', () => {
    it('should enforce email uniqueness', async () => {
      const customerData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.unique@example.com',
        status: 'ACTIVE' as const,
        source: 'WEBSITE' as const,
      };

      const customer1 = await prisma.customer.create({ data: customerData });
      expect(customer1).toBeDefined();

      await expect(
        prisma.customer.create({ data: customerData })
      ).rejects.toThrow();

      await prisma.customer.delete({ where: { id: customer1.id } });
    });

    it('should validate status enum', async () => {
      const customerData = {
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.status@example.com',
        status: 'PROSPECT' as const,
        source: 'REFERRAL' as const,
      };

      const customer = await prisma.customer.create({ data: customerData });
      expect(['ACTIVE', 'INACTIVE', 'PROSPECT', 'CHURNED']).toContain(customer.status);

      await prisma.customer.delete({ where: { id: customer.id } });
    });

    it('should handle customer assignments', async () => {
      // Create test user first
      const user = await prisma.user.create({
        data: {
          firstName: 'Agent',
          lastName: 'Test',
          email: 'agent.assignment@example.com',
          password: 'password',
          role: 'AGENT' as const,
        },
      });

      const customerData = {
        firstName: 'Assigned',
        lastName: 'Customer',
        email: 'assigned.customer@example.com',
        status: 'ACTIVE' as const,
        source: 'WEBSITE' as const,
        assignedTo: user.id,
      };

      const customer = await prisma.customer.create({
        data: customerData,
        include: { assignedUser: true },
      });

      expect(customer.assignedUser?.id).toBe(user.id);

      // Cleanup
      await prisma.customer.delete({ where: { id: customer.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Lead Model', () => {
    it('should validate lead scoring constraints', async () => {
      const leadData = {
        firstName: 'Test',
        lastName: 'Lead',
        email: 'test.lead@example.com',
        status: 'NEW' as const,
        source: 'WEBSITE' as const,
        score: 85,
        probability: 60,
      };

      const lead = await prisma.lead.create({ data: leadData });
      expect(lead.score).toBeGreaterThanOrEqual(0);
      expect(lead.score).toBeLessThanOrEqual(100);
      expect(lead.probability).toBeGreaterThanOrEqual(0);
      expect(lead.probability).toBeLessThanOrEqual(100);

      await prisma.lead.delete({ where: { id: lead.id } });
    });

    it('should handle lead conversion tracking', async () => {
      const leadData = {
        firstName: 'Converting',
        lastName: 'Lead',
        email: 'converting.lead@example.com',
        status: 'WON' as const,
        source: 'REFERRAL' as const,
        convertedAt: new Date(),
      };

      const lead = await prisma.lead.create({ data: leadData });
      expect(lead.status).toBe('WON');
      expect(lead.convertedAt).toBeInstanceOf(Date);

      await prisma.lead.delete({ where: { id: lead.id } });
    });
  });

  describe('Project Model', () => {
    it('should validate project relationships', async () => {
      // Create customer first
      const customer = await prisma.customer.create({
        data: {
          firstName: 'Project',
          lastName: 'Customer',
          email: 'project.customer@example.com',
          status: 'ACTIVE' as const,
          source: 'WEBSITE' as const,
        },
      });

      const projectData = {
        name: 'Test Project',
        description: 'A test project',
        customerId: customer.id,
        status: 'ACTIVE' as const,
        priority: 'MEDIUM' as const,
        budget: 50000.00,
        progress: 25,
      };

      const project = await prisma.project.create({
        data: projectData,
        include: { customer: true },
      });

      expect(project.customer.id).toBe(customer.id);
      expect(project.budget).toBe(50000.00);
      expect(project.progress).toBe(25);

      // Cleanup
      await prisma.project.delete({ where: { id: project.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
    });
  });

  describe('Communication Model', () => {
    it('should handle communication logging', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'Comm',
          lastName: 'User',
          email: 'comm.user@example.com',
          password: 'password',
          role: 'AGENT' as const,
        },
      });

      const customer = await prisma.customer.create({
        data: {
          firstName: 'Comm',
          lastName: 'Customer',
          email: 'comm.customer@example.com',
          status: 'ACTIVE' as const,
          source: 'PHONE' as const,
        },
      });

      const commData = {
        type: 'EMAIL' as const,
        direction: 'OUTBOUND' as const,
        subject: 'Test Communication',
        content: 'This is a test communication',
        userId: user.id,
        customerId: customer.id,
        tags: ['follow-up', 'important'],
      };

      const comm = await prisma.communicationLog.create({
        data: commData,
        include: { user: true, customer: true },
      });

      expect(comm.type).toBe('EMAIL');
      expect(comm.direction).toBe('OUTBOUND');
      expect(comm.user.id).toBe(user.id);
      expect(comm.customer?.id).toBe(customer.id);
      expect(comm.tags).toHaveLength(2);

      // Cleanup
      await prisma.communicationLog.delete({ where: { id: comm.id } });
      await prisma.customer.delete({ where: { id: customer.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Message Model', () => {
    it('should handle internal messaging', async () => {
      const sender = await prisma.user.create({
        data: {
          firstName: 'Sender',
          lastName: 'User',
          email: 'sender@example.com',
          password: 'password',
          role: 'ADMIN' as const,
        },
      });

      const recipient = await prisma.user.create({
        data: {
          firstName: 'Recipient',
          lastName: 'User',
          email: 'recipient@example.com',
          password: 'password',
          role: 'AGENT' as const,
        },
      });

      const messageData = {
        senderId: sender.id,
        recipientId: recipient.id,
        subject: 'Test Message',
        content: 'This is a test message',
        type: 'MESSAGE' as const,
        status: 'SENT' as const,
      };

      const message = await prisma.message.create({
        data: messageData,
        include: { sender: true, recipient: true },
      });

      expect(message.sender.id).toBe(sender.id);
      expect(message.recipient.id).toBe(recipient.id);
      expect(message.status).toBe('SENT');

      // Test message status update
      const updatedMessage = await prisma.message.update({
        where: { id: message.id },
        data: { status: 'READ', readAt: new Date() },
      });

      expect(updatedMessage.status).toBe('READ');
      expect(updatedMessage.readAt).toBeInstanceOf(Date);

      // Cleanup
      await prisma.message.delete({ where: { id: message.id } });
      await prisma.user.delete({ where: { id: sender.id } });
      await prisma.user.delete({ where: { id: recipient.id } });
    });
  });

  describe('Activity Model', () => {
    it('should log system activities', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'Activity',
          lastName: 'User',
          email: 'activity@example.com',
          password: 'password',
          role: 'AGENT' as const,
        },
      });

      const activityData = {
        type: 'CUSTOMER_CREATED',
        description: 'Customer John Doe was created',
        userId: user.id,
        entityType: 'CUSTOMER',
        entityId: 'customer-id-123',
        metadata: {
          customerName: 'John Doe',
          source: 'website',
        },
      };

      const activity = await prisma.activity.create({
        data: activityData,
        include: { user: true },
      });

      expect(activity.type).toBe('CUSTOMER_CREATED');
      expect(activity.user.id).toBe(user.id);
      expect(activity.metadata).toEqual({
        customerName: 'John Doe',
        source: 'website',
      });

      // Cleanup
      await prisma.activity.delete({ where: { id: activity.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });
  });

  describe('Invitation Model', () => {
    it('should handle invitation lifecycle', async () => {
      const inviter = await prisma.user.create({
        data: {
          firstName: 'Inviter',
          lastName: 'User',
          email: 'inviter@example.com',
          password: 'password',
          role: 'ADMIN' as const,
        },
      });

      const invitationData = {
        email: 'invited@example.com',
        role: 'AGENT' as const,
        token: 'unique-invitation-token',
        inviterId: inviter.id,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        status: 'PENDING' as const,
      };

      const invitation = await prisma.invitation.create({
        data: invitationData,
        include: { inviter: true },
      });

      expect(invitation.status).toBe('PENDING');
      expect(invitation.inviter.id).toBe(inviter.id);
      expect(invitation.expiresAt).toBeInstanceOf(Date);

      // Test invitation acceptance
      const acceptedInvitation = await prisma.invitation.update({
        where: { id: invitation.id },
        data: { status: 'ACCEPTED', acceptedAt: new Date() },
      });

      expect(acceptedInvitation.status).toBe('ACCEPTED');
      expect(acceptedInvitation.acceptedAt).toBeInstanceOf(Date);

      // Cleanup
      await prisma.invitation.delete({ where: { id: invitation.id } });
      await prisma.user.delete({ where: { id: inviter.id } });
    });
  });

  describe('Database Performance', () => {
    it('should execute common queries efficiently', async () => {
      const start = Date.now();

      // Test typical dashboard query
      const [customerCount, leadCount, projectCount] = await Promise.all([
        prisma.customer.count(),
        prisma.lead.count(),
        prisma.project.count(),
      ]);

      const queryTime = Date.now() - start;

      expect(queryTime).toBeLessThan(500); // Should complete within 500ms
      expect(customerCount).toBeGreaterThanOrEqual(0);
      expect(leadCount).toBeGreaterThanOrEqual(0);
      expect(projectCount).toBeGreaterThanOrEqual(0);
    });

    it('should handle complex joins efficiently', async () => {
      const start = Date.now();

      const customersWithProjects = await prisma.customer.findMany({
        include: {
          projects: true,
          assignedUser: true,
          orders: true,
        },
        take: 10,
      });

      const queryTime = Date.now() - start;

      expect(queryTime).toBeLessThan(1000); // Complex joins within 1 second
      expect(customersWithProjects).toBeDefined();
    });

    it('should handle pagination efficiently', async () => {
      const start = Date.now();

      const paginatedCustomers = await prisma.customer.findMany({
        skip: 0,
        take: 20,
        orderBy: { createdAt: 'desc' },
      });

      const queryTime = Date.now() - start;

      expect(queryTime).toBeLessThan(200); // Pagination should be fast
      expect(paginatedCustomers.length).toBeLessThanOrEqual(20);
    });
  });

  describe('Data Integrity', () => {
    it('should maintain referential integrity', async () => {
      const user = await prisma.user.create({
        data: {
          firstName: 'Integrity',
          lastName: 'Test',
          email: 'integrity@example.com',
          password: 'password',
          role: 'AGENT' as const,
        },
      });

      const customer = await prisma.customer.create({
        data: {
          firstName: 'Test',
          lastName: 'Customer',
          email: 'test.integrity@example.com',
          status: 'ACTIVE' as const,
          source: 'WEBSITE' as const,
          assignedTo: user.id,
        },
      });

      // Try to delete user who has assigned customers
      // This should fail due to foreign key constraint
      await expect(
        prisma.user.delete({ where: { id: user.id } })
      ).rejects.toThrow();

      // Cleanup properly
      await prisma.customer.delete({ where: { id: customer.id } });
      await prisma.user.delete({ where: { id: user.id } });
    });

    it('should handle cascading deletes correctly', async () => {
      const customer = await prisma.customer.create({
        data: {
          firstName: 'Cascade',
          lastName: 'Customer',
          email: 'cascade@example.com',
          status: 'ACTIVE' as const,
          source: 'WEBSITE' as const,
        },
      });

      const project = await prisma.project.create({
        data: {
          name: 'Cascade Project',
          customerId: customer.id,
          status: 'ACTIVE' as const,
          priority: 'MEDIUM' as const,
        },
      });

      // Delete customer should cascade to projects
      await prisma.customer.delete({ where: { id: customer.id } });

      // Project should be deleted due to cascade
      const deletedProject = await prisma.project.findUnique({
        where: { id: project.id },
      });

      expect(deletedProject).toBeNull();
    });
  });
});

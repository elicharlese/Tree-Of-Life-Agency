import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import Joi from 'joi';

const prisma = new PrismaClient();

// Validation schemas
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  invitationToken: Joi.string().required()
});

// Helper function to generate JWT token
const generateToken = (user: { id: string; email: string; role: string }): string => {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role
    },
    process.env.JWT_SECRET!,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' } as jwt.SignOptions
  );
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { error, value } = registerSchema.validate(body);

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.details[0].message
      }, { status: 400 });
    }

    const { name, email, password, invitationToken } = value;

    // Find valid invitation
    const invitation = await prisma.invitation.findFirst({
      where: {
        token: invitationToken,
        status: 'PENDING',
        expiresAt: {
          gte: new Date()
        }
      }
    });

    if (!invitation) {
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired invitation'
      }, { status: 400 });
    }

    if (invitation.email !== email) {
      return NextResponse.json({
        success: false,
        error: 'Email does not match invitation'
      }, { status: 400 });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return NextResponse.json({
        success: false,
        error: 'User already exists'
      }, { status: 400 });
    }

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12');
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // Create user and update invitation in transaction
    const result = await prisma.$transaction(async (tx) => {
      // Create user
      const user = await tx.user.create({
        data: {
          name,
          email,
          passwordHash: hashedPassword,
          role: invitation.role,
          invitationId: invitation.id,
          isActive: true
        }
      });

      // Update invitation status
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: 'ACCEPTED',
          acceptedAt: new Date()
        }
      });

      return user;
    });

    // Generate JWT token
    const token = generateToken({
      id: result.id,
      email: result.email,
      role: result.role
    });

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: result.id,
        name: result.name,
        email: result.email,
        role: result.role
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json({
      success: false,
      error: 'Server error'
    }, { status: 500 });
  }
}
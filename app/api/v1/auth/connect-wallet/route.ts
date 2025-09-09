import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, signature, message } = body;

    if (!address || !signature || !message) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // In a real implementation, you would verify the signature here
    // For now, we'll create a basic wallet authentication

    // Find or create user with wallet address
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { walletAddress: address },
          { email: `${address}@wallet.temp` }
        ]
      }
    });

    if (!user) {
      // Create new user for wallet
      user = await prisma.user.create({
        data: {
          email: `${address}@wallet.temp`,
          firstName: `Wallet`,
          lastName: `User ${address.slice(0, 6)}`,
          passwordHash: 'wallet-auth', // Placeholder for wallet auth
          walletAddress: address,
          role: 'CLIENT',
          isActive: true
        }
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        role: user.role,
        walletAddress: address
      },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Log activity
    await prisma.activity.create({
      data: {
        entityType: 'user',
        entityId: user.id,
        type: 'wallet_connected',
        title: 'Wallet Connected',
        description: `Wallet ${address} connected successfully - Signature: ${signature.slice(0, 20)}...`,
        userId: user.id
      }
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role,
          walletAddress: user.walletAddress
        },
        paymentIntentId: 'wallet-payment-' + Date.now() // Mock payment intent for wallet payments
      }
    });

  } catch (error) {
    console.error('Wallet connection error:', error);
    return NextResponse.json(
      { error: 'Failed to connect wallet' },
      { status: 500 }
    );
  }
}

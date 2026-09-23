import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signToken, setAuthCookie } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, role = 'BUYER', dealerName, phone } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: role === 'DEALER' ? 'DEALER' : 'BUYER',
        dealerName: role === 'DEALER' ? dealerName || name : null,
        phone: phone || null,
      },
    });

    const sessionPayload = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
      dealerName: user.dealerName,
    };

    const token = signToken(sessionPayload);
    setAuthCookie(token);

    return NextResponse.json({
      user: sessionPayload,
      message: 'Account created successfully',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Registration failed', details: error.message },
      { status: 500 }
    );
  }
}

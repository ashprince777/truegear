import { NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const userSession = await getCurrentUser();
    if (!userSession) {
      return NextResponse.json({ user: null });
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: userSession.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        dealerName: true,
        dealerRating: true,
        dealerCity: true,
        dealerState: true,
        avatar: true,
        _count: {
          select: {
            favorites: true,
            savedSearches: true,
            listings: true,
          },
        },
      },
    });

    return NextResponse.json({ user: dbUser });
  } catch (error: any) {
    return NextResponse.json({ user: null });
  }
}

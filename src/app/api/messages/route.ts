import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const messages = await prisma.message.findMany({
      where: {
        OR: [
          { fromUserId: user.id },
          { toUserId: user.id },
        ],
      },
      include: {
        fromUser: {
          select: { id: true, name: true, dealerName: true },
        },
        toUser: {
          select: { id: true, name: true, dealerName: true },
        },
        listing: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            price: true,
            images: { take: 1, orderBy: { order: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ messages });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch messages' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { toUserId, listingId, body } = await request.json();

    if (!toUserId || !body) {
      return NextResponse.json({ error: 'Recipient and message body are required' }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        fromUserId: user.id,
        toUserId,
        listingId: listingId || null,
        body,
      },
      include: {
        fromUser: { select: { id: true, name: true } },
        listing: { select: { id: true, make: true, model: true, year: true } },
      },
    });

    return NextResponse.json({ message, success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}

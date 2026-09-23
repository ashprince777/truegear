import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const [totalUsers, totalListings, totalInquiries, listings] = await Promise.all([
      prisma.user.count(),
      prisma.listing.count(),
      prisma.inquiryLead.count(),
      prisma.listing.findMany({
        take: 20,
        orderBy: { createdAt: 'desc' },
        include: {
          seller: { select: { name: true, email: true, role: true } },
          images: { take: 1 },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        totalUsers,
        totalListings,
        totalInquiries,
      },
      listings,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch admin stats' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { listingId, action } = await request.json(); // action: 'FLAG' | 'ACTIVATE' | 'DELETE'

    if (action === 'DELETE') {
      await prisma.listing.delete({ where: { id: listingId } });
      return NextResponse.json({ success: true, message: 'Listing deleted' });
    }

    const updated = await prisma.listing.update({
      where: { id: listingId },
      data: {
        status: action === 'FLAG' ? 'FLAGGED' : 'ACTIVE',
      },
    });

    return NextResponse.json({ success: true, listing: updated });
  } catch (error: any) {
    return NextResponse.json({ error: 'Admin action failed' }, { status: 500 });
  }
}

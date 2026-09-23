import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const savedSearches = await prisma.savedSearch.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ savedSearches });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch saved searches' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Please sign in to save searches' }, { status: 401 });
    }

    const { name, filters } = await request.json();
    if (!name || !filters) {
      return NextResponse.json({ error: 'Name and filters are required' }, { status: 400 });
    }

    const saved = await prisma.savedSearch.create({
      data: {
        userId: user.id,
        name,
        filtersJson: typeof filters === 'string' ? filters : JSON.stringify(filters),
      },
    });

    return NextResponse.json({ savedSearch: saved, message: 'Search saved successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to save search' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    await prisma.savedSearch.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Saved search removed' });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to remove saved search' }, { status: 500 });
  }
}

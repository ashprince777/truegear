import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { listingId, buyerName, buyerEmail, buyerPhone, message } = await request.json();

    if (!listingId || !buyerName || !buyerEmail || !message) {
      return NextResponse.json(
        { error: 'Name, email, message and listing ID are required' },
        { status: 400 }
      );
    }

    const lead = await prisma.inquiryLead.create({
      data: {
        listingId,
        buyerName,
        buyerEmail,
        buyerPhone: buyerPhone || null,
        message,
        status: 'NEW',
      },
    });

    return NextResponse.json({
      success: true,
      lead,
      message: 'Your inquiry has been sent to the dealer! They will contact you shortly.',
    });
  } catch (error: any) {
    console.error('Inquiry error:', error);
    return NextResponse.json({ error: 'Failed to submit inquiry' }, { status: 500 });
  }
}

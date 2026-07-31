import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ success: false }, { status: 400 });

    const updated = await prisma.tourist_Attraction.update({
      where: { id },
      data: { view_count: { increment: 1 } },
      select: { view_count: true }
    });

    return NextResponse.json({ success: true, current_views: updated.view_count });
  } catch (error) {
    console.error("Lỗi tăng view:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

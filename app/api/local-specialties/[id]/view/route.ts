import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    if (!id) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let finalId = id;
    if (!isUUID) {
      const translation = await prisma.local_Specialty_Translation.findFirst({
        where: { slug: id }
      });
      if (translation) {
        finalId = translation.local_specialty_id;
      } else {
        return NextResponse.json({ success: false, message: "Not found" }, { status: 404 });
      }
    }

    const updated = await prisma.local_Specialty.update({
      where: { id: finalId },
      data: { views: { increment: 1 } },
      select: { views: true }
    });

    return NextResponse.json({ success: true, current_views: updated.views });
  } catch (error) {
    console.error("Lỗi tăng view local specialty:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

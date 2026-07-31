import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden: Bạn không có quyền truy cập.' }, { status: 403 });
    }

    const { id } = await context.params;

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá.' }, { status: 404 });
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Đã xóa đánh giá thành công.' });
  } catch (error) {
    console.error('Lỗi xóa review admin:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

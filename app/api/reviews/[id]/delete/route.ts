import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function DELETE(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await checkUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập để xóa' }, { status: 401 });
    }

    const existingReview = await prisma.review.findUnique({
      where: { id }
    });

    if (!existingReview || existingReview.user_id !== userId) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá hoặc bạn không có quyền xóa' }, { status: 404 });
    }

    await prisma.review.delete({
      where: { id }
    });

    return NextResponse.json({
      success: true,
      message: 'Xóa đánh giá thành công!'
    });

  } catch (error) {
    console.error('Lỗi khi xóa review:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi xóa đánh giá' }, { status: 500 });
  }
}
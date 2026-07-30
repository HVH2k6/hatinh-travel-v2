import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PUT(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const userId = await checkUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập để sửa đánh giá' }, { status: 401 });
    }

    const body = await request.json();
    const { rating, review_content, list_image } = body;

    if (!rating) {
      return NextResponse.json({ success: false, message: 'Vui lòng chọn số sao' }, { status: 400 });
    }

    // Check ownership
    const existingReview = await prisma.review.findUnique({
      where: { id },
      include: { user: true }
    });

    if (!existingReview || existingReview.user_id !== userId) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá hoặc bạn không có quyền sửa' }, { status: 404 });
    }

    let imagesArray: string[] = [];
    if (list_image && typeof list_image === 'string') {
      imagesArray = list_image.split(',').map(s => s.trim()).filter(Boolean);
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        rating: Number(rating),
        review_content: review_content || null,
        list_image: imagesArray.length > 0 ? imagesArray : null,
        is_approved: true,
      },
      include: { user: true }
    });

    const date = new Date(updatedReview.created_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    const returnData = {
      id: updatedReview.id,
      user: {
        id: updatedReview.user_id,
        name: updatedReview.user?.username || 'Khách hàng ẩn danh',
        avatar_url: updatedReview.user?.avatar || '/default-avatar.png'
      },
      rating: updatedReview.rating,
      review_content: updatedReview.review_content,
      list_image: updatedReview.list_image || [],
      reply_message: updatedReview.reply_message,
      pin: updatedReview.pin || false,
      created_at: formattedDate
    };

    return NextResponse.json({
      success: true,
      message: 'Cập nhật đánh giá thành công!',
      data: returnData
    });

  } catch (error) {
    console.error('Lỗi khi cập nhật review:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi cập nhật đánh giá' }, { status: 500 });
  }
}
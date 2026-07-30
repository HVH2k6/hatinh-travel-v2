import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const userId = await checkUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập để đánh giá' }, { status: 401 });
    }

    const body = await request.json();
    const { type, id, rating, review_content, list_image } = body;

    if (!type || !id || !rating) {
      return NextResponse.json({ success: false, message: 'Thiếu dữ liệu bắt buộc' }, { status: 400 });
    }

    const typeMapping: Record<string, string> = {
      product: 'App\\Models\\Product',
      shop: 'App\\Models\\Shop',
      location: 'App\\Models\\TouristAttraction',
      'local-specialty': 'App\\Models\\LocalSpecialty',
      'cultural-art': 'App\\Models\\CulturalArt',
    };

    const reviewableType = typeMapping[type];
    if (!reviewableType) {
      return NextResponse.json({ success: false, message: 'Loại đánh giá không hợp lệ' }, { status: 400 });
    }

    let imagesArray: string[] = [];
    if (list_image && typeof list_image === 'string') {
      imagesArray = list_image.split(',').map(s => s.trim()).filter(Boolean);
    }

    const newReview = await prisma.review.create({
      data: {
        user_id: userId,
        reviewable_id: id,
        reviewable_type: reviewableType,
        rating: Number(rating),
        review_content: review_content || null,
        list_image: imagesArray.length > 0 ? imagesArray : null,
        pin: false,
        is_approved: true,
      },
      include: {
        user: true
      }
    });

    const date = new Date(newReview.created_at);
    const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;

    const returnData = {
      id: newReview.id,
      user: {
        id: newReview.user_id,
        name: newReview.user?.username || 'Khách hàng ẩn danh',
        avatar_url: newReview.user?.avatar || '/default-avatar.png'
      },
      rating: newReview.rating,
      review_content: newReview.review_content,
      list_image: newReview.list_image || [],
      reply_message: newReview.reply_message,
      pin: newReview.pin || false,
      created_at: formattedDate
    };

    return NextResponse.json({
      success: true,
      message: 'Gửi đánh giá thành công!',
      data: returnData
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi khi lưu review:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi lưu đánh giá' }, { status: 500 });
  }
}
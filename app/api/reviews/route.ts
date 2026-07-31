import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    const ratingStr = searchParams.get('rating');
    const pageStr = searchParams.get('page') || '1';
    const limitStr = searchParams.get('limit') || '5';

    if (!type || !id) {
      return NextResponse.json({ success: false, message: 'Thiếu tham số type hoặc id' }, { status: 400 });
    }

    const typeMapping: Record<string, string[]> = {
      product: ['Product', 'App\\Models\\Product'],
      shop: ['Shop', 'App\\Models\\Shop'],
      location: ['TouristAttraction', 'App\\Models\\TouristAttraction'],
      'local-specialty': ['LocalSpecialty', 'App\\Models\\LocalSpecialty'],
      'cultural-art': ['CulturalArt', 'App\\Models\\CulturalArt'],
    };

    const reviewableType = typeMapping[type];
    if (!reviewableType) {
      return NextResponse.json({ success: false, message: 'Type không hợp lệ' }, { status: 400 });
    }

    const page = parseInt(pageStr, 10);
    const limit = parseInt(limitStr, 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {
      reviewable_type: { in: reviewableType },
      reviewable_id: id,
      is_approved: true,
    };

    if (ratingStr) {
      whereClause.rating = parseInt(ratingStr, 10);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: true
        },
        orderBy: [
          { pin: 'desc' },
          { created_at: 'desc' }
        ],
        skip,
        take: limit,
      }),
      prisma.review.count({ where: whereClause })
    ]);

    const formattedReviews = reviews.map((review: any) => {
      // Format ngày tương tự diffForHumans đơn giản
      const date = new Date(review.created_at);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      
      return {
        id: review.id,
        user: {
          id: review.user_id,
          name: review.user?.username || 'Khách hàng ẩn danh',
          avatar_url: review.user?.avatar || '/default-avatar.png'
        },
        rating: review.rating,
        review_content: review.review_content,
        list_image: review.list_image || [],
        reply_message: review.reply_message,
        pin: review.pin || false,
        created_at: formattedDate
      };
    });

    return NextResponse.json({
      success: true,
      message: 'Lấy danh sách đánh giá thành công!',
      data: {
        data: formattedReviews,
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        total: total,
      }
    });

  } catch (error) {
    console.error('Lỗi lấy reviews:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

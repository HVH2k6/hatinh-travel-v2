import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

async function getSellerShop() {
  const userId = await checkUser();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, shop: true }
  });

  if (!user || user.role?.name !== 'Seller' || !user.shop) return null;
  return user.shop;
}

export async function GET(request: Request) {
  try {
    const shop = await getSellerShop();
    if (!shop) {
      return NextResponse.json({ success: false, message: 'Unauthorized, or you do not have a shop yet.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    // Lấy danh sách Product IDs thuộc Shop này
    const products = await prisma.product.findMany({
      where: { shop_id: shop.id },
      select: { id: true, translations: true }
    });
    const productIds = products.map(p => p.id);

    // Xây dựng điều kiện query:
    // Đánh giá về Cửa hàng HOẶC Đánh giá về Sản phẩm của cửa hàng
    const whereClause = {
      OR: [
        {
          reviewable_type: { in: ['Shop', 'App\\Models\\Shop'] },
          reviewable_id: shop.id
        },
        {
          reviewable_type: { in: ['Product', 'App\\Models\\Product'] },
          reviewable_id: { in: productIds }
        }
      ]
    };

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: whereClause,
        include: {
          user: true
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.review.count({
        where: whereClause
      })
    ]);

    const formattedReviews = reviews.map(review => {
      const date = new Date(review.created_at);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      
      // Determine target name
      let targetName = 'Cửa hàng';
      if (review.reviewable_type === 'Product' || review.reviewable_type === 'App\\Models\\Product') {
        const prod = products.find(p => p.id === review.reviewable_id);
        const prodName = prod?.translations?.find(t => t.language_code === 'vi')?.name || 'Sản phẩm';
        targetName = `Sản phẩm: ${prodName}`;
      }

      return {
        id: review.id,
        user: {
          id: review.user_id,
          name: review.user?.username || 'Khách hàng ẩn danh',
          avatar_url: review.user?.avatar || '/default-avatar.png'
        },
        target_name: targetName,
        reviewable_type: review.reviewable_type,
        reviewable_id: review.reviewable_id,
        rating: review.rating,
        review_content: review.review_content,
        list_image: review.list_image || [],
        reply_message: review.reply_message,
        pin: review.pin || false,
        is_approved: review.is_approved,
        created_at: formattedDate
      };
    });

    return NextResponse.json({
      success: true,
      data: formattedReviews,
      total,
      page,
      last_page: Math.ceil(total / limit) || 1
    });

  } catch (error) {
    console.error('Error fetching seller reviews:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

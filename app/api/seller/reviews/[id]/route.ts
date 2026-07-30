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

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const shop = await getSellerShop();
    if (!shop) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { reply_message } = body;

    // Verify the review belongs to the seller's shop or product
    const review = await prisma.review.findUnique({
      where: { id }
    });

    if (!review) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đánh giá' }, { status: 404 });
    }

    let isOwner = false;
    if (review.reviewable_type === 'App\\Models\\Shop' && review.reviewable_id === shop.id) {
      isOwner = true;
    } else if (review.reviewable_type === 'App\\Models\\Product') {
      const product = await prisma.product.findFirst({
        where: { id: review.reviewable_id, shop_id: shop.id }
      });
      if (product) isOwner = true;
    }

    if (!isOwner) {
      return NextResponse.json({ success: false, message: 'Bạn không có quyền phản hồi đánh giá này' }, { status: 403 });
    }

    const updatedReview = await prisma.review.update({
      where: { id },
      data: {
        reply_message: reply_message || null
      }
    });

    return NextResponse.json({ success: true, message: 'Phản hồi đánh giá thành công', data: updatedReview });
  } catch (error) {
    console.error('Error replying to review:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

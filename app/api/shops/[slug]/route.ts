import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const slug = params.slug;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || request.headers.get('Accept-Language') || 'vi';

    const shop = await prisma.shop.findFirst({
      where: {
        translations: {
          some: {
            slug: slug
          }
        },
        status: 'active'
      },
      include: {
        translations: true,
        address: {
          include: {
            translations: true,
            ward: true
          }
        }
      }
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, message: 'Cửa hàng không tồn tại hoặc đã bị ẩn' },
        { status: 404 }
      );
    }

    // Increment views asynchronously (fire and forget)
    prisma.shop.update({
      where: { id: shop.id },
      data: { views: { increment: 1 } }
    }).catch(console.error);

    const trans = shop.translations.find((t: any) => t.language_code === lang) || shop.translations[0];
    const addrTrans = shop.address?.translations.find((t: any) => t.language_code === lang) || shop.address?.translations[0];

    const formattedShop = {
      id: shop.id,
      slug: trans?.slug || '',
      name: trans?.name || 'N/A',
      description: trans?.description || '',
      phone_number: shop.phone_number || '',
      contact_email: shop.contact_email || '',
      logo_url: shop.logo_url,
      cover_image_url: shop.cover_image_url,
      rating: shop.rating ? Number(shop.rating) : 0,
      total_reviews: shop.total_reviews || 0,
      views: shop.views || 0,
      location: {
        address_detail: addrTrans?.detail || '',
        ward_name: shop.address?.ward?.name || '',
        map_url: shop.address?.map_url || null,
      },
      created_at: shop.created_at,
    };

    return NextResponse.json({
      success: true,
      message: 'Success',
      data: formattedShop
    });
  } catch (error) {
    console.error('Error fetching shop detail:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

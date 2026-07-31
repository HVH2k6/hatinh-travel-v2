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

    const product = await prisma.product.findFirst({
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
        unit: {
          include: {
            translations: true
          }
        },
        shop: {
          include: {
            translations: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json(
        { success: false, message: 'Sản phẩm không tồn tại hoặc đã bị ẩn' },
        { status: 404 }
      );
    }

    // Increment views asynchronously
    prisma.product.update({
      where: { id: product.id },
      data: { views: { increment: 1 } }
    }).catch(console.error);

    const trans = product.translations.find((t: any) => t.language_code === lang) || product.translations[0];
    const unitTrans = product.unit?.translations.find((t: any) => t.language_code === lang) || product.unit?.translations[0];
    
    let shopData = null;
    if (product.shop) {
      const shopTrans = product.shop.translations.find((t: any) => t.language_code === lang) || product.shop.translations[0];
      shopData = {
        id: product.shop.id,
        slug: shopTrans?.slug || '',
        name: shopTrans?.name || 'N/A',
        logo_url: product.shop.logo_url,
        rating: product.shop.rating ? Number(product.shop.rating) : 0,
      };
    }

    const formattedProduct = {
      id: product.id,
      slug: trans?.slug || '',
      name: trans?.name || 'N/A',
      description: trans?.description || '',
      price: Number(product.price),
      image: product.image,
      list_image: typeof product.list_image === 'string' ? JSON.parse(product.list_image) : (product.list_image || []),
      is_featured: product.is_featured || false,
      unit: unitTrans?.name || '',
      created_at: product.created_at,
      shop: shopData
    };

    return NextResponse.json({
      success: true,
      message: 'Success',
      data: formattedProduct
    });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

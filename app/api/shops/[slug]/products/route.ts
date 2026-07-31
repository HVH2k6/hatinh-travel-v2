import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  props: { params: Promise<{ slug: string }> }
) {
  try {
    const params = await props.params;
    const shopId = params.slug;
    
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || request.headers.get('Accept-Language') || 'vi';
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit') as string, 10) : 8;
    const page = searchParams.get('page') ? parseInt(searchParams.get('page') as string, 10) : 1;
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: {
          shop_id: shopId,
          status: 'active'
        },
        orderBy: {
          created_at: 'desc'
        },
        take: limit,
        skip,
        include: {
          translations: true,
          unit: {
            include: {
              translations: true
            }
          }
        }
      }),
      prisma.product.count({
        where: {
          shop_id: shopId,
          status: 'active'
        }
      })
    ]);

    const formattedData = products.map((item: any) => {
      const trans = item.translations?.find((t: any) => t.language_code === lang) || item.translations?.[0];
      const unitTrans = item.unit?.translations?.find((t: any) => t.language_code === lang) || item.unit?.translations?.[0];

      return {
        id: item.id,
        slug: trans?.slug || '',
        name: trans?.name || 'N/A',
        description: trans?.description || '',
        price: Number(item.price),
        image: item.image,
        list_image: typeof item.list_image === 'string' ? JSON.parse(item.list_image) : (item.list_image || []),
        is_featured: item.is_featured,
        unit: unitTrans?.name || '',
      };
    });

    const lastPage = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      message: 'Success',
      data: {
        current_page: page,
        data: formattedData,
        first_page_url: `?page=1`,
        from: total === 0 ? null : skip + 1,
        last_page: lastPage,
        last_page_url: `?page=${lastPage}`,
        links: [],
        next_page_url: page < lastPage ? `?page=${page + 1}` : null,
        path: request.url.split('?')[0],
        per_page: limit,
        prev_page_url: page > 1 ? `?page=${page - 1}` : null,
        to: total === 0 ? null : Math.min(skip + limit, total),
        total: total
      }
    });
  } catch (error) {
    console.error('Error fetching shop products:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

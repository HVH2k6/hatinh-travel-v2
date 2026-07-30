import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || request.headers.get('Accept-Language') || 'vi';
    const search = searchParams.get('search');
    const sortBy = searchParams.get('sort_by') || 'latest';
    const pageStr = searchParams.get('page');
    const perPageStr = searchParams.get('per_page');
    const limitStr = searchParams.get('limit');

    // Build where clause
    const whereClause: any = {
      is_active: true,
    };

    if (search) {
      whereClause.translations = {
        some: {
          name: {
            contains: search,
            mode: 'insensitive',
          },
        },
      };
    }

    // Build orderBy clause
    let orderByClause: any = { created_at: 'desc' };
    switch (sortBy) {
      case 'views_desc':
        orderByClause = { view_count: 'desc' };
        break;
      case 'price_asc':
        orderByClause = { min_price: 'asc' };
        break;
      case 'price_desc':
        orderByClause = { max_price: 'desc' };
        break;
      case 'latest':
      default:
        orderByClause = { created_at: 'desc' };
        break;
    }

    // Handle pagination or limit
    let take = undefined;
    let skip = undefined;
    let isPaginated = false;
    let page = 1;
    let perPage = 10;
    
    if (pageStr || perPageStr) {
      isPaginated = true;
      page = pageStr ? parseInt(pageStr, 10) : 1;
      perPage = perPageStr ? parseInt(perPageStr, 10) : 10;
      take = perPage;
      skip = (page - 1) * perPage;
    } else if (limitStr) {
      take = parseInt(limitStr, 10);
    }

    const [attractions, total] = await Promise.all([
      prisma.tourist_Attraction.findMany({
        where: whereClause,
        orderBy: orderByClause,
        take,
        skip,
        include: {
          translations: true,
          category: {
            include: { translations: true }
          },
          type: {
            include: { translations: true }
          },
          address: {
            include: {
              translations: true,
              ward: true
            }
          }
        },
      }),
      isPaginated ? prisma.tourist_Attraction.count({ where: whereClause }) : Promise.resolve(0)
    ]);

    // Format Data
    const formattedData = attractions.map((item: any) => {
      const trans = item.translations.find((t: any) => t.language_code === lang) || item.translations[0];
      const catTrans = item.category?.translations.find((t: any) => t.language_code === lang) || item.category?.translations[0];
      const typeTrans = item.type?.translations.find((t: any) => t.language_code === lang) || item.type?.translations[0];
      const addrTrans = item.address?.translations.find((t: any) => t.language_code === lang) || item.address?.translations[0];

      return {
        id: item.id,
        image: item.image,
        sub_image: item.sub_image,
        name: trans ? trans.name : 'N/A',
        slug: trans ? trans.slug : '',
        description: trans ? trans.description : '',
        category: catTrans ? catTrans.name : null,
        type: typeTrans ? typeTrans.name : null,
        address: {
          ward: item.address?.ward?.name || null,
          district: item.address?.ward?.district_name || null,
          address_detail: addrTrans ? addrTrans.detail : '',
          map_url: item.address ? item.address.map_url : null,
        },
        opening_time: item.opening_time,
        closing_time: item.closing_time,
        min_price: item.min_price ? Number(item.min_price) : 0,
        max_price: item.max_price ? Number(item.max_price) : 0,
        phone_number: item.phone_number,
        website: item.website,
        is_featured: item.is_featured,
        view_count: item.view_count,
      };
    });

    if (isPaginated) {
      return NextResponse.json({
        success: true,
        current_language: lang,
        sort_by: sortBy,
        data: formattedData,
        pagination: {
          current_page: page,
          last_page: Math.ceil(total / perPage),
          per_page: perPage,
          total: total,
        }
      });
    }

    return NextResponse.json({
      success: true,
      current_language: lang,
      sort_by: sortBy,
      data: formattedData,
      pagination: null
    });

  } catch (error) {
    console.error('Error fetching attractions:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

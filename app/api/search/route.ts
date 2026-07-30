import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || request.headers.get('Accept-Language') || 'vi';
    const q = searchParams.get('q') || '';
    const typesParam = searchParams.get('types') || '';
    const sort = searchParams.get('sort') || 'latest';
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '12', 10);

    const types = typesParam.split(',').filter(Boolean);
    if (types.length === 0) {
      return NextResponse.json({
        success: true,
        data: [],
        current_page: page,
        last_page: 1,
        total: 0
      });
    }

    const searchCondition = q ? {
      translations: {
        some: {
          language_code: lang,
          name: { contains: q, mode: 'insensitive' as any }
        }
      }
    } : {};

    // Parallel fetch from requested tables
    const promises: Promise<any[]>[] = [];

    if (types.includes('attraction')) {
      promises.push(
        prisma.tourist_Attraction.findMany({
          where: { is_active: true, ...searchCondition },
          include: { translations: true }
        }).then(res => res.map(item => ({
          id: item.id,
          name: item.translations.find((t: any) => t.language_code === lang)?.name || '',
          slug: item.translations.find((t: any) => t.language_code === lang)?.slug || '',
          description: item.translations.find((t: any) => t.language_code === lang)?.description || '',
          image: item.image || '',
          category_id: item.category_id || '',
          views: item.view_count || 0,
          created_at: item.created_at,
          type: 'attraction'
        })))
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    if (types.includes('specialty')) {
      promises.push(
        prisma.local_Specialty.findMany({
          where: { status: 'active', ...searchCondition },
          include: { translations: true }
        }).then(res => res.map(item => ({
          id: item.id,
          name: item.translations.find((t: any) => t.language_code === lang)?.name || '',
          slug: item.translations.find((t: any) => t.language_code === lang)?.slug || '',
          description: item.translations.find((t: any) => t.language_code === lang)?.description || '',
          image: item.image || '',
          category_id: item.category_id || '',
          views: item.views || 0,
          created_at: item.created_at,
          type: 'specialty'
        })))
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    if (types.includes('art')) {
      promises.push(
        prisma.cultural_Art.findMany({
          where: { is_active: true, ...searchCondition },
          include: { translations: true }
        }).then(res => res.map(item => ({
          id: item.id,
          name: item.translations.find((t: any) => t.language_code === lang)?.name || '',
          slug: item.translations.find((t: any) => t.language_code === lang)?.slug || '',
          description: item.translations.find((t: any) => t.language_code === lang)?.description || '',
          image: item.image || '',
          category_id: item.category_id || '',
          views: item.views || 0,
          created_at: item.created_at,
          type: 'art'
        })))
      );
    } else {
      promises.push(Promise.resolve([]));
    }

    const [attractions, specialties, arts] = await Promise.all(promises);

    // Combine all results
    let allResults = [...attractions, ...specialties, ...arts];

    // Filter out items without a valid translation in the current language
    allResults = allResults.filter(item => item.name && item.slug);

    // Sorting
    if (sort === 'latest') {
      allResults.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    } else if (sort === 'popular') {
      allResults.sort((a, b) => b.views - a.views);
    }

    // Pagination in memory
    const total = allResults.length;
    const lastPage = Math.ceil(total / limit) || 1;
    const skip = (page - 1) * limit;
    
    const paginatedResults = allResults.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedResults,
      current_page: page,
      last_page: lastPage,
      total: total
    });

  } catch (error) {
    console.error('Search API error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tìm kiếm' }, { status: 500 });
  }
}

import React from 'react';
import { AttractionCard } from '@/components/cards/attraction-card';
import { TouristAttraction } from '@/interface/IAttraction';
import prisma from '@/lib/prisma';

interface AttractionDataProps {
  locale: string;
}

export default async function AttractionData({ locale }: AttractionDataProps) {
  try {
    const dbAttractions = await prisma.tourist_Attraction.findMany({
      where: { is_active: true },
      take: 8,
      orderBy: { view_count: 'desc' },
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
            ward: true,
            translations: true
          }
        }
      }
    });

    const attractions: TouristAttraction[] = dbAttractions.map(attr => {
      const translation = attr.translations.find(t => t.language_code === locale) || attr.translations.find(t => t.language_code === 'vi') || attr.translations[0];
      const catTrans = attr.category?.translations.find(t => t.language_code === locale) || attr.category?.translations.find(t => t.language_code === 'vi');
      const typeTrans = attr.type?.translations.find(t => t.language_code === locale) || attr.type?.translations.find(t => t.language_code === 'vi');
      const addrTrans = attr.address?.translations.find(t => t.language_code === locale) || attr.address?.translations.find(t => t.language_code === 'vi');

      return {
        id: attr.id,
        image: attr.image,
        sub_image: attr.sub_image as string[] | null,
        name: translation?.name || '',
        slug: translation?.slug || '',
        description: translation?.description || '',
        category: catTrans?.name || null,
        type: typeTrans?.name || null,
        address: {
          ward: attr.address?.ward?.name || null,
          district: attr.address?.ward?.district_name || null,
          address_detail: addrTrans?.detail || '',
          map_url: attr.address?.map_url || null,
        },
        opening_time: attr.opening_time ? attr.opening_time.toISOString() : null,
        closing_time: attr.closing_time ? attr.closing_time.toISOString() : null,
        min_price: attr.min_price ? Number(attr.min_price) : 0,
        max_price: attr.max_price ? Number(attr.max_price) : 0,
        phone_number: attr.phone_number,
        website: attr.website,
        is_featured: attr.is_featured || false,
        view_count: attr.view_count || 0,
      };
    });

    if (attractions.length === 0) {
      return (
        <p className='text-sm text-slate-400'>
          Không có địa điểm nào hiển thị.
        </p>
      );
    }

    return (
      /* Cấu trúc Grid phân bổ đều 8 địa điểm thành 2 hàng, mỗi hàng 4 cột trên PC */
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {attractions.map((item: any) => (
          <AttractionCard key={item.id} item={item} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Lỗi lấy dữ liệu điểm du lịch:', error);
    return (
      <div className='p-4 border border-red-100 bg-red-50 text-red-600 rounded-xl text-sm'>
        Đã xảy ra lỗi khi tải danh sách địa điểm du lịch. Vui lòng thử lại sau.
      </div>
    );
  }
}

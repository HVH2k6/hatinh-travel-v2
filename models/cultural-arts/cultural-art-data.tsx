import React from 'react';
import { CulturalArtCard } from '@/components/cards/cultural-art-card';
import { CulturalArt } from '@/interface/ICulturalArt';

import prisma from '@/lib/prisma';

interface CulturalArtDataProps {
  locale: string;
}

export default async function CulturalArtData({ locale }: CulturalArtDataProps) {
  try {
    const dbArts = await prisma.cultural_Art.findMany({
      where: { is_active: true },
      take: 8,
      orderBy: { views: 'desc' },
      include: {
        translations: true,
        category: {
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

    const data: CulturalArt[] = dbArts.map(art => {
      const translation = art.translations.find(t => t.language_code === locale) || art.translations.find(t => t.language_code === 'vi') || art.translations[0];
      const catTrans = art.category?.translations.find(t => t.language_code === locale) || art.category?.translations.find(t => t.language_code === 'vi');
      const addrTrans = art.address?.translations.find(t => t.language_code === locale) || art.address?.translations.find(t => t.language_code === 'vi');

      return {
        id: art.id,
        image: art.image,
        list_image: art.list_image as string[] | null,
        link_video: art.link_video || null,
        name: translation?.name || '',
        slug: translation?.slug || '',
        description: translation?.description || '',
        is_featured: art.is_featured || false,
        views: art.views || 0,
        position: art.position || 0,
        category: catTrans ? { id: art.category_id!, name: catTrans.name } : null,
        address: {
          ward: art.address?.ward?.name || null,
          address_detail: addrTrans?.detail || '',
          map_url: art.address?.map_url || null,
        },
        created_at: art.created_at ? art.created_at.toISOString() : null,
      };
    });

    if (data.length === 0) {
      return (
        <p className='text-sm text-slate-400 font-medium py-4 text-center'>
          Không có thông tin văn hóa nghệ thuật nào hiển thị.
        </p>
      );
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {data.map((item: CulturalArt) => (
          <CulturalArtCard key={item.id} item={item} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Lỗi lấy dữ liệu văn hóa nghệ thuật:', error);
    return (
      <div className='p-4 border border-red-100 bg-red-50 text-red-600 rounded-xl text-sm font-bold'>
        Lỗi kết nối dữ liệu văn hóa nghệ thuật.
      </div>
    );
  }
}

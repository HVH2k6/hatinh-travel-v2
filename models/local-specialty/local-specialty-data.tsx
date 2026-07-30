import React from 'react';
import { LocalSpecialtyCard } from '@/components/cards/local-specicalty-card';
import { LocalSpecialty } from '@/interface/ILocalSpecialty';

import prisma from '@/lib/prisma';

interface LocalSpecialtyDataProps {
  locale: string;
}

export default async function LocalSpecialtyData({ locale }: LocalSpecialtyDataProps) {
  try {
    const dbSpecialties = await prisma.local_Specialty.findMany({
      where: { status: 'active' },
      take: 8,
      orderBy: { views: 'desc' },
      include: {
        translations: true,
        category: {
          include: { translations: true }
        },
        unit: {
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

    const data: LocalSpecialty[] = dbSpecialties.map(spec => {
      const translation = spec.translations.find(t => t.language_code === locale) || spec.translations.find(t => t.language_code === 'vi') || spec.translations[0];
      const catTrans = spec.category?.translations.find(t => t.language_code === locale) || spec.category?.translations.find(t => t.language_code === 'vi');
      const unitTrans = spec.unit?.translations.find(t => t.language_code === locale) || spec.unit?.translations.find(t => t.language_code === 'vi');
      const addrTrans = spec.address?.translations.find(t => t.language_code === locale) || spec.address?.translations.find(t => t.language_code === 'vi');

      return {
        id: spec.id,
        image: spec.image,
        sub_image: spec.list_image as string[] | null,
        name: translation?.name || '',
        slug: translation?.slug || '',
        description: translation?.description || '',
        ingredients: translation?.ingredients || null,
        category: catTrans ? { id: spec.category_id!, name: catTrans.name } : null,
        unit: unitTrans?.name || null,
        price: spec.price ? Number(spec.price) : 0,
        address: {
          ward: spec.address?.ward?.name || null,
          district: spec.address?.ward?.district_name || null,
          address_detail: addrTrans?.detail || '',
          map_url: spec.address?.map_url || null,
        },
        is_featured: spec.is_featured || false,
        view_count: spec.views || 0,
      };
    });

    if (data.length === 0) {
      return (
        <p className='text-sm text-slate-400 font-medium py-4'>
          Không có sản phẩm đặc sản nào hiển thị.
        </p>
      );
    }

    return (
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {data.map((item: any) => (
          
          <LocalSpecialtyCard key={item.id} item={item} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Lỗi lấy dữ liệu đặc sản:', error);
    return (
      <div className='p-4 border border-red-100 bg-red-50 text-red-600 rounded-xl text-sm font-bold'>
        Lỗi kết nối dữ liệu đặc sản.
      </div>
    );
  }
}
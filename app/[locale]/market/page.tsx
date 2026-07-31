import { IGetShopsResponse } from '@/interface/IShop';
import ShopsList from '@/models/market/market-data';
import { ShoppingBagIcon } from 'lucide-react';
import { getTranslations, getLocale } from 'next-intl/server';
import Link from 'next/link';

import prisma from '@/lib/prisma';

async function fetchShops(locale: string): Promise<IGetShopsResponse | null> {
  try {
    const dbShops = await prisma.shop.findMany({
      where: { status: 'active' },
      take: 20,
      include: {
        translations: true,
        address: { include: { ward: true, translations: true } }
      }
    });

    const shops = dbShops.map((s: any) => {
      const translation = s.translations.find((t: any) => t.language_code === locale) || s.translations.find((t: any) => t.language_code === 'vi') || s.translations[0];
      const addrTrans = s.address?.translations.find((t: any) => t.language_code === locale) || s.address?.translations.find((t: any) => t.language_code === 'vi');

      return {
        id: s.id,
        slug: translation?.slug || '',
        name: translation?.name || '',
        description: translation?.description || '',
        phone_number: s.phone_number || '',
        contact_email: s.contact_email || '',
        logo_url: s.logo_url || null,
        rating: s.rating ? Number(s.rating) : 0,
        total_reviews: s.total_reviews || 0,
        views: s.views || 0,
        location: {
          address_detail: addrTrans?.detail || '',
          ward_name: s.address?.ward?.name || '',
          map_url: s.address?.map_url || null,
        },
        created_at: s.created_at ? s.created_at.toISOString() : new Date().toISOString()
      };
    });

    return {
      success: true,
      message: 'Success',
      data: {
        current_page: 1,
        data: shops,
        first_page_url: '',
        from: 1,
        last_page: 1,
        last_page_url: '',
        links: [],
        next_page_url: null,
        path: '',
        per_page: 20,
        prev_page_url: null,
        to: shops.length,
        total: shops.length,
      }
    };
  } catch (error) {
    console.error('Lỗi khi tải danh sách cửa hàng:', error);
    return null;
  }
}

export default async function MarketPage() {
  const t = await getTranslations('market');
  const locale = await getLocale();

  const response = await fetchShops(locale);

  return (
    <div className='min-h-screen bg-slate-50 py-10'>
      <div className='max-w-7xl mx-auto px-6 space-y-8'>
        {/* Tiêu đề trang */}
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-3'>
            <ShoppingBagIcon className='w-8 h-8 text-orange-600' />
            <h1 className='text-3xl font-black tracking-tight text-slate-900'>
              {t('title') || 'Gian hàng Đặc sản'}
            </h1>
          </div>

        </div>

        {/* 2. Render ShopList và truyền response vào làm Props */}
        {response && response.success ? (
          <ShopsList response={response} />
        ) : (
          <div className='text-center py-20 text-slate-500 font-medium bg-white rounded-2xl border border-dashed border-slate-300'>
            {response?.message ||
              'Hệ thống đang bảo trì hoặc chưa có cửa hàng nào được tạo.'}
          </div>
        )}
      </div>
    </div>
  );
}

'use client';

import React from 'react';
import Image from 'next/image';
import {
  Star,
  MapPin,
  Phone,
  Mail,
  Eye,
  Calendar,
  ArrowLeft,
  Share2,
  Store,
} from 'lucide-react';
import { useRouter } from '@/i18n/navigation';
import { useTranslations, useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { IShop } from '@/interface/IShop';
import { IGetShopProductsResponse } from '@/interface/IProduct';
import ProductList from '../product/product-list';
import ReviewSection from '@/components/review/review-section';

interface ShopDetailClientProps {
  shop: IShop;
  productsResponse: IGetShopProductsResponse;
}

export default function ShopDetailClient({
  shop,
  productsResponse,
}: ShopDetailClientProps) {
  const router = useRouter();
  const currentLang = useLocale();
  const t = useTranslations('shop_detail');

  const [viewCount, setViewCount] = React.useState(shop.views);
  const hasCalledView = React.useRef(false);

  React.useEffect(() => {
    let isMounted = true;
    let viewTimer: NodeJS.Timeout;

    const incrementView = async () => {
      if (hasCalledView.current) return;
      hasCalledView.current = true;

      try {
        const cleanIdentifier = encodeURIComponent(shop.id);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_URL}/shops/${cleanIdentifier}/view`,
          {
            method: 'POST',
            headers: {
              Accept: 'application/json',
              'Content-Type': 'application/json',
            },
          },
        );

        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setViewCount(data.current_views);
          }
        } else {
          hasCalledView.current = false;
        }
      } catch (error) {
        hasCalledView.current = false;
      }
    };

    if (shop.id) {
      viewTimer = setTimeout(() => {
        incrementView();
      }, 10000);
    }

    return () => {
      isMounted = false;
      clearTimeout(viewTimer);
    };
  }, [shop.id]);

  const joinedDate = new Date(shop.created_at).toLocaleDateString(
    currentLang === 'vi' ? 'vi-VN' : currentLang,
    {
      year: 'numeric',
      month: 'long',
    },
  );

  return (
    <div className='bg-slate-50/50 min-h-screen pb-16'>
      {/* 1. KHU VỰC HERO BANNER */}
      <div className='relative h-60 w-full bg-slate-900 overflow-hidden'>
        {shop.logo_url && (
          <img
            src={shop.logo_url}
            alt={shop.name}
            className='absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110'
          />
        )}
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent' />

        {/* Nút quay lại điều hướng */}
        <div className='max-w-6xl mx-auto px-6 pt-6 relative z-10'>
          <Button
            variant='ghost'
            onClick={() => router.back()}
            className='text-white hover:bg-white/10 gap-2 rounded-xl'
          >
            <ArrowLeft className='w-4 h-4' />
            <span>{t('back_button')}</span>
          </Button>
        </div>
      </div>

      {/* 2. KHỐI THÔNG TIN CHÍNH */}
      <div className='max-w-6xl mx-auto px-6 -mt-24 relative z-20'>
        <div className='bg-white rounded-3xl border border-slate-200/80 p-6 md:p-8 shadow-xl/5 flex flex-col md:flex-row gap-6 items-start'>
          {/* Logo Shop */}
          <div className='relative w-32 h-32 md:w-40 md:h-40 bg-white rounded-2xl overflow-hidden shadow-md border border-slate-100 shrink-0 mx-auto md:mx-0'>
            {shop.logo_url ? (
              <Image
                src={shop.logo_url}
                alt={shop.name}
                fill
                className='object-cover'
                unoptimized
              />
            ) : (
              <div className='w-full h-full bg-slate-100 flex items-center justify-center text-slate-400'>
                <Store className='w-16 h-16' />
              </div>
            )}
          </div>

          {/* Cụm Chữ Tên Shop & Thống số */}
          <div className='flex-grow space-y-4 text-center md:text-left w-full'>
            <div className='flex flex-col md:flex-row md:items-center justify-between gap-4'>
              <div className='space-y-1.5'>
                <h1 className='text-2xl md:text-3xl font-black tracking-tight text-slate-900'>
                  {shop.name}
                </h1>

                {/* Đánh giá & Lượt xem */}
                <div className='flex items-center justify-center md:justify-start gap-4 text-sm font-medium'>
                  <div className='flex items-center gap-1 bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg'>
                    <Star className='w-4 h-4 fill-yellow-500 text-yellow-500' />
                    <span>{shop.rating.toFixed(1)}</span>
                    <span className='text-slate-400 font-normal'>
                      {t('reviews_count', { count: shop.total_reviews })}
                    </span>
                  </div>
                  <div className='flex items-center gap-1 text-slate-500'>
                    <Eye className='w-4 h-4 text-slate-400' />
                    <span>{t('views_count', { count: viewCount })}</span>
                  </div>
                </div>
              </div>

              {/* Nút hành động phụ */}
              <div className='flex items-center justify-center gap-2 shrink-0'>
                <Button
                  variant='outline'
                  size='icon'
                  className='rounded-xl border-slate-200'
                >
                  <Share2 className='w-4 h-4 text-slate-600' />
                </Button>
                <Button className='bg-orange-600 hover:bg-orange-700 font-bold px-5 rounded-xl shadow-sm'>
                  {t('contact_button')}
                </Button>
              </div>
            </div>

            {/* Chi tiết liên hệ nhanh */}
            <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-sm font-medium text-slate-600'>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Phone className='w-4 h-4 text-orange-500' />
                <span>{shop.phone_number}</span>
              </div>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Mail className='w-4 h-4 text-orange-500' />
                <span className='truncate'>{shop.contact_email}</span>
              </div>
              <div className='flex items-center gap-2 justify-center md:justify-start'>
                <Calendar className='w-4 h-4 text-orange-500' />
                <span>{t('joined_at', { date: joinedDate })}</span>
              </div>
            </div>
          </div>
        </div>

        {/* 3. KHU VỰC NỘI DUNG CHI TIẾT */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8'>
          {/* Cột trái: Giới thiệu mô tả cửa hàng */}
          <div className='lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm'>
            <h2 className='text-lg font-bold text-slate-900 border-b border-slate-100 pb-3'>
              {t('about_title')}
            </h2>
            <p className='text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-line'>
              {shop.description || t('no_description')}
            </p>
          </div>

          {/* Cột phải: Vị trí & Google Maps */}
          <div className='bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm flex flex-col'>
            <h2 className='text-lg font-bold text-slate-900 border-b border-slate-100 pb-3'>
              {t('address_title')}
            </h2>

            <div className='flex items-start gap-2.5 text-sm font-medium text-slate-600'>
              <MapPin className='w-4 h-4 text-orange-500 shrink-0 mt-0.5' />
              <span>
                {shop.location.address_detail}, {shop.location.ward_name}
              </span>
            </div>

            {/* Nhúng bản đồ Iframe */}
            {shop.location.map_url ? (
              <div className='relative w-full flex-grow h-48 lg:h-full rounded-xl overflow-hidden border border-slate-100 min-h-[180px]'>
                <iframe
                  src={shop.location.map_url}
                  className='w-full h-full border-0'
                  allowFullScreen
                  loading='lazy'
                  referrerPolicy='no-referrer-when-downgrade'
                />
              </div>
            ) : (
              <div className='w-full h-48 bg-slate-50 border border-dashed rounded-xl flex flex-col items-center justify-center p-4 text-center text-slate-400 gap-2'>
                <MapPin className='w-8 h-8 text-slate-300' />
                <span className='text-xs font-medium'>{t('map_syncing')}</span>
              </div>
            )}
          </div>
        </div>

        {/* KHỐI SẢN PHẨM ĐĂNG BÁN */}
        <div className='mt-12 space-y-5'>
          <h2 className='text-xl font-black text-slate-900 tracking-tight'>
            {t('products_title')}
          </h2>
          <ProductList productsResponse={productsResponse} />
        </div>
        <ReviewSection type="shop" id={shop.id} />
      </div>
    </div>
  );
}

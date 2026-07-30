'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from '@/i18n/navigation';
import {
  ArrowLeft,
  Star,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { IProductDetail } from '@/interface/IProduct';

interface ProductDetailClientProps {
  product: IProductDetail;
}

export default function ProductDetailClient({
  product,
}: ProductDetailClientProps) {
  const router = useRouter();
  const currentLang = useLocale();
  const t = useTranslations('product_detail');

  const [activeImage, setActiveImage] = useState<string>(product.image);

  const album = [product.image, ...(product.list_image || [])].filter(Boolean);

  const formattedPrice = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(product.price);

  return (
    <div className='bg-slate-50/50 min-h-screen pb-16 pt-6'>
      <div className='max-w-6xl mx-auto px-6 space-y-6'>
        {/* Nút quay lại */}
        <Button
          variant='ghost'
          onClick={() => router.back()}
          className='text-slate-600 hover:bg-slate-100 gap-2 rounded-xl'
        >
          <ArrowLeft className='w-4 h-4' />
          <span>{t('back_button')}</span>
        </Button>

        {/* Cụm thông tin mua bán chính: Ảnh + Giá cả hành động */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-8 bg-white border border-slate-200/80 rounded-3xl p-6 shadow-sm'>
          {/* KHỐI ẢNH (Bên trái) */}
          <div className='space-y-4'>
            {/* Ảnh lớn trung tâm */}
            <div className='relative w-full aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-slate-50'>
              <Image
                src={activeImage}
                alt={product.name}
                fill
                className='object-cover transition-all duration-300'
                unoptimized
              />
            </div>

            {/* Danh sách ảnh nhỏ chạy bên dưới (Album) */}
            {album.length > 1 && (
              <div className='flex gap-3 overflow-x-auto pb-1 scrollbar-none'>
                {album.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImage(imgUrl)}
                    className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 bg-slate-50 shrink-0 transition-all ${
                      activeImage === imgUrl
                        ? 'border-orange-500 scale-95 shadow-sm'
                        : 'border-slate-100 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name}-${idx}`}
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* KHỐI THÔNG TIN GIÁ CẢ & ĐẶT HÀNG (Bên phải) */}
          <div className='flex flex-col justify-between space-y-6'>
            <div className='space-y-4'>
              {product.is_featured && (
                <span className='inline-block bg-orange-50 text-orange-700 text-xs font-black px-2.5 py-1 rounded-lg border border-orange-100 uppercase tracking-wide'>
                  {t('featured_badge')}
                </span>
              )}

              <h1 className='text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight'>
                {product.name}
              </h1>

              {/* Giá tiền & Đơn vị tính */}
              <div className='bg-slate-50 rounded-2xl p-4 md:p-5 flex items-center justify-between border border-slate-100'>
                <div className='space-y-0.5'>
                  <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                    {t('price_label')}
                  </span>
                  <p className='text-2xl md:text-3xl font-black text-orange-600'>
                    {formattedPrice}
                  </p>
                </div>
                <div className='text-right'>
                  <span className='text-xs font-bold text-slate-400 uppercase tracking-wider'>
                    {t('unit_label')}
                  </span>
                  <p className='text-sm font-bold text-slate-700 bg-white border px-3 py-1 rounded-xl shadow-xs mt-1 uppercase'>
                    {product.unit}
                  </p>
                </div>
              </div>

              {/* Cam kết hệ thống tăng độ tin cậy */}
              <div className='space-y-3 pt-2 text-xs font-semibold text-slate-600'>
                <div className='flex items-center gap-2.5'>
                  <ShieldCheck className='w-4 h-4 text-green-600' />
                  <span>{t('policy_quality')}</span>
                </div>
                <div className='flex items-center gap-2.5'>
                  <Truck className='w-4 h-4 text-green-600' />
                  <span>{t('policy_shipping')}</span>
                </div>
              </div>
            </div>

            {/* Nút thêm vào giỏ / Mua hàng */}
            <div className='pt-4 border-t border-slate-100 grid grid-cols-1 gap-3'>
              <Button className='w-full h-12 bg-orange-600 hover:bg-orange-700 text-white font-bold text-base rounded-xl shadow-sm transition-all active:scale-[0.99]'>
                {t('buy_now_button')}
              </Button>
            </div>
          </div>
        </div>

        {/* Khối Thông tin Gian hàng sở hữu & Bài viết giới thiệu sản phẩm */}
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 items-start'>
          {/* Cột Trái: Chi tiết mô tả sản phẩm (Chiếm 2 phần) */}
          <div className='lg:col-span-2 bg-white border border-slate-200/80 rounded-3xl p-6 md:p-8 space-y-4 shadow-sm'>
            <h2 className='text-lg font-bold text-slate-900 border-b border-slate-100 pb-3'>
              {t('description_title')}
            </h2>
            <p className='text-slate-600 font-medium text-sm leading-relaxed whitespace-pre-line'>
              {product.description || t('no_description')}
            </p>
          </div>

          {/* Cột Phải: Thông tin tóm tắt về Shop chủ quản (Chiếm 1 phần) */}
          {product.shop && (
            <div className='bg-white border border-slate-200/80 rounded-3xl p-6 space-y-4 shadow-sm'>
              <h2 className='text-sm font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 pb-3'>
                {t('shop_section_title')}
              </h2>

              <div className='flex items-center gap-4'>
                {/* Logo Shop */}
                <div className='relative w-14 h-14 bg-slate-50 rounded-xl overflow-hidden border border-slate-100 shrink-0'>
                  {product.shop.logo_url ? (
                    <Image
                      src={product.shop.logo_url}
                      alt={product.shop.name}
                      fill
                      className='object-cover'
                      unoptimized
                    />
                  ) : (
                    <div className='w-full h-full flex items-center justify-center text-slate-400 bg-slate-100'>
                      <Store className='w-6 h-6' />
                    </div>
                  )}
                </div>

                {/* Tên & Điểm đánh giá shop */}
                <div className='space-y-1'>
                  <h3 className='font-bold text-slate-900 line-clamp-1 hover:text-orange-600 transition-colors'>
                    <Link href={`/market/${product.shop.slug}`}>
                      {product.shop.name}
                    </Link>
                  </h3>
                  <div className='flex items-center gap-1 text-xs font-bold bg-yellow-50 text-yellow-700 px-2 py-0.5 rounded-lg w-fit'>
                    <Star className='w-3 h-3 fill-yellow-500 text-yellow-500' />
                    <span>{product.shop.rating.toFixed(1)}</span>
                  </div>
                </div>
              </div>

              {/* Nút hành động với shop */}
              <div className='pt-2'>
                <Button
                  variant='outline'
                  asChild
                  className='w-full rounded-xl text-sm font-bold border-slate-200 hover:bg-slate-50 text-slate-700'
                >
                  <Link href={`/market/${product.shop.slug}`}>
                    {t('visit_shop_button')}
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

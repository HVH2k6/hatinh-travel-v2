import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  Star,
  MapPin,
  Phone,
  Eye,
  MessageSquare,
  ArrowRight,
  Store,
} from 'lucide-react';
import { IShop } from '@/interface/IShop';

interface ShopCardProps {
  shop: IShop;
}

export default function ShopCard({ shop }: ShopCardProps) {
  return (
    <div className='group relative flex flex-col bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300'>
      {/* 1. Phần hình ảnh Logo (Background hoặc Image tĩnh) */}
      <div className='relative w-full h-48 bg-slate-100 overflow-hidden'>
        {shop.logo_url ? (
          <Image
            src={shop.logo_url}
            alt={shop.name}
            fill
            className='object-cover group-hover:scale-105 transition-transform duration-500'
            unoptimized // Thêm thẻ này nếu dùng ảnh CDN ngoài (TikTok/Supabase)
          />
        ) : (
          // Placeholder nếu shop không có logo
          <div className='flex items-center justify-center w-full h-full bg-slate-200 text-slate-400'>
            <Store className='w-10 h-10' />
          </div>
        )}

        {/* Badge Số Đánh giá (Góc phải trên) */}
        <div className='absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm'>
          <Star className='w-3.5 h-3.5 text-yellow-500 fill-yellow-500' />
          <span className='text-xs font-bold text-slate-800'>
            {shop.rating.toFixed(1)}
          </span>
          <span className='text-xs text-slate-500'>({shop.total_reviews})</span>
        </div>
      </div>

      {/* 2. Phần Thông tin chi tiết */}
      <div className='flex flex-col flex-grow p-5 space-y-4'>
        {/* Tiêu đề & Lượt xem */}
        <div className='space-y-1'>
          <div className='flex items-start justify-between gap-2'>
            <h3 className='text-lg font-bold text-slate-900 line-clamp-1 group-hover:text-orange-600 transition-colors'>
              <Link
                href={`/market/${shop.slug}`}
                className='before:absolute before:inset-0'
              >
                {shop.name}
              </Link>
            </h3>
            <div className='flex items-center gap-1 text-slate-400 mt-1 shrink-0'>
              <Eye className='w-3.5 h-3.5' />
              <span className='text-xs font-medium'>{shop.views}</span>
            </div>
          </div>
        </div>

        {/* Thông tin liên hệ & Địa chỉ (Ngăn cách bằng vạch ngang mờ) */}
        <div className='pt-4 border-t border-slate-100 space-y-2.5'>
          {/* Địa chỉ */}
          <div className='flex items-start gap-2.5 text-slate-600'>
            <MapPin className='w-4 h-4 shrink-0 text-orange-500 mt-0.5' />
            <span className='text-sm line-clamp-1'>
              {shop.location.address_detail}, {shop.location.ward_name}
            </span>
          </div>

          {/* Điện thoại */}
          <div className='flex items-center gap-2.5 text-slate-600'>
            <Phone className='w-4 h-4 shrink-0 text-orange-500' />
            <span className='text-sm font-medium'>{shop.phone_number}</span>
          </div>
        </div>
      </div>

      {/* 3. Phần Footer (Nút hành động) */}
      <div className='p-5 pt-0 mt-auto'>
        <Link
          href={`/market/${shop.slug}`}
          className='flex items-center justify-center gap-2 w-full h-10 bg-slate-50 text-orange-600 font-semibold text-sm rounded-xl group-hover:bg-orange-600 group-hover:text-white transition-colors border border-slate-100 group-hover:border-orange-600'
        >
          <span>Vào Cửa Hàng</span>
          <ArrowRight className='w-4 h-4' />
        </Link>
      </div>
    </div>
  );
}

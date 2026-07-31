'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { IProduct } from '@/interface/IProduct';
import { formatCurrency } from '@/lib/format-currency';
import { useLocale } from 'next-intl';


interface ProductCardProps {
  product: IProduct;
}

export default function ProductCard({ product }: ProductCardProps) {
  const currentLocale = useLocale();
  // Định dạng giá tiền chuẩn Việt Nam VNĐ (Vd: 150.000 đ)
  const formattedPrice = formatCurrency(product.price, currentLocale);

  return (
    <div className="group relative bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col">

      {/* Khung ảnh sản phẩm */}
      <div className="relative w-full aspect-square bg-slate-50 overflow-hidden">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            unoptimized // Mượn CDN ngoài thì bật thuộc tính này
          />
        ) : (
          <div className="w-full h-full bg-slate-100 flex items-center justify-center text-slate-400 text-xs">
            No Image
          </div>
        )}

        {/* Badge nếu là sản phẩm nổi bật */}
        {product.is_featured && (
          <div className="absolute top-2 left-2 bg-orange-600 text-white text-[10px] font-black uppercase px-2 py-0.5 rounded-md shadow-sm">
            Nổi bật
          </div>
        )}
      </div>

      {/* Nội dung thông tin chữ */}
      <div className="p-4 flex flex-col flex-grow space-y-2">
        <h4 className="text-sm font-bold text-slate-900 line-clamp-2 h-10 group-hover:text-orange-600 transition-colors">
          <Link href={`/products/${product.slug}`} className="before:absolute before:inset-0">
            {product.name}
          </Link>
        </h4>

        {/* Khu vực hiển thị Giá & Đơn vị tính */}
        <div className="flex items-baseline justify-between gap-2 pt-1 mt-auto">
          <span className="text-base font-black text-orange-600">
            {formattedPrice}
          </span>
          <span className="text-[11px] font-bold text-slate-400 uppercase bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 shrink-0">
            {product.unit}
          </span>
        </div>
      </div>

    </div>
  );
}
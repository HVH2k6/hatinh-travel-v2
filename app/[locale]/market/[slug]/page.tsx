// app/[locale]/shops/[slug]/page.tsx

import React from 'react';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { IGetShopDetailResponse } from '@/interface/IShop';
import { IGetShopProductsResponse } from '@/interface/IProduct';
import ShopDetailClient from '@/models/market/shop-detail';



async function fetchShopDetail(slug: string, locale: string): Promise<IGetShopDetailResponse | null> {
  console.log("slug", slug)
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/shops/${slug}`, {
    headers: { 'Accept-Language': locale },
    next: { revalidate: 60 }
  });
  return res.ok ? res.json() : null;
}


async function fetchShopProducts(shopId: string, locale: string): Promise<IGetShopProductsResponse | null> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/shops/${shopId}/products?limit=8`, {
    headers: { 'Accept-Language': locale },
    next: { revalidate: 30 }
  });
  return res.ok ? res.json() : null;
}

export default async function ShopDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();

  // Bắt đầu lấy dữ liệu shop trước
  const shopRes = await fetchShopDetail(slug, locale);
  if (!shopRes || !shopRes.success || !shopRes.data) return notFound();

  // Có ID của shop rồi thì kéo nốt đống sản phẩm về
  const productsRes = await fetchShopProducts(shopRes.data.id, locale);

  return (
    <ShopDetailClient
      shop={shopRes.data}
      // Truyền cục response sản phẩm xuống Client Component
      productsResponse={productsRes || { success: false, message: '', data: { data: [] } } as any}
    />
  );
}
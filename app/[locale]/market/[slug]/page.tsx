// app/[locale]/shops/[slug]/page.tsx

import React from 'react';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { IGetShopDetailResponse } from '@/interface/IShop';
import { IGetShopProductsResponse } from '@/interface/IProduct';
import ShopDetailClient from '@/models/market/shop-detail';
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const shopRes = await fetchShopDetail(slug, locale);
  
  if (!shopRes || !shopRes.success || !shopRes.data) {
    return {
      title: 'Shop Not Found',
    };
  }

  const shop = shopRes.data;
  return {
    title: `${shop.name} | Hà Tĩnh Travel`,
    description: shop.description || (locale === 'en' ? 'Discover shops in Ha Tinh' : 'Khám phá cửa hàng tại Hà Tĩnh'),
    openGraph: {
      title: shop.name,
      description: shop.description || (locale === 'en' ? 'Discover shops in Ha Tinh' : 'Khám phá cửa hàng tại Hà Tĩnh'),
      images: shop.logo_url ? [{ url: shop.logo_url }] : [],
    }
  };
}

import prisma from '@/lib/prisma';

async function fetchShopDetail(slug: string, locale: string): Promise<any | null> {
  const shop = await prisma.shop.findFirst({
    where: {
      translations: { some: { slug: slug } },
      status: 'active'
    },
    include: {
      translations: true,
      address: {
        include: { translations: true, ward: true }
      }
    }
  });

  if (!shop) return null;

  prisma.shop.update({
    where: { id: shop.id },
    data: { views: { increment: 1 } }
  }).catch(console.error);

  const trans = shop.translations.find((t: any) => t.language_code === locale) || shop.translations[0];
  const addrTrans = shop.address?.translations.find((t: any) => t.language_code === locale) || shop.address?.translations[0];

  const reviewStats = await prisma.review.aggregate({
    where: {
      reviewable_type: { in: ['Shop', 'App\\Models\\Shop'] },
      reviewable_id: shop.id,
      is_approved: true
    },
    _avg: { rating: true },
    _count: { rating: true }
  });

  return {
    success: true,
    data: {
      id: shop.id,
      slug: trans?.slug || '',
      name: trans?.name || 'N/A',
      description: trans?.description || '',
      phone_number: shop.phone_number || '',
      contact_email: shop.contact_email || '',
      logo_url: shop.logo_url,
      cover_image_url: shop.cover_image_url,
      rating: reviewStats._avg.rating || 0,
      total_reviews: reviewStats._count.rating || 0,
      views: shop.views || 0,
      location: {
        address_detail: addrTrans?.detail || '',
        ward_name: shop.address?.ward?.name || '',
        map_url: shop.address?.map_url || null,
      },
      created_at: shop.created_at,
    }
  };
}

async function fetchShopProducts(shopId: string, locale: string): Promise<any | null> {
  const limit = 8;
  const products = await prisma.product.findMany({
    where: { shop_id: shopId, status: 'active' },
    orderBy: { created_at: 'desc' },
    take: limit,
    include: {
      translations: true,
      unit: { include: { translations: true } }
    }
  });
  
  const total = await prisma.product.count({
    where: { shop_id: shopId, status: 'active' }
  });

  const formattedData = products.map((item: any) => {
    const trans = item.translations?.find((t: any) => t.language_code === locale) || item.translations?.[0];
    const unitTrans = item.unit?.translations?.find((t: any) => t.language_code === locale) || item.unit?.translations?.[0];

    return {
      id: item.id,
      slug: trans?.slug || '',
      name: trans?.name || 'N/A',
      description: trans?.description || '',
      price: Number(item.price),
      image: item.image,
      list_image: typeof item.list_image === 'string' ? JSON.parse(item.list_image) : (item.list_image || []),
      is_featured: item.is_featured,
      unit: unitTrans?.name || '',
    };
  });

  return {
    success: true,
    data: {
      data: formattedData,
      total,
      current_page: 1,
      last_page: Math.ceil(total / limit)
    }
  };
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
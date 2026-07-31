import React from 'react';
import { getLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { IGetProductDetailResponse } from '@/interface/IProduct';
import ProductDetailClient from '@/models/product/product-detail';

interface PageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

import prisma from '@/lib/prisma';

async function fetchProductDetail(slug: string, locale: string): Promise<any | null> {
  const product = await prisma.product.findFirst({
    where: { translations: { some: { slug: slug } }, status: 'active' },
    include: {
      translations: true,
      unit: { include: { translations: true } },
      shop: { include: { translations: true } }
    }
  });

  if (!product) return null;

  prisma.product.update({
    where: { id: product.id },
    data: { views: { increment: 1 } }
  }).catch(console.error);

  const trans = product.translations.find((t: any) => t.language_code === locale) || product.translations[0];
  const unitTrans = product.unit?.translations.find((t: any) => t.language_code === locale) || product.unit?.translations[0];
  
  let shopData = null;
  if (product.shop) {
    const shopTrans = product.shop.translations.find((t: any) => t.language_code === locale) || product.shop.translations[0];
    shopData = {
      id: product.shop.id,
      slug: shopTrans?.slug || '',
      name: shopTrans?.name || 'N/A',
      logo_url: product.shop.logo_url,
    };
  }

  return {
    success: true,
    data: {
      id: product.id,
      shop_id: product.shop_id,
      slug: trans?.slug || '',
      name: trans?.name || 'N/A',
      description: trans?.description || '',
      price: Number(product.price),
      image: product.image,
      list_image: typeof product.list_image === 'string' ? JSON.parse(product.list_image) : (product.list_image || []),
      is_featured: product.is_featured,
      views: product.views || 0,
      unit: unitTrans?.name || '',
      shop: shopData,
      created_at: product.created_at,
    }
  };
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const locale = await getLocale();

  const response = await fetchProductDetail(slug, locale);

  if (!response || !response.success || !response.data) {
    notFound();
  }

  return <ProductDetailClient product={response.data} />;
}

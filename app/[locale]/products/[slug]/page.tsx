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

async function fetchProductDetail(
  idOrSlug: string,
  locale: string,
): Promise<IGetProductDetailResponse | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/products/${idOrSlug}`,
      {
        method: 'GET',
        headers: {
          'Accept-Language': locale,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 30 }, // Tự động tối ưu cache cập nhật sau mỗi 30 giây
      },
    );

    if (!res.ok) {
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error('Lỗi khi fetch chi tiết sản phẩm:', error);
    return null;
  }
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

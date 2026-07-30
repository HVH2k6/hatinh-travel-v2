'use client';

import ProductCard from '@/components/cards/product-card';
import { IGetShopProductsResponse } from '@/interface/IProduct';
import React from 'react';

interface ProductListProps {
  productsResponse: IGetShopProductsResponse;
}

export default function ProductList({ productsResponse }: ProductListProps) {
  const products = productsResponse?.data?.data || [];

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-slate-400 border border-dashed rounded-2xl bg-white">
        <p className="text-sm font-medium">Gian hàng chưa cập nhật sản phẩm nào.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Lưới Grid hiển thị danh sách sản phẩm */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
      
      {/* Phân trang đơn giản */}
      {productsResponse.data.last_page > 1 && (
        <div className="text-center text-xs font-semibold text-slate-400 pt-4">
          Trang {productsResponse.data.current_page} / {productsResponse.data.last_page}
        </div>
      )}
    </div>
  );
}
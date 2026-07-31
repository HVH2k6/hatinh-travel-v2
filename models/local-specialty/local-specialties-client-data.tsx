"use client";

import React, { useState, useEffect } from 'react';
import { LocalSpecialtyCard } from '@/components/cards/local-specicalty-card';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function LocalSpecialtiesClientData() {
  const locale = useLocale();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/client/local-specialties?page=${page}&limit=20&lang=${locale}`);
        const result = await res.json();

        if (result.success) {
          const formattedData = result.data.map((item: any) => {
            const translation = item.translations?.[0];
            const catTrans = item.category?.translations?.[0];
            const unitTrans = item.unit?.translations?.[0];
            const addrTrans = item.address?.translations?.[0];

            return {
              id: item.id,
              image: item.image,
              name: translation?.name || '',
              slug: translation?.slug || '',
              description: translation?.description || '',
              ingredients: translation?.ingredients || null,
              price: item.price ? Number(item.price) : 0,
              views: item.views || 0,
              category: catTrans ? { id: item.category_id!, name: catTrans.name } : null,
              unit: unitTrans?.name || null,
              address: {
                ward: item.address?.ward?.name || null,
                district: item.address?.ward?.district_name || null,
                address_detail: addrTrans?.detail || '',
                map_url: item.address?.map_url || null,
              },
              is_featured: item.is_featured || false,
              view_count: item.views || 0,
              created_at: item.created_at,
            };
          });
          
          setData(formattedData);
          setTotalPages(result.pagination.last_page);
        }
      } catch (error) {
        console.error('Error fetching local specialties:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [page, locale]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <p className='text-sm text-slate-400 font-medium py-4 text-center'>
        Không có đặc sản địa phương nào hiển thị.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((item) => (
          <LocalSpecialtyCard key={item.id} item={item} />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
          >
            Trang trước
          </button>
          <span className="flex items-center px-4 py-2 font-medium text-slate-700">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-white border border-slate-200 rounded-md disabled:opacity-50 hover:bg-slate-50 transition-colors"
          >
            Trang sau
          </button>
        </div>
      )}
    </div>
  );
}

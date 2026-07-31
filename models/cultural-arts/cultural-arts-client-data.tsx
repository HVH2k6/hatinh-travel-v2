"use client";

import React, { useState, useEffect } from 'react';
import { CulturalArtCard } from '@/components/cards/cultural-art-card';
import { CulturalArt } from '@/interface/ICulturalArt';
import { Loader2 } from 'lucide-react';
import { useLocale } from 'next-intl';

export default function CulturalArtsClientData() {
  const locale = useLocale();
  const [data, setData] = useState<CulturalArt[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/client/cultural-arts?page=${page}&limit=20&lang=${locale}`);
        const result = await res.json();

        if (result.success) {
          const formattedData: CulturalArt[] = result.data.map((art: any) => {
            const translation = art.translations[0];
            const catTrans = art.category?.translations?.[0];
            const addrTrans = art.address?.translations?.[0];

            return {
              id: art.id,
              image: art.image,
              list_image: art.list_image,
              link_video: art.link_video,
              name: translation?.name || '',
              slug: translation?.slug || '',
              description: translation?.description || '',
              is_featured: art.is_featured || false,
              views: art.views || 0,
              position: art.position || 0,
              category: catTrans ? { id: art.category_id!, name: catTrans.name } : null,
              address: {
                ward: art.address?.ward?.name || null,
                address_detail: addrTrans?.detail || '',
                map_url: art.address?.map_url || null,
              },
              created_at: art.created_at,
            };
          });
          
          setData(formattedData);
          setTotalPages(result.pagination.last_page);
        }
      } catch (error) {
        console.error('Error fetching cultural arts:', error);
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
        Không có thông tin văn hóa nghệ thuật nào hiển thị.
      </p>
    );
  }

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {data.map((art) => (
          <CulturalArtCard key={art.id} item={art} />
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

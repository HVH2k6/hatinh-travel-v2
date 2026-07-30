import React from 'react';
import LocalSpecialtiesClientData from '@/models/local-specialty/local-specialties-client-data';
import { getTranslations } from 'next-intl/server';

export default async function LocalSpecialtiesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations('home');

  return (
    <div className="bg-slate-50/30 min-h-screen pt-24 pb-16">
      <div className="container mx-auto px-4 lg:px-8 space-y-8">
        <div className="space-y-1.5">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            Đặc sản địa phương
          </h1>
          <div className="h-1 w-16 bg-orange-500 rounded-full" />
          <p className="text-slate-500 text-sm md:text-base mt-2">
            Thưởng thức những món ăn và sản vật đậm đà hương vị miền Trung.
          </p>
        </div>
        
        <LocalSpecialtiesClientData />
      </div>
    </div>
  );
}

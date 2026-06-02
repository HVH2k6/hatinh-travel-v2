import { HeroSection } from "@/components/sections/hero-section";
import AttractionData from "@/models/attractions/AttractionData";

import { getTranslations } from "next-intl/server";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  // 1. Mở gói params bất đồng bộ chuẩn Next.js 15
  const { locale } = await params; 
  const titleAttraction = await getTranslations("home.title");


  return (
    <>
      
      <HeroSection />
      
      {/* Phần thân nội dung danh sách địa điểm */}
      <div className="container mx-auto py-16 px-4 lg:px-8 space-y-8">
        
        {/* Tiêu đề vùng địa điểm */}
        <div className="space-y-1">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {titleAttraction("attraction")}
          </h2>
          <div className="h-1 w-16 bg-orange-500 rounded-full" />
        </div>

        {/* 3. Gọi component xử lý dữ liệu ngầm và render giao diện */}
        <AttractionData locale={locale} />
        
      </div>
    </>
  );
}
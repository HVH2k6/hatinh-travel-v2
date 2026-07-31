"use client"

import * as React from "react"
import { MapPin, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { TouristAttraction } from "@/interface/IAttraction"
// 1. IMPORT HOOK ĐA NGÔN NGỮ
import { useTranslations } from "next-intl"

interface AttractionCardProps {
  item: TouristAttraction;
}

export function AttractionCard({ item }: AttractionCardProps) {
  // 2. KHỞI TẠO HOOK ĐỂ TRỎ VÀO NHÁNH "attraction" TRONG FILE JSON
  const t = useTranslations("card.attraction")
  
  const fallbackImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop"
  
  return (
    <Link href={`/tourist-attractions/${item.slug}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col rounded-2xl cursor-pointer">
        
        {/* Khung ảnh bìa */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          <img
            src={item.image || fallbackImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          />
          
          {(item.type || item.category) && (
            <span className="absolute top-3 left-3 z-10 bg-slate-900/80 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-md tracking-wider uppercase">
              {item.type || item.category}
            </span>
          )}
        </div>

        {/* Nội dung thông tin rút gọn */}
        <CardContent className="p-4 flex flex-col justify-between flex-grow gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800 line-clamp-1 group-hover:text-orange-600 transition-colors duration-200">
              {item.name}
            </h3>

            <div className="flex items-center gap-1 text-xs font-medium text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span className="line-clamp-1">
                {item.address.address_detail || item.address.ward}
              </span>
            </div>
          </div>

          {/* Hiệu ứng mũi tên khi hover */}
          <div className="flex items-center justify-end text-xs font-bold text-orange-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
            {/* 3. THAY CHỮ CỨNG THÀNH BIẾN ĐA NGÔN NGỮ */}
            <span className="mr-1">{t("explore")}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </div>
        </CardContent>

      </Card>
    </Link>
  )
}
"use client"

import * as React from "react"
import { Eye, CalendarDays, User, ArrowRight } from "lucide-react"
import { Link } from "@/i18n/navigation"
import { Card, CardContent } from "@/components/ui/card"

interface Prop {
  item: {
    id: string;
    name: string;
    slug: string;
    image: string;
    author: string | null;
    views: number;
    created_at: Date;
  };
}

export function BlogCard({ item }: Prop) {
  const fallbackImage = "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=500&auto=format&fit=crop"

  return (
    <Link href={`/blog/${item.slug}`} className="block h-full group">
      <Card className="h-full overflow-hidden border-slate-100 bg-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col rounded-2xl cursor-pointer">
        
        {/* Khung ảnh bìa */}
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          <img
            src={item.image || fallbackImage}
            alt={item.name}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500 ease-out"
          />
        </div>

        {/* Nội dung thông tin rút gọn */}
        <CardContent className="p-4 flex flex-col justify-between flex-grow gap-4">
          <div className="space-y-2">
            <h3 className="text-base font-bold text-slate-800 line-clamp-2 group-hover:text-orange-600 transition-colors duration-200 leading-tight">
              {item.name}
            </h3>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-slate-500">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="line-clamp-1">{item.author || "Ẩn danh"}</span>
              </div>
              <div className="flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                <span>{new Date(item.created_at).toLocaleDateString('vi-VN')}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-2 border-t border-slate-100 pt-3">
            <div className="flex items-center gap-1 text-xs font-bold text-slate-400">
              <Eye className="h-3.5 w-3.5" />
              <span>{item.views}</span>
            </div>

            {/* Hiệu ứng mũi tên khi hover */}
            <div className="flex items-center justify-end text-xs font-bold text-orange-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
              <span className="mr-1">Đọc tiếp</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

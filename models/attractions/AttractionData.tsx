import React from 'react';
import { AttractionCard } from '@/components/cards/attraction-card';
import { AttractionApiResponse } from '@/interface/IAttraction';
// Import các interface

interface AttractionDataProps {
  locale: string; // Đổi tên prop từ params thành locale cho tường minh
}

export default async function AttractionData({ locale }: AttractionDataProps) {
  try {
    // Gọi API từ Laravel với lang động theo ngôn ngữ hệ thống
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_URL}/tourist-attractions?sort_by=views_desc&limit=8&lang=${locale}`,
      {
        // Tối ưu hóa: Next.js tự động cache, hoặc bạn có thể đặt thời gian revalidate nếu cần
        cache: 'no-cache',
      },
    );

    if (!res.ok) throw new Error('Không thể kết nối đến máy chủ API');

    // Ép kiểu dữ liệu JSON trả về theo Interface tổng
    const json: AttractionApiResponse = await res.json();
    const attractions = json.data || [];

    if (attractions.length === 0) {
      return (
        <p className='text-sm text-slate-400'>
          Không có địa điểm nào hiển thị.
        </p>
      );
    }

    return (
      /* Cấu trúc Grid phân bổ đều 8 địa điểm thành 2 hàng, mỗi hàng 4 cột trên PC */
      <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6'>
        {attractions.map((item: any) => (
          <AttractionCard key={item.id} item={item} />
        ))}
      </div>
    );
  } catch (error) {
    console.error('Lỗi lấy dữ liệu điểm du lịch:', error);
    return (
      <div className='p-4 border border-red-100 bg-red-50 text-red-600 rounded-xl text-sm'>
        Đã xảy ra lỗi khi tải danh sách địa điểm du lịch. Vui lòng thử lại sau.
      </div>
    );
  }
}

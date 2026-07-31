'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { MessageSquare, Star } from 'lucide-react';
import { useLocale } from 'next-intl';
import { Button } from '@/components/ui/button';
import { IReview } from '@/interface/IReview';
import ReviewForm from './review-form';
import ReviewItem from './review-item';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';

interface ReviewSectionProps {
  type: 'product' | 'shop' | 'location' | 'local-specialty' | 'cultural-art';
  id: string;
}

export default function ReviewSection({ type, id }: ReviewSectionProps) {
  const router = useRouter();
  const currentLang = useLocale();
  const { user } = useAuth();
  const [reviews, setReviews] = useState<IReview[]>([]);
  const [activeRatingFilter, setActiveRatingFilter] = useState<number | null>(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingReview, setEditingReview] = useState<IReview | null>(null);

  // Hàm fetch danh sách review từ API route ẩn
  const fetchReviewsList = useCallback(
    async (page: number, ratingFilter: number | null) => {
      setLoading(true);
      try {
        let url = `/api/reviews?type=${type}&id=${id}&page=${page}&limit=10`;
        if (ratingFilter !== null) {
          url += `&rating=${ratingFilter}`;
        }

        const res = await fetch(url, {
          headers: { 'Accept-Language': currentLang },
        });
        const json = await res.json();

        if (json.success && json.data) {
          setReviews((prevReviews) =>
            page === 1 ? json.data.data : [...prevReviews, ...json.data.data]
          );
          setCurrentPage(json.data.current_page);
          setLastPage(json.data.last_page);
        }
      } catch (err) {
        console.error('Lỗi lấy danh sách review:', err);
      } finally {
        setLoading(false);
      }
    },
    [type, id, currentLang],
  );

  // Khởi chạy khi mount hoặc thay đổi bộ lọc sao
  useEffect(() => {
    fetchReviewsList(1, activeRatingFilter);
  }, [activeRatingFilter, fetchReviewsList]);

  const handleDeleteSuccess = (id: string) => {
    setReviews((prev) => prev.filter((item) => item.id !== id));
  };

  // Xử lý khi Gửi mới HOẶC Cập nhật thành công
  const handleReviewSuccess = (responseData: any) => {
    if (editingReview) {
      // TRƯỜNG HỢP: Vừa SỬA xong -> Cập nhật lại bài đó trong mảng state
      setReviews((prev) =>
        prev.map((item) =>
          item.id === editingReview.id
            ? {
                ...item,
                rating: responseData.rating,
                review_content: responseData.review_content,
                list_image: responseData.list_image || [],
              }
            : item,
        ),
      );
      setEditingReview(null);
      setShowForm(false);
    } else {
      fetchReviewsList(1, activeRatingFilter);
      setShowForm(false);
    }
  };

  const handleFilterClick = (rating: number | null) => {
    setActiveRatingFilter(rating);
  };

  return (
    <div className='space-y-6'>
      {/* Thanh công cụ Header bộ lọc */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4'>
        <div className='flex items-center gap-2'>
          <MessageSquare className='w-5 h-5 text-orange-600' />
          <h3 className='text-xl font-black text-slate-900 tracking-tight'>
            Đánh giá từ cộng đồng
          </h3>
        </div>

        <Button
          onClick={() => {
            setShowForm(!showForm);
            if (showForm) setEditingReview(null); // Đóng form thì reset trạng thái sửa
          }}
          className='bg-slate-900 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-sm px-5 self-start sm:self-auto'
        >
          {showForm ? 'Đóng khung viết' : 'Viết đánh giá'}
        </Button>
      </div>

      {/* Hiển thị Form nếu bấm mở */}
      {showForm && (
        <ReviewForm
          type={type}
          id={id}
          editData={editingReview} // ✅ FIX QUAN TRỌNG: Phải truyền prop này để form nhận data cũ khi sửa
          onSuccess={handleReviewSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingReview(null);
          }}
        />
      )}

      {/* Hệ thống các Tab bộ lọc số sao */}
      <div className='flex flex-wrap items-center gap-2 bg-slate-50 p-1.5 rounded-xl border border-slate-200/40 w-fit'>
        <button
          onClick={() => handleFilterClick(null)}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            activeRatingFilter === null
              ? 'bg-white text-slate-950 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Tất cả
        </button>
        {[5, 4, 3, 2, 1].map((star) => (
          <button
            key={star}
            onClick={() => handleFilterClick(star)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1 transition-all cursor-pointer ${
              activeRatingFilter === star
                ? 'bg-white text-slate-950 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <span>{star}</span>
            <Star className='w-3 h-3 fill-amber-500 text-amber-500' />
          </button>
        ))}
      </div>

      {/* Danh sách bài Review */}
      <div className='space-y-4'>
        {reviews.map((review) => (
          <div 
            key={review.id}
            // ✅ ĐỔI UI TẠI ĐÂY: Nếu bài viết được ghim (pin === true), 
            // thêm viền vàng hổ phách bao bọc lớp div ngoài cùng để tăng tính nhận diện
            className={review.pin ? 'rounded-2xl border border-amber-200 shadow-xs bg-amber-50/10' : ''}
          >
            <ReviewItem
              review={review}
              currentUserId={user?.id}
              onDeleteSuccess={handleDeleteSuccess}
              onUpdateClick={(rev) => {
                setEditingReview(rev);
                setShowForm(true);
                // Cuộn mượt lên vị trí form chỉnh sửa
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          </div>
        ))}
      </div>

      {/* Nút Xem thêm (Load More) */}
      {currentPage < lastPage && (
        <div className='flex justify-center pt-4'>
          <Button
            variant='outline'
            onClick={() => fetchReviewsList(currentPage + 1, activeRatingFilter)}
            disabled={loading}
            className='rounded-xl border-slate-200 text-slate-700 font-bold px-8'
          >
            {loading ? 'Đang tải...' : 'Xem thêm đánh giá'}
          </Button>
        </div>
      )}
    </div>
  );
}
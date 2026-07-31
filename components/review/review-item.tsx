'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Pin, CornerDownRight, X, ChevronLeft, ChevronRight, Trash2, Edit2 } from 'lucide-react';
import { IReview } from '@/interface/IReview';
import { Button } from '@/components/ui/button';

interface ReviewItemProps {
  review: IReview;
  currentUserId?: string; // Truyền thêm ID user đang đăng nhập từ Session/Context nếu có để check chính chủ
  onDeleteSuccess?: (id: string) => void; // Callback để xóa bài khỏi mảng state ở UI cha
  onUpdateClick?: (review: IReview) => void; // Kích hoạt mở modal hoặc đổ dữ liệu lên form sửa
}

export default function ReviewItem({ review, currentUserId, onDeleteSuccess, onUpdateClick }: ReviewItemProps) {
  const [activeImgIdx, setActiveImgIdx] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const images = review.list_image || [];
  
  // Kiểm tra xem bài đánh giá này có phải của người đang xem không để hiện nút Sửa/Xóa
  const isOwner = currentUserId && review.user?.id === currentUserId;

  // Điều khiển phím bấm Gallery
  useEffect(() => {
    if (activeImgIdx === null) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveImgIdx(null);
      if (e.key === 'ArrowRight') handleNextImg();
      if (e.key === 'ArrowLeft') handlePrevImg();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeImgIdx]);

  const handleNextImg = () => {
    if (activeImgIdx === null) return;
    setActiveImgIdx((prev) => (prev !== null && prev < images.length - 1 ? prev + 1 : 0));
  };

  const handlePrevImg = () => {
    if (activeImgIdx === null) return;
    setActiveImgIdx((prev) => (prev !== null && prev > 0 ? prev - 1 : images.length - 1));
  };

  // Logic gọi API xóa trung chuyển sang Laravel
  const handleDelete = async () => {
    if (!confirm('Sếp có chắc chắn muốn xóa bài đánh giá này không?')) return;
    
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/reviews/${review.id}/delete`, {
        method: 'DELETE',
      });
      const json = await res.json();
      
      if (json.success) {
        if (onDeleteSuccess) onDeleteSuccess(review.id);
      } else {
        alert(json.message || 'Xóa thất bại.');
      }
    } catch (err) {
      console.error(err);
      alert('Lỗi kết nối hệ thống.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={`p-5 rounded-2xl border transition-all ${
      review.pin 
        ? 'bg-amber-50/40 border-amber-200/70 shadow-xs' 
        : 'bg-white border-slate-100 shadow-xs'
    }`}>
      
      
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="relative w-10 h-10 rounded-full overflow-hidden bg-slate-100 border border-slate-100 shrink-0">
            <Image
              src={review.user.avatar_url}
              alt={review.user.name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
          <div>
            <h5 className="text-sm font-bold text-slate-900">{review.user.name}</h5>
            <div className="flex items-center gap-2 mt-0.5">
              <div className="flex items-center">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <Star
                    key={idx}
                    className={`w-3.5 h-3.5 ${
                      idx < review.rating 
                        ? 'text-yellow-500 fill-yellow-500' 
                        : 'text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[11px] font-medium text-slate-400">{review.created_at}</span>
            </div>
          </div>
        </div>

        
        <div className="flex items-center gap-1.5">
          {review.pin && (
            <div className="flex items-center gap-1 bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-md border border-amber-200 mr-1.5">
              <Pin className="w-3 h-3 fill-amber-700 text-amber-700" />
              
            </div>
          )}

          
          {isOwner && onDeleteSuccess && (
            <div className="flex items-center gap-1 opacity-60 hover:opacity-100 transition-opacity">
              {onUpdateClick && (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="w-7 h-7 rounded-lg text-slate-500 hover:text-slate-900"
                  onClick={() => onUpdateClick(review)}
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </Button>
              )}
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                disabled={isDeleting}
                className="w-7 h-7 rounded-lg text-red-500 hover:bg-red-50"
                onClick={handleDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          )}
        </div>
      </div>

      
      <div className="mt-3 pl-1">
        <p className="text-sm text-slate-700 font-medium leading-relaxed whitespace-pre-line">
          {review.review_content}
        </p>

        
        {images.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {images.map((imgUrl, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setActiveImgIdx(idx)}
                className="relative w-16 h-16 rounded-xl overflow-hidden border border-slate-100 bg-slate-50 shrink-0 group/img active:scale-95 transition-all cursor-zoom-in"
              >
                <Image
                  src={imgUrl}
                  alt={`review-attachment-${idx}`}
                  fill
                  className="object-cover group-hover/img:scale-105 transition-transform"
                  unoptimized
                />
              </button>
            ))}
          </div>
        )}
      </div>

      
      {review.reply_message && (
        <div className="mt-4 ml-4 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-start gap-3">
          <CornerDownRight className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 bg-slate-200/70 px-1.5 py-0.5 rounded-md">
                Phản hồi của hệ thống
              </span>
            </div>
            <p className="text-sm text-slate-600 font-medium leading-relaxed">
              {review.reply_message}
            </p>
          </div>
        </div>
      )}

      
      
      
      {activeImgIdx !== null && (
        <div 
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center select-none animate-in fade-in duration-200"
          onClick={() => setActiveImgIdx(null)}
        >
          <button
            type="button"
            onClick={() => setActiveImgIdx(null)}
            className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-2.5 rounded-full transition-all z-50 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div 
            className="relative max-w-4xl w-[90vw] h-[75vh] mx-auto flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={images[activeImgIdx]}
              alt={`gallery-active-${activeImgIdx}`}
              fill
              className="object-contain animate-in zoom-in-95 duration-200"
              unoptimized
            />
          </div>

          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handlePrevImg(); }}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 cursor-pointer"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleNextImg(); }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 p-3 rounded-full transition-all z-50 cursor-pointer"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white/10 text-white text-xs font-bold px-3 py-1.5 rounded-full backdrop-blur-md">
                {activeImgIdx + 1} / {images.length}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
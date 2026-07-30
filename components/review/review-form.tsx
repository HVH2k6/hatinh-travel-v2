'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import InputUploadSingleFile from '../input/input-image-upload';
import { useTranslations } from 'next-intl'; // Import hook đa ngôn ngữ

const reviewFormSchema = z.object({
  rating: z
    .number()
    .min(1, { message: 'Vui lòng chọn số sao đánh giá' })
    .max(5),
  review_content: z
    .string()
    .min(5, { message: 'Nội dung đánh giá phải có ít nhất 5 ký tự' })
    .max(1000),
  img1: z.string().optional(),
  img2: z.string().optional(),
  img3: z.string().optional(),
  img4: z.string().optional(),
  img5: z.string().optional(),
});

type ReviewFormValues = z.infer<typeof reviewFormSchema>;

interface ReviewFormProps {
  type: 'product' | 'shop' | 'location';
  id: string;
  editData?: any; // ✅ NHẬN THÊM DATA SỬA: Bắn dữ liệu bài cần sửa từ lớp cha vào đây
  onSuccess: (newOrUpdatedReview: any) => void;
  onCancel?: () => void;
}

export default function ReviewForm({
  type,
  id,
  editData,
  onSuccess,
  onCancel,
}: ReviewFormProps) {
  const [loading, setLoading] = useState(false);
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);
  const t = useTranslations('review_form'); // Đăng ký namespace đa ngôn ngữ

  const form = useForm<ReviewFormValues>({
    resolver: zodResolver(reviewFormSchema),
    defaultValues: {
      rating: 5,
      review_content: '',
      img1: '',
      img2: '',
      img3: '',
      img4: '',
      img5: '',
    },
  });

  // ✅ THEO DÕI ĐỘNG: Nếu editData thay đổi (khi bấm nút Sửa), lập tức nạp dữ liệu cũ vào các ô input
  useEffect(() => {
    if (editData) {
      form.reset({
        rating: editData.rating,
        review_content: editData.review_content || '',
        img1: editData.list_image?.[0] || '',
        img2: editData.list_image?.[1] || '',
        img3: editData.list_image?.[2] || '',
        img4: editData.list_image?.[3] || '',
        img5: editData.list_image?.[4] || '',
      });
    } else {
      form.reset({
        rating: 5,
        review_content: '',
        img1: '',
        img2: '',
        img3: '',
        img4: '',
        img5: '',
      });
    }
  }, [editData, form]);

  const onSubmit = async (values: ReviewFormValues) => {
    setLoading(true);
    try {
      const imagesArray = [
        values.img1,
        values.img2,
        values.img3,
        values.img4,
        values.img5,
      ].filter(Boolean);
      const list_image_string = imagesArray.join(',');

      // ✅ TỰ ĐỘNG PHÂN TÁCH ENDPOINT: Sửa thì gọi PUT kèm ID bài, Thêm mới thì gọi POST store
      const apiUrl = editData ? `/api/reviews/${editData.id}/update` : '/api/reviews/store';
      const apiMethod = editData ? 'PUT' : 'POST';

      const response = await fetch(apiUrl, {
        method: apiMethod,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          id,
          rating: values.rating,
          review_content: values.review_content,
          list_image: list_image_string,
        }),
      });

      const json = await response.json();
      if (json.success) {
        form.reset();
        onSuccess(json.data); // Trả data về cho ReviewSection điều phối mượt mà
      } else {
        alert(json.message);
      }
    } catch (err) {
      console.error('Lỗi submit review:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={form.handleSubmit(onSubmit)}
      className='p-6 bg-white rounded-2xl border border-slate-200/80 space-y-5 shadow-xs'
    >
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4'>
        <div>
          {/* Tiêu đề thay đổi động theo chế độ Thêm / Sửa */}
          <h4 className='font-black text-slate-900 tracking-tight text-base'>
            {editData ? t('edit_title') : t('create_title')}
          </h4>
          <p className='text-xs text-slate-500 font-medium'>
            {t('subtitle')}
          </p>
        </div>

        {/* Khối chọn số sao tương tác động */}
        <Controller
          name='rating'
          control={form.control}
          render={({ field }) => (
            <div className='flex items-center gap-1'>
              {Array.from({ length: 5 }).map((_, idx) => {
                const starValue = idx + 1;
                return (
                  <button
                    type='button'
                    key={idx}
                    onClick={() => field.onChange(starValue)}
                    onMouseEnter={() => setHoveredRating(starValue)}
                    onMouseLeave={() => setHoveredRating(null)}
                    className='p-0.5 transition-transform active:scale-95 cursor-pointer text-slate-200'
                  >
                    <Star
                      className={`w-6 h-6 transition-colors ${
                        starValue <= (hoveredRating ?? field.value)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-slate-200'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          )}
        />
      </div>

      <FieldGroup className='space-y-4'>
        {/* Ô nhập Content */}
        <Controller
          name='review_content'
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid} className='space-y-1.5'>
              <FieldLabel className='text-xs font-bold text-slate-700 uppercase'>
                {t('content_label')} *
              </FieldLabel>
              <Textarea
                {...field}
                placeholder={t('placeholder')}
                disabled={loading}
                className='bg-white resize-none h-24 rounded-xl border-slate-200'
              />
              {fieldState.invalid && (
                <FieldError
                  errors={[fieldState.error]}
                  className='text-xs font-bold text-red-500'
                />
              )}
            </Field>
          )}
        />

        {/* Khối Upload tối đa 5 ảnh phụ đính kèm */}
        <div className='space-y-2'>
          <span className='text-xs font-bold text-slate-700 uppercase block'>
            {t('image_label')}
          </span>
          <div className='flex flex-wrap gap-4 pt-1'>
            <InputUploadSingleFile name='img1' control={form.control} />
            <InputUploadSingleFile name='img2' control={form.control} />
            <InputUploadSingleFile name='img3' control={form.control} />
            <InputUploadSingleFile name='img4' control={form.control} />
            <InputUploadSingleFile name='img5' control={form.control} />
          </div>
        </div>
      </FieldGroup>

      {/* Nút hành động */}
      <div className='flex items-center justify-end gap-2 pt-2 border-t border-slate-100'>
        {onCancel && (
          <Button
            type='button'
            variant='ghost'
            onClick={onCancel}
            disabled={loading}
            className='rounded-xl font-bold text-sm'
          >
            {t('cancel_button')}
          </Button>
        )}
        <Button
          type='submit'
          disabled={loading}
          className='bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl gap-2 shadow-sm px-5'
        >
          {loading ? (
            <Loader2 className='w-4 h-4 animate-spin' />
          ) : (
            <Send className='w-4 h-4' />
          )}
          <span>{editData ? t('submit_edit_button') : t('submit_create_button')}</span>
        </Button>
      </div>
    </form>
  );
}
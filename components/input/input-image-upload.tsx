'use client';

import React, { useState } from 'react';
import { Trash2, Loader2, UploadCloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Image from 'next/image';
import axios from 'axios';
import { Label } from '../ui/label';

// IMPORT THÊM FieldValues và Path từ react-hook-form
import { Control, Controller, FieldValues, Path } from 'react-hook-form';

// SỬ DỤNG GENERIC TYPE <T> ĐỂ BẮT KIỂU ĐỘNG TỪ COMPONENT CHA
interface UploadImageProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  initialImageUrl?: string;
}

const InputUploadSingleFile = <T extends FieldValues>({
  name,
  control,
  initialImageUrl, // (Tùy chọn) Có thể dùng để hiển thị ảnh mặc định nếu cần
}: UploadImageProps<T>) => {
  const [loading, setLoading] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const { value, onChange } = field;
        const error = fieldState.error;

        const handleUpload = async (file: File) => {
          const formData = new FormData();

          formData.append('file', file);
          formData.append('name', file.name);

          setLoading(true);
          try {
            // Sửa URL này nếu API route của bạn có tên khác (ví dụ: /api/upload)
            const res = await axios.post(`https://anhviafb.com/api/v1/image-upload`, formData);
            console.log(res.data);
            // Xử lý dựa theo cấu trúc json backend trả về
            if (res.data && res.data.success && res.data.image_url) {
              onChange(res.data.image_url); // Đẩy URL của TikTok CDN vào form
            } else {
              console.error('API Error:', res.data.message);
              alert(res.data.message || 'Lỗi từ server khi upload ảnh.');
            }
          } catch (err: any) {
            console.error('Upload failed:', err);
            // Bắt lỗi HTTP 400, 500 từ Next.js Response
            const errorMsg = err.response?.data?.message || 'Lỗi kết nối đến máy chủ upload.';
            alert(errorMsg);
          } finally {
            setLoading(false);
          }
        };

        const handleRemove = () => {
          onChange(''); // Reset giá trị trong form về chuỗi rỗng
        };

        return (
          <div className="space-y-3 w-60">
            <Input
              type="file"
              id={`file-${name}`}
              accept="image/*"
              hidden
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleUpload(file);

                // Reset value của input file để có thể chọn lại chính file đó nếu vừa xóa
                e.target.value = '';
              }}
            />

            {!value && !loading && (
              <Label
                htmlFor={`file-${name}`}
                className={`cursor-pointer w-full h-32 border-2 border-dashed rounded-xl flex flex-col items-center justify-center transition-colors shadow-sm
                  ${error ? 'border-red-400 bg-red-50 hover:bg-red-100' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}
                `}
              >
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <UploadCloud className="w-8 h-8" />
                  <span className="text-sm font-medium">Nhấn để tải ảnh lên</span>
                </div>
              </Label>
            )}

            {value && !loading && (
              <div className="relative w-full h-60 border rounded-xl overflow-hidden group shadow-sm bg-slate-50/50">
                <label htmlFor={`file-${name}`}>
                  <Image
                    src={value}
                    alt="Uploaded image"
                    fill
                    className="object-cover cursor-pointer hover:scale-105 transition-transform duration-300"
                    unoptimized // Bắt buộc phải có để Next/Image cho phép hiển thị ảnh từ CDN ngoài (TikTok) mà không bị lỗi hostname
                  />
                </label>

                <Button
                  type="button"
                  size="icon"
                  variant="destructive"
                  className="absolute top-2 right-2 z-10 cursor-pointer shadow-md"
                  onClick={handleRemove}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            )}

            {loading && (
              <div className="w-full h-32 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500 mb-2" />
                <span className="text-sm text-slate-500 font-medium">Đang tải ảnh lên...</span>
              </div>
            )}

            {error && (
              <p className="text-sm font-medium text-red-500 mt-1">{error.message}</p>
            )}
          </div>
        );
      }}
    />
  );
};

export default InputUploadSingleFile;
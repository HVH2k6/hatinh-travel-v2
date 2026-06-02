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
          
          // QUAN TRỌNG: API backend yêu cầu key là 'image' thay vì 'file'
          formData.append('image', file); 
          
          setLoading(true);
          try {
            // Sửa URL này nếu API route của bạn có tên khác (ví dụ: /api/upload)
            const res = await axios.post(`/api/upload-image-single`, formData);
            
            // Xử lý dựa theo cấu trúc json backend trả về
            if (res.data && res.data.success) {
              onChange(res.data.url); // Đẩy URL của TikTok CDN vào form
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
                className="cursor-pointer w-max h-10 rounded-lg flex items-center justify-center bg-slate-600 hover:bg-slate-700 text-white font-medium px-3 transition-colors shadow-sm"
              >
                <UploadCloud/>
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
              <div className="flex items-center text-sm font-medium text-muted-foreground gap-2 h-10">
                <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
                
              </div>
            )}
          </div>
        );
      }}
    />
  );
};

export default InputUploadSingleFile;
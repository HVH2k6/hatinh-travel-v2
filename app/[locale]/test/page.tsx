'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldAlert, Image as ImageIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import InputUploadSingleFile from '@/components/input/input-image-upload';

// Import component Upload của bạn


// 1. Định nghĩa Zod Schema
const testFormSchema = z.object({
  username: z.string().min(2, { message: 'Tên phải có ít nhất 2 ký tự' }),
  avatarUrl: z.string().url({ message: 'Vui lòng upload ảnh hợp lệ' }).nonempty({
    message: 'Vui lòng chọn và upload ảnh đại diện',
  }),
});

type TestFormValues = z.infer<typeof testFormSchema>;

export default function TestUploadPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // 2. Khởi tạo React Hook Form
  const form = useForm<TestFormValues>({
    resolver: zodResolver(testFormSchema),
    defaultValues: {
      username: '',
      avatarUrl: '',
    },
  });

  // 3. Hàm Submit giả lập
  async function onSubmit(data: TestFormValues) {
    setIsLoading(true);
    setErrorMessage('');

    try {
      // Giả lập hiệu ứng gửi API mất 1.5 giây
      await new Promise((resolve) => setTimeout(resolve, 1500));
      
      console.log('Dữ liệu submit thành công:', data);
      alert('Submit thành công! Dữ liệu: ' + JSON.stringify(data));
    } catch (error) {
      setErrorMessage('Đã xảy ra lỗi không xác định khi gửi form.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex bg-white font-sans selection:bg-orange-500 selection:text-white">
      
      {/* KHỐI TRÁI: BANNER GIỚI THIỆU (Giống hệt trang login của bạn) */}
      <div className="hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-slate-950 items-center p-12 lg:p-20">
        <img
          src="https://media.hatinh.gov.vn/hatinh_media/2021/4/27/hatinh_vn_thien_cam_landscape.jpg"
          alt="Hà Tĩnh Nature View"
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 max-w-xl space-y-6 text-white">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10">
            <ImageIcon className="h-4 w-4 text-orange-400" />
            <span className="text-xs font-bold tracking-wider uppercase">
              Component Testing Environment
            </span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            Kiểm thử tính năng Upload
          </h2>
          <p className="text-slate-200/90 text-sm lg:text-base font-medium leading-relaxed">
            Form này được thiết kế dựa trên cấu trúc trường tùy chỉnh mới để test độ mượt mà của tính năng tải ảnh đơn và xác thực bằng Zod.
          </p>
        </div>
      </div>

      {/* KHỐI PHẢI: KHU VỰC FORM CHỨA COMPONENT TEST */}
      <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-slate-50/50">
        <div className="w-full max-w-sm mx-auto space-y-8 py-8">
          
          {/* Tiêu đề form */}
          <div className="space-y-2">
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              Cấu hình thông tin
            </h1>
            <p className="text-sm font-medium text-slate-500">
              Kiểm tra validation của Input và Upload component.
            </p>
          </div>

          {/* Bắt đầu Form */}
          <form
            id="test-upload-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-5"
          >
            {/* Hộp thông báo lỗi tổng quan */}
            {errorMessage && (
              <div className="flex items-start gap-2.5 p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100/80 font-medium animate-shake">
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <FieldGroup className="space-y-4">
              
              {/* FIELD 1: Username (Input text thông thường) */}
              <Controller
                name="username"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel
                      htmlFor="test-username"
                      className="text-xs font-bold tracking-wide text-slate-700 uppercase"
                    >
                      Tên hiển thị
                    </FieldLabel>
                    <Input
                      {...field}
                      id="test-username"
                      type="text"
                      placeholder="Nhập tên của bạn..."
                      disabled={isLoading}
                      className="h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm font-medium placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all"
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs font-bold text-red-500 pt-0.5"
                      />
                    )}
                  </Field>
                )}
              />

              {/* FIELD 2: Component Upload ảnh đơn lẻ của bạn */}
              <Controller
                name="avatarUrl"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel
                      className="text-xs font-bold tracking-wide text-slate-700 uppercase"
                    >
                      Ảnh đại diện cá nhân
                    </FieldLabel>
                    
                    {/* Inject component upload của bạn vào đây */}
                    <div className="pt-1">
                      <InputUploadSingleFile
                        name={field.name}
                        control={form.control}
                      />
                    </div>

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className="text-xs font-bold text-red-500 pt-0.5"
                      />
                    )}
                  </Field>
                )}
              />

            </FieldGroup>

            {/* NÚT SUBMIT */}
            <div className="pt-3">
              <Button
                type="submit"
                form="test-upload-form"
                disabled={isLoading}
                className="w-full h-11 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-orange-600 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Đang gửi dữ liệu...</span>
                  </>
                ) : (
                  <span>Lưu thông tin</span>
                )}
              </Button>
            </div>

          </form>
        </div>
      </div>

    </div>
  );
}
'use client';

import * as React from 'react';
import { useState } from 'react';
import { useRouter } from '@/i18n/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, ShieldAlert, Loader2, CheckCircle2, MailOpen } from 'lucide-react';

// Import UI Shadcn
import { Button } from '@/components/ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';


import { Link } from '@/i18n/navigation';
import { handleServerRegister } from '@/actions/handle-auth';

export default function RegisterForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  // Trạng thái hiển thị màn hình báo thành công kiểm tra email
  const [isSuccess, setIsSuccess] = useState(false);

  const t = useTranslations('register');
  const currentLang = useLocale();

  // ĐỊNH NGHĨA SCHEMA (Đã gỡ bỏ turnstileToken)
  const registerSchema = z.object({
    username: z.string().optional(),
    email: z.string().email(t('validation.email_invalid')),
    password: z.string().min(6, t('validation.password_min')),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: t('validation.password_mismatch'),
    path: ["confirmPassword"],
  });

  type RegisterFormValues = z.infer<typeof registerSchema>;

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      username: '', 
      email: '', 
      password: '', 
      confirmPassword: ''
    },
  });

  async function onSubmit(data: RegisterFormValues) {
    setIsLoading(true);
    setErrorMessage('');

    // Gọi Server Action để đăng ký
    const result = await handleServerRegister(data, currentLang);

    if (result.success) {
      // Bật màn hình thông báo kiểm tra email
      setIsSuccess(true);
    } else {
      setErrorMessage(result.error || t('error_fallback'));
    }
    
    setIsLoading(false);
  }

  // ==========================================================
  // GIAO DIỆN SAU KHI ĐĂNG KÝ THÀNH CÔNG
  // ==========================================================
  if (isSuccess) {
    return (
      <div className='min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans'>
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
          <div className="mx-auto w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mb-4">
            <MailOpen className="h-10 w-10 text-green-500" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">Kiểm tra hộp thư</h2>
          <p className="text-slate-500 font-medium">
            Chúng tôi đã gửi một liên kết xác thực đến <br/>
            <span className="text-slate-900 font-bold">{form.getValues('email')}</span>.
            <br/>Vui lòng kiểm tra email để kích hoạt tài khoản.
          </p>
          <Button onClick={() => router.push('/auth/login')} className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold">
            Trở về đăng nhập
          </Button>
        </div>
      </div>
    );
  }

  // ==========================================================
  // GIAO DIỆN FORM ĐĂNG KÝ CHÍNH
  // ==========================================================
  return (
    <div className='min-h-screen w-full flex bg-white font-sans selection:bg-orange-500 selection:text-white'>
      
      {/* KHỐI TRÁI: BANNER ẢNH */}
      <div className='hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-slate-950 items-center p-12 lg:p-20'>
        <img 
          src="https://media.hatinh.gov.vn/hatinh_media/2021/4/27/hatinh_vn_thien_cam_landscape.jpg" 
          alt="Hà Tĩnh Nature View" 
          className="absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-105 animate-[subtle-zoom_20s_ease-out_infinite]"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-transparent" />
        
        <div className="relative z-10 max-w-xl space-y-6 text-white">
          <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10">
            <Compass className="h-4 w-4 text-orange-400 animate-spin-slow" />
            <span className="text-xs font-bold tracking-wider uppercase">Hà Tĩnh Travel Platform</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase">
            {currentLang === 'vi' ? 'Tham gia cùng chúng tôi' : 'Join Our Community'}
          </h2>
          <p className="text-slate-200/90 text-sm lg:text-base font-medium leading-relaxed">
            {currentLang === 'vi' 
              ? 'Tạo tài khoản để cá nhân hóa hành trình, lưu trữ kỷ niệm và khám phá vẻ đẹp tiềm ẩn của dải đất miền Trung.' 
              : 'Create an account to personalize your journey, save memories, and explore the hidden beauties.'}
          </p>
        </div>
      </div>

      {/* KHỐI PHẢI: FORM ĐĂNG KÝ */}
      <div className='w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-slate-50/50 relative overflow-y-auto py-10'>
        
        <div className="w-full max-w-sm mx-auto space-y-6">
          
          <div className="space-y-2">
            <h1 className='text-3xl font-black tracking-tight text-slate-900'>Đăng ký</h1>
            <p className="text-sm font-medium text-slate-500">
              Đã có tài khoản? <Link href="/auth/login" className="text-orange-600 hover:underline font-bold">Đăng nhập</Link>
            </p>
          </div>

          <form id='register-form' onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            
            {errorMessage && (
              <div className='flex items-start gap-2.5 p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100/80 font-medium animate-shake'>
                <ShieldAlert className="h-4 w-4 mt-0.5 shrink-0 text-red-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <FieldGroup className="space-y-3.5">
              
              {/* Username (Optional) */}
              <Controller
                name='username'
                control={form.control}
                render={({ field }) => (
                  <Field className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold tracking-wide text-slate-700 uppercase">Tên hiển thị (Tùy chọn)</FieldLabel>
                    <Input {...field} className="h-11 rounded-xl bg-white" placeholder='Nguyễn Văn A' disabled={isLoading} />
                  </Field>
                )}
              />

              {/* Email */}
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold tracking-wide text-slate-700 uppercase">Email *</FieldLabel>
                    <Input {...field} type='email' className="h-11 rounded-xl bg-white" placeholder='you@example.com' disabled={isLoading} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500 pt-0.5" />}
                  </Field>
                )}
              />

              {/* Password */}
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold tracking-wide text-slate-700 uppercase">Mật khẩu *</FieldLabel>
                    <Input {...field} type='password' className="h-11 rounded-xl bg-white" placeholder='••••••••' disabled={isLoading} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500 pt-0.5" />}
                  </Field>
                )}
              />

              {/* Confirm Password */}
              <Controller
                name='confirmPassword'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                    <FieldLabel className="text-xs font-bold tracking-wide text-slate-700 uppercase">Xác nhận mật khẩu *</FieldLabel>
                    <Input {...field} type='password' className="h-11 rounded-xl bg-white" placeholder='••••••••' disabled={isLoading} />
                    {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500 pt-0.5" />}
                  </Field>
                )}
              />
              
            </FieldGroup>

            {/* Nút Submit */}
            <div className="pt-3">
              <Button
                type='submit'
                disabled={isLoading}
                className='w-full h-11 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-orange-600 transition-all duration-200'
              >
                {isLoading ? (
                  <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Đang xử lý...</>
                ) : (
                  <span>Đăng ký tài khoản</span>
                )}
              </Button>
            </div>

          </form>

        </div>
      </div>
    </div>
  );
}
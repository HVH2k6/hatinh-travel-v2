'use client';

import * as React from 'react';
import { useState } from 'react';
// Thay vì dùng 'next/navigation', import useRouter từ i18n để điều hướng chuẩn locale
import { useRouter } from '@/i18n/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useTranslations, useLocale } from 'next-intl';
import { Compass, ShieldAlert, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/providers/auth-provider';
import { handleServerLogin } from '@/actions/handle-auth';


const baseLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type LoginFormValues = z.infer<typeof baseLoginSchema>;

export default function LoginForm() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { setUser } = useAuth();

  const t = useTranslations('login');
  const currentLang = useLocale();

  const loginSchema = z.object({
    email: z.string().email(t('validation.email_invalid')),
    password: z.string().min(6, t('validation.password_min')),
  });

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  async function onSubmit(data: LoginFormValues) {
    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await handleServerLogin(data, currentLang);
      if (result.success) {
        setUser(result.user as any);
        router.push('/');
      } else {
        setErrorMessage(result.error || t('error_fallback'));
        setIsLoading(false);
      }
    } catch (error: any) {
      if (error.response && error.response.data) {
        setErrorMessage(error.response.data.error || t('error_fallback'));
      } else {
        setErrorMessage(t('error_connection'));
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className='min-h-screen w-full flex bg-white font-sans selection:bg-orange-500 selection:text-white'>
      {/* KHỐI TRÁI: BANNER TRUYỀN CẢM HỨNG (Ẩn trên mobile, hiện từ màn hình md trở lên) */}
      <div className='hidden md:flex md:w-1/2 lg:w-3/5 relative overflow-hidden bg-slate-950 items-center p-12 lg:p-20'>
        {/* Background Image chất lượng cao về cảnh sắc du lịch */}
        <img
          src='https://media.hatinh.gov.vn/hatinh_media/2021/4/27/hatinh_vn_thien_cam_landscape.jpg'
          alt='Hà Tĩnh Nature View'
          className='absolute inset-0 w-full h-full object-cover object-center opacity-65 scale-105 animate-[subtle-zoom_20s_ease-out_infinite]'
        />
        {/* Lớp phủ gradient làm dịu ảnh và nổi chữ */}
        <div className='absolute inset-0 bg-gradient-to-tr from-slate-950 via-slate-950/40 to-transparent' />

        {/* Nội dung chữ thương hiệu trên ảnh nền */}
        <div className='relative z-10 max-w-xl space-y-6 text-white'>
          <div className='flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full w-fit border border-white/10'>
            <Compass className='h-4 w-4 text-orange-400 animate-spin-slow' />
            <span className='text-xs font-bold tracking-wider uppercase'>
              Hà Tĩnh Travel Platform
            </span>
          </div>
          <h2 className='text-4xl lg:text-5xl font-black tracking-tight leading-none uppercase'>
            {currentLang === 'vi'
              ? 'Bắt đầu hành trình của bạn'
              : currentLang === 'zh'
                ? '开启您的旅程'
                : 'Start Your Journey'}
          </h2>
          <p className='text-slate-200/90 text-sm lg:text-base font-medium leading-relaxed'>
            {currentLang === 'vi'
              ? 'Đăng nhập để lưu lại những điểm đến yêu thích, đặt lịch trình tour và khám phá cung đàn biển miền Trung trọn vẹn nhất.'
              : 'Sign in to save your favorite destinations, book tour itineraries, and explore the most beautiful coastal tracks.'}
          </p>
        </div>

        {/* Bản quyền nhỏ dưới góc màn hình hình ảnh */}
        <p className='absolute bottom-8 left-12 lg:left-20 text-xs text-slate-400 font-medium'>
          © 2026 TravelTour. All rights reserved.
        </p>
      </div>

      {/* KHỐI PHẢI: KHUNG ĐĂNG NHẬP (Chiếm toàn màn hình trên Mobile, nửa màn hình trên PC) */}
      <div className='w-full md:w-1/2 lg:w-2/5 flex flex-col justify-center px-6 sm:px-12 lg:px-16 bg-slate-50/50 relative'>
        <div className='w-full max-w-sm mx-auto space-y-8 py-8'>
          {/* Header nhóm chữ tiêu đề form */}
          <div className='space-y-2'>
            <h1 className='text-3xl font-black tracking-tight text-slate-900'>
              {t('title')}
            </h1>
            <p className='text-sm font-medium text-slate-500'>
              {t('description')}
            </p>
          </div>

          {/* Khu vực Form điền thông tin */}
          <form
            id='login-form'
            onSubmit={form.handleSubmit(onSubmit)}
            className='space-y-5'
          >
            {/* Hộp báo lỗi hệ thống */}
            {errorMessage && (
              <div className='flex items-start gap-2.5 p-3.5 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100/80 font-medium animate-shake'>
                <ShieldAlert className='h-4 w-4 mt-0.5 shrink-0 text-red-500' />
                <span>{errorMessage}</span>
              </div>
            )}

            <FieldGroup className='space-y-4'>
              {/* Field Email */}
              <Controller
                name='email'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className='space-y-1.5'
                  >
                    <FieldLabel
                      htmlFor='login-email'
                      className='text-xs font-bold tracking-wide text-slate-700 uppercase'
                    >
                      {t('email_label')}
                    </FieldLabel>
                    <Input
                      {...field}
                      id='login-email'
                      type='email'
                      placeholder='username@example.com'
                      autoComplete='email'
                      disabled={isLoading}
                      className='h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm font-medium placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className='text-xs font-bold text-red-500 pt-0.5'
                      />
                    )}
                  </Field>
                )}
              />

              {/* Field Password */}
              <Controller
                name='password'
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field
                    data-invalid={fieldState.invalid}
                    className='space-y-1.5'
                  >
                    <div className='flex items-center justify-between'>
                      <FieldLabel
                        htmlFor='login-password'
                        className='text-xs font-bold tracking-wide text-slate-700 uppercase'
                      >
                        {t('password_label')}
                      </FieldLabel>
                      <a
                        href='#'
                        className='text-xs font-bold text-orange-600 hover:text-orange-700 transition-colors'
                      >
                        {t('forgot_password')}
                      </a>
                    </div>
                    <Input
                      {...field}
                      id='login-password'
                      type='password'
                      placeholder='••••••••'
                      autoComplete='current-password'
                      disabled={isLoading}
                      className='h-11 rounded-xl border-slate-200 bg-white px-3.5 text-sm font-medium placeholder:text-slate-300 focus-visible:ring-1 focus-visible:ring-orange-500 focus-visible:border-orange-500 transition-all'
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                        className='text-xs font-bold text-red-500 pt-0.5'
                      />
                    )}
                  </Field>
                )}
              />
            </FieldGroup>

            {/* Nút Submit nằm gọn gàng cuối form */}
            <div className='pt-3'>
              <Button
                type='submit'
                form='login-form'
                disabled={isLoading}
                className='w-full h-11 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-orange-600 transition-all duration-200 shadow-sm flex items-center justify-center gap-2 active:scale-[0.99]'
              >
                {isLoading ? (
                  <>
                    <Loader2 className='h-4 w-4 animate-spin' />
                    <span>{t('button_loading')}</span>
                  </>
                ) : (
                  <span>{t('button_submit')}</span>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

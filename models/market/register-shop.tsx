'use client';

import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, ShieldAlert, CheckCircle2, Store } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea'; 
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';

import InputUploadSingleFile from '@/components/input/input-image-upload';
import { handleServerApplySeller } from '@/actions/handle-auth'; 

export default function RegisterSeller() {
  const t = useTranslations('seller');
  const currentLang = useLocale();

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  // ĐỘNG HÓA VALIDATION SCHEMA THEO NGÔN NGỮ HIỆN TẠI
  const sellerSchema = z.object({
    shop_name: z
      .string()
      .min(2, { message: t('validation.shop_name_min') })
      .max(255, { message: t('validation.shop_name_max') }),
    phone_number: z
      .string()
      .min(10, { message: t('validation.phone_invalid') })
      .max(20, { message: t('validation.phone_invalid') }),
    description: z.string().optional(),
    documents: z.object({
      id_front: z.string().min(1, { message: t('validation.upload_front') }).url(),
      id_back: z.string().min(1, { message: t('validation.upload_back') }).url(),
    }),
    social_media: z.object({
      facebook: z.string().optional(),
      zalo: z.string().optional(),
    }).optional(),
  });

  type SellerFormValues = z.infer<typeof sellerSchema>;

  const form = useForm<SellerFormValues>({
    resolver: zodResolver(sellerSchema),
    defaultValues: {
      shop_name: '',
      phone_number: '',
      description: '',
      documents: { id_front: '', id_back: '' },
      social_media: { facebook: '', zalo: '' }
    },
  });

  async function onSubmit(data: SellerFormValues) {
    setIsLoading(true);
    setErrorMessage('');
    setIsSuccess(false);

    try {
      const result = await handleServerApplySeller(data, currentLang);

      if (result.success) {
        setIsSuccess(true);
        form.reset();
      } else {
        setErrorMessage(result.error || 'An unexpected error occurred.');
      }
    } catch (error) {
      setErrorMessage(t('error_network'));
    } finally {
      setIsLoading(false);
    }
  }

  // MÀN HÌNH BÁO THÀNH CÔNG ĐA NGÔN NGỮ
  if (isSuccess) {
    return (
      <div className="max-w-xl mx-auto mt-20 p-8 border rounded-2xl bg-white shadow-sm text-center space-y-4 font-sans">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
        <h2 className="text-2xl font-bold">{t('success_title')}</h2>
        <p className="text-slate-500 font-medium">{t('success_description')}</p>
        <Button onClick={() => window.location.href = `/${currentLang}`} className="mt-4 font-bold rounded-xl">
          {t('btn_home')}
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12 px-6 font-sans">
      
      {/* HEADER FORM */}
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-3 text-orange-600 mb-2">
          <Store className="w-8 h-8" />
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
            {t('title')}
          </h1>
        </div>
        <p className="text-slate-500 font-medium">{t('description')}</p>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        
        {errorMessage && (
          <div className="flex items-start gap-2.5 p-4 text-sm text-red-600 bg-red-50 rounded-xl border border-red-100 font-medium">
            <ShieldAlert className="h-5 w-5 shrink-0 text-red-500" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* SECTION 1: THÔNG TIN CƠ BẢN */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
          <h3 className="font-bold text-lg text-slate-800">{t('sections.basic')}</h3>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="shop_name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.shop_name')}</FieldLabel>
                  <Input {...field} placeholder={t('fields.shop_name_placeholder')} disabled={isLoading} className="h-11 bg-white" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500" />}
                </Field>
              )}
            />
            <Controller
              name="phone_number"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.phone_number')}</FieldLabel>
                  <Input {...field} placeholder={t('fields.phone_number_placeholder')} disabled={isLoading} className="h-11 bg-white" />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500" />}
                </Field>
              )}
            />
          </FieldGroup>
          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid} className="space-y-1.5 mt-4">
                <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.description')}</FieldLabel>
                <Textarea {...field} placeholder={t('fields.description_placeholder')} disabled={isLoading} className="bg-white resize-none h-24" />
              </Field>
            )}
          />
        </div>

        {/* SECTION 2: GIẤY TỜ XÁC MINH */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
          <h3 className="font-bold text-lg text-slate-800">{t('sections.identity')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <Controller
              name="documents.id_front"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.id_front')}</FieldLabel>
                  <InputUploadSingleFile name={field.name} control={form.control} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500" />}
                </Field>
              )}
            />
            <Controller
              name="documents.id_back"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid} className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.id_back')}</FieldLabel>
                  <InputUploadSingleFile name={field.name} control={form.control} />
                  {fieldState.invalid && <FieldError errors={[fieldState.error]} className="text-xs font-bold text-red-500" />}
                </Field>
              )}
            />
          </div>
        </div>

        {/* SECTION 3: MẠNG XÃ HỘI */}
        <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
          <h3 className="font-bold text-lg text-slate-800">{t('sections.social')}</h3>
          <FieldGroup className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Controller
              name="social_media.facebook"
              control={form.control}
              render={({ field }) => (
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.facebook')}</FieldLabel>
                  <Input {...field} placeholder="https://facebook.com/..." disabled={isLoading} className="h-11 bg-white" />
                </Field>
              )}
            />
            <Controller
              name="social_media.zalo"
              control={form.control}
              render={({ field }) => (
                <Field className="space-y-1.5">
                  <FieldLabel className="text-xs font-bold text-slate-700 uppercase">{t('fields.zalo')}</FieldLabel>
                  <Input {...field} placeholder={t('fields.zalo_placeholder')} disabled={isLoading} className="h-11 bg-white" />
                </Field>
              )}
            />
          </FieldGroup>
        </div>

        {/* NÚT SUBMIT ĐA NGÔN NGỮ */}
        <Button
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base rounded-xl font-bold text-white bg-orange-600 hover:bg-orange-700 transition-all duration-200"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {t('btn_loading')}
            </>
          ) : (
            t('btn_submit')
          )}
        </Button>
      </form>
    </div>
  );
}
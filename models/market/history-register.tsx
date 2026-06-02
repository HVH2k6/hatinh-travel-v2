'use client';

import * as React from 'react';
import { useTranslations } from 'next-intl';
import { Store, Calendar, Phone, Clock, CheckCircle2, XCircle, Bell, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from '@/i18n/navigation';

interface ApplicationItem {
  id: number;
  shop_name: string;
  phone_number: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  rejection_reason: string | null;
}

interface HistoryRegisterSellerProps {
  initialData: ApplicationItem[];
}

export default function HistoryRegisterSeller({ initialData }: HistoryRegisterSellerProps) {
  const t = useTranslations('seller_history');

  // Hàm render Badge màu sắc động dựa theo status
  const renderStatusBadge = (status: ApplicationItem['status']) => {
    const styles = {
      pending: 'bg-amber-50 text-amber-700 border-amber-200/60',
      approved: 'bg-green-50 text-green-700 border-green-200/60',
      rejected: 'bg-red-50 text-red-700 border-red-200/60',
    };

    const icons = {
      pending: <Clock className="w-3.5 h-3.5" />,
      approved: <CheckCircle2 className="w-3.5 h-3.5" />,
      rejected: <XCircle className="w-3.5 h-3.5" />,
    };

    return (
      <span className={cn(
        'inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full border shadow-sm uppercase tracking-wide',
        styles[status]
      )}>
        {icons[status]}
        {t(`status.${status}`)}
      </span>
    );
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6 font-sans">
      {/* Tiêu đề trang */}
      <div className="mb-8 space-y-2 border-b border-slate-100 pb-6">
        <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase">
          {t('title')}
        </h1>
        <p className="text-slate-500 font-medium">
          {t('description')}
        </p>
      </div>

      {/* Trường hợp chưa có đơn nào */}
      {initialData.length === 0 ? (
        <div className="text-center py-16 bg-slate-50/50 border border-dashed border-slate-200 rounded-3xl space-y-3">
          <Store className="w-12 h-12 text-slate-300 mx-auto" />
          <p className="text-slate-400 font-bold text-sm">{t('empty')}</p>
        </div>
      ) : (
        /* Danh sách đơn đăng ký */
        <div className="space-y-4">
          {initialData.map((app) => (
            <div 
              key={app.id} 
              className="bg-white border border-slate-100 p-5 md:p-6 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col md:flex-row md:items-center md:justify-between gap-4"
            >
              {/* Bên trái: Thông tin shop */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-orange-50 text-orange-600 rounded-xl shrink-0">
                    <Store className="w-5 h-5" />
                  </div>
                  <h3 className="font-black text-lg text-slate-900 tracking-tight">
                    {app.shop_name}
                  </h3>
                </div>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm font-medium text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <span>{app.phone_number}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4 text-slate-400" />
                    <span>{new Date(app.created_at).toLocaleDateString('vi-VN')}</span>
                  </div>
                  
                  {/* CHỈ HIỂN THỊ LÝ DO KHI BỊ REJECTED VÀ CÓ TEXT REJECTION */}
                  {app.status === 'rejected' && app.rejection_reason && (
                    <div className='flex items-center gap-1.5 text-red-600 bg-red-50/70 px-2 py-0.5 rounded-md border border-red-100/50'>
                      <Bell className='w-3.5 h-3.5 shrink-0'/>
                      <span className="text-xs font-bold">{t('th_rejection')}: {app.rejection_reason}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Bên phải: Trạng thái duyệt & Hành động xử lý */}
              <div className="flex items-center gap-3 shrink-0 md:self-center justify-between md:justify-end">
                {renderStatusBadge(app.status)}

                
                {app.status === 'approved' && (
                  <Link
                    href={`${process.env.NEXT_PUBLIC_URL_SERVER}/seller/dashboard`}
                    className="inline-flex items-center gap-1.5 bg-slate-950 text-white text-xs font-bold h-8 px-3 rounded-xl shadow-sm hover:bg-orange-600 transition-all active:scale-95"
                  >
                    <span>{t('btn_manage')}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
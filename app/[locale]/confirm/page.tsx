'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from '@/i18n/navigation';
import { useLocale, useTranslations } from 'next-intl';
import axios from 'axios';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ConfirmEmailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const currentLang = useLocale();
  
  const [status, setStatus] = React.useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = React.useState('');
  
  const hasCalledAPI = React.useRef(false);

  React.useEffect(() => {
    const tokenHash = searchParams.get('token_hash');
    const type = searchParams.get('type');

    // 1. Kiểm tra xem URL có đủ tham số không
    if (!tokenHash || !type) {
      setStatus('error');
      setMessage('Đường dẫn xác thực không hợp lệ hoặc bị thiếu tham số.');
      return;
    }

    // 2. Chặn gọi API 2 lần do React Strict Mode
    if (hasCalledAPI.current) return;
    hasCalledAPI.current = true;

    // 3. Gọi API sang Laravel
    const verifyEmail = async () => {
      try {
        const res = await axios.post(
          `${process.env.NEXT_PUBLIC_URL}/auth/confirm-email`, 
          {
            token_hash: tokenHash,
            type: type
          },
          {
            headers: { 'Accept-Language': currentLang }
          }
        );

        if (res.data.success) {
          setStatus('success');
          setMessage('Tài khoản của bạn đã được kích hoạt thành công!');
        }
      } catch (error: any) {
        setStatus('error');
        if (error.response && error.response.data) {
          setMessage(error.response.data.message || 'Xác thực thất bại hoặc link đã hết hạn.');
        } else {
          setMessage('Lỗi kết nối đến máy chủ. Vui lòng thử lại sau.');
        }
      }
    };

    verifyEmail();
  }, [searchParams, currentLang]);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-slate-50 p-4 font-sans">
      <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100 text-center space-y-6">
        
        {/* TRẠNG THÁI LOADING */}
        {status === 'loading' && (
          <div className="space-y-4 flex flex-col items-center">
            <Loader2 className="h-12 w-12 text-orange-500 animate-spin" />
            <h2 className="text-xl font-bold text-slate-900">Đang xác thực...</h2>
            <p className="text-sm text-slate-500">Vui lòng đợi trong giây lát, hệ thống đang kiểm tra thông tin.</p>
          </div>
        )}

        {/* TRẠNG THÁI THÀNH CÔNG */}
        {status === 'success' && (
          <div className="space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Thành công!</h2>
              <p className="text-slate-600 font-medium">{message}</p>
            </div>
            <Button 
              onClick={() => router.push('/auth/login')} 
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold hover:bg-orange-600 transition-colors"
            >
              Đến trang đăng nhập
            </Button>
          </div>
        )}

        {/* TRẠNG THÁI LỖI */}
        {status === 'error' && (
          <div className="space-y-6 flex flex-col items-center animate-in zoom-in-95 duration-300">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <XCircle className="h-8 w-8 text-red-500" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-slate-900 uppercase">Thất bại</h2>
              <p className="text-slate-600 font-medium">{message}</p>
            </div>
            <Button 
              onClick={() => router.push('/auth/login')} 
              className="w-full h-11 rounded-xl bg-slate-900 text-white font-bold"
            >
              Trở về trang chủ
            </Button>
          </div>
        )}

      </div>
    </div>
  );
}
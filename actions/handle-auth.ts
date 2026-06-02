'use server';

import { cookies } from 'next/headers';
import axios from 'axios';

export async function handleServerLogin(data: any, currentLang: string) {
  try {
    // 1. Next.js Server ngầm gọi sang Laravel (Giấu kín endpoint)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/auth/login`,
      data,
      { headers: { 'Accept-Language': currentLang } },
    );

    const { access_token, refresh_token, user } = response.data;
    const isProduction = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();

    // 2. Set cookie dạng HttpOnly (Bảo mật XSS tuyệt đối)
    cookieStore.set('access_token', access_token, {
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: isProduction,
      httpOnly: true, // Mã JS ở Client không sờ vào được
      sameSite: 'lax',
    });

    cookieStore.set('refresh_token', refresh_token, {
      path: '/',
      expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
    });

    return { success: true, user };
  } catch (error: any) {
    if (error.response && error.response.data) {
      return { success: false, error: error.response.data.error };
    }
    return { success: false, error: 'Lỗi kết nối hệ thống.' };
  }
}
export async function handleServerRegister(data: any, currentLang: string) {
  try {
    // Gọi API Laravel với header đa ngôn ngữ
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/auth/register`,
      {
        email: data.email,
        password: data.password,
        username: data.username,
        // (Tùy chọn) Gửi kèm turnstileToken để Laravel verify với Cloudflare nếu backend có viết logic đó
        // turnstile_token: data.turnstileToken
      },
      {
        headers: {
          'Accept-Language': currentLang,
        },
      },
    );

    return {
      success: true,
      message: response.data.message,
      requiresVerification: response.data.requires_verification,
    };
  } catch (error: any) {
    if (error.response && error.response.data) {
      // Bắt trọn thông báo lỗi từ Laravel (ví dụ: Email đã tồn tại)
      return {
        success: false,
        error: error.response.data.error || 'Đăng ký thất bại.',
      };
    }
    return { success: false, error: 'Lỗi kết nối đến máy chủ.' };
  }
}
export async function handleServerApplySeller(data: any, currentLang: string) {
  try {
    const cookieStore = await cookies();
    // Vì access_token được lưu HttpOnly nên ta lấy nó từ Server
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.',
      };
    }

    // 1. Next.js Server ngầm gọi sang Laravel (Giấu kín endpoint)
    const response = await axios.post(
      `${process.env.NEXT_PUBLIC_URL}/auth/register-seller`, // Thay URL cho khớp route Laravel của bạn
      data,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept-Language': currentLang,
        },
      },
    );

    // Bốc data từ response Laravel (success, message)
    return {
      success: true,
      message: response.data.message || 'Gửi đơn đăng ký thành công!',
    };
  } catch (error: any) {
    // 2. Bắt lỗi trả về cho Frontend
    if (error.response && error.response.data) {
      return {
        success: false,
        error:
          error.response.data.message ||
          error.response.data.error ||
          'Lỗi xử lý từ hệ thống.',
      };
    }
    return { success: false, error: 'Lỗi kết nối đến máy chủ.' };
  }
}
export async function handleServerGetMyApplications(currentLang: string) {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('access_token')?.value;

    if (!accessToken) {
      return { success: false, error: 'Unauthorized' };
    }

    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_URL}/auth/my-seller-applications`,
      {
        headers: {
          'Accept-Language': currentLang,
          Authorization: `Bearer ${accessToken}`, // Gửi token gác cổng sang Laravel
        },
      },
    );

    return { success: true, data: response.data.data };
  } catch (error: any) {
    return { success: false, error: 'Không thể lấy dữ liệu lịch sử.' };
  }
}

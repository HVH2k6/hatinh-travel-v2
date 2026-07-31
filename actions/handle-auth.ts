'use server';

import { cookies } from 'next/headers';
import prisma from '@/lib/prisma';
import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function handleServerLogin(data: any, currentLang: string) {
  try {
    const { email, password } = data;
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return { success: false, error: 'Tài khoản hoặc mật khẩu không chính xác.' };
    }

    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { role: true },
    });

    if (!user) {
      return { success: false, error: 'User không tồn tại trong hệ thống (chưa đồng bộ).' };
    }

    if (user.status === false) {
      return { success: false, error: 'Tài khoản của bạn đã bị khóa.' };
    }

    const { password: _, ...userWithoutPassword } = user;
    const { access_token, refresh_token } = authData.session;

    const isProduction = process.env.NODE_ENV === 'production';
    const cookieStore = await cookies();

    // 2. Set cookie dạng HttpOnly (Bảo mật XSS tuyệt đối)
    cookieStore.set('access_token', access_token, {
      path: '/',
      expires: new Date(Date.now() + 60 * 15 * 1000), // 15 minutes
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
    });

    cookieStore.set('refresh_token', refresh_token, {
      path: '/',
      expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 365),
      secure: isProduction,
      httpOnly: true,
      sameSite: 'lax',
    });

    return { success: true, user: userWithoutPassword };
  } catch (error: any) {
    return { success: false, error: 'Lỗi kết nối hệ thống.' };
  }
}

export async function handleServerRegister(data: any, currentLang: string) {
  try {
    const { email, password, username } = data;

    const supabase = await createServerClient();

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || "Đăng ký Supabase thất bại." };
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return { success: false, error: "Email đã được sử dụng trong hệ thống." };
    }

    const role = await prisma.role.findFirst({
      where: { name: "User" },
    });

    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id,
        email,
        username: username || null,
        roleId: role?.id || null,
        password: null,
      },
    });

    return {
      success: true,
      message: 'Đăng ký thành công! Vui lòng đăng nhập.',
      requiresVerification: false,
    };
  } catch (error: any) {
    return { success: false, error: 'Lỗi kết nối đến máy chủ.' };
  }
}
export async function handleServerApplySeller(data: any, currentLang: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return { success: false, error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { success: false, error: 'Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.' };
    }
    const userId = user.id;

    const { shop_name, phone_number, description, documents, social_media } = data;

    if (!shop_name || !phone_number || !documents) {
      return { success: false, error: 'Vui lòng điền đầy đủ các thông tin bắt buộc' };
    }

    const existingApplication = await prisma.seller_Application.findFirst({
      where: { user_id: userId, status: 'pending' }
    });

    if (existingApplication) {
      return { success: false, error: 'Bạn đã có một đơn đăng ký đang chờ duyệt' };
    }

    await prisma.seller_Application.create({
      data: {
        user_id: userId,
        shop_name: shop_name,
        phone_number: phone_number,
        description: description || null,
        documents: documents,
        social_media: social_media || null,
        status: 'pending'
      }
    });

    return { success: true, message: 'Gửi đơn đăng ký thành công!' };
  } catch (error: any) {
    return { success: false, error: 'Lỗi kết nối đến máy chủ.' };
  }
}

export async function handleServerGetMyApplications(currentLang: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('access_token')?.value;

    if (!token) {
      return { success: false, error: 'Unauthorized' };
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { global: { headers: { Authorization: `Bearer ${token}` } }, auth: { persistSession: false } }
    );
    const { data: { user }, error } = await supabase.auth.getUser();
    if (error || !user) {
      return { success: false, error: 'Unauthorized' };
    }
    const userId = user.id;

    const applications = await prisma.seller_Application.findMany({
      where: { user_id: userId },
      orderBy: { created_at: 'desc' }
    });

    return { success: true, data: applications };
  } catch (error: any) {
    return { success: false, error: 'Không thể lấy dữ liệu lịch sử.' };
  }
}

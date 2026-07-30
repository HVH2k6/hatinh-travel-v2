import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    // 1. Đăng nhập qua Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.session) {
      return NextResponse.json(
        { success: false, message: "Tài khoản hoặc mật khẩu không chính xác." },
        { status: 401 }
      );
    }

    // 2. Lấy thông tin user từ bảng User (Prisma)
    const user = await prisma.user.findUnique({
      where: { id: authData.user.id },
      include: { role: true },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User không tồn tại trong hệ thống (chưa đồng bộ)." },
        { status: 404 }
      );
    }

    if (user.status === false) {
      return NextResponse.json(
        { success: false, message: "Tài khoản của bạn đã bị khóa." },
        { status: 403 }
      );
    }

    // Không trả về password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công!",
      user: userWithoutPassword,
      // Trả ra thêm token từ Supabase session
      access_token: authData.session.access_token,
      refresh_token: authData.session.refresh_token,
      // expires_at: authData.session.expires_at,
    });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra khi đăng nhập." },
      { status: 500 }
    );
  }
}

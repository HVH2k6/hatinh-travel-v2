import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Thiếu thông tin đăng nhập" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } } // Chế độ API thuần túy, không dùng cookie
    );

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.session) {
      return NextResponse.json(
        { success: false, message: "Tài khoản hoặc mật khẩu không chính xác" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
      include: { role: true },
    });

    if (!dbUser || !dbUser.role || (dbUser.role.name?.toLowerCase() !== "admin" && dbUser.role.name?.toLowerCase() !== "seller")) {
      return NextResponse.json(
        { success: false, message: "Bạn không có quyền truy cập trang quản trị" },
        { status: 403 }
      );
    }

    const { password: _, ...userWithoutPassword } = dbUser;

    // Chỉ trả về JSON, không set Cookie ngầm vào Response
    return NextResponse.json({
      success: true,
      message: "Đăng nhập thành công",
      user: userWithoutPassword,
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

  } catch (error: any) {
    console.error("Admin Login Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi hệ thống khi đăng nhập" },
      { status: 500 }
    );
  }
}

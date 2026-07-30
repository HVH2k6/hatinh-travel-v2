import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email và mật khẩu là bắt buộc." },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // 1. Đăng ký qua Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, message: authError?.message || "Đăng ký Supabase thất bại." },
        { status: 400 }
      );
    }

    // Kiểm tra xem user có tồn tại ở public chưa
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email đã được sử dụng trong hệ thống." },
        { status: 400 }
      );
    }

    // 2. Tạo record ở bảng User (Prisma)
    const role = await prisma.role.findFirst({
      where: { name: "User" },
    });

    const newUser = await prisma.user.create({
      data: {
        id: authData.user.id, // Dùng chung ID với Supabase cho dễ quản lý
        email,
        username: username || null,
        // phoneNumber: phoneNumber || null,
        roleId: role?.id || null,
        password: null, // Không cần lưu mật khẩu nữa vì Supabase Auth quản lý
      },
    });

    return NextResponse.json(
      { success: true, message: "Đăng ký thành công!", user: newUser },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Register Error:", error);
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra khi đăng ký." },
      { status: 500 }
    );
  }
}

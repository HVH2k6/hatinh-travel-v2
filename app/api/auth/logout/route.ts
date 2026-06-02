// src/app/api/auth/logout/route.ts
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();

    // 1. Xóa bỏ các cookie httpOnly trên Server
    cookieStore.delete("access_token");
    cookieStore.delete("refresh_token");

    // Nếu trước đó ông có lưu thêm thông tin gì khác bằng cookie thì xóa nốt ở đây
    // cookieStore.delete("user"); 

    return NextResponse.json({ success: true, message: "Đăng xuất thành công!" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra khi đăng xuất." },
      { status: 500 }
    );
  }
}
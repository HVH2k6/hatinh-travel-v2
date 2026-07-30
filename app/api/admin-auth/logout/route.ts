import { NextResponse } from "next/server";

export async function POST() {
  // Với Stateless auth (không dùng cookie Next.js), logout chỉ đơn giản là trả về thành công
  // Client (React Dashboard) sẽ tự xóa token trong js-cookie và localStorage
  return NextResponse.json({
    success: true,
    message: "Đăng xuất thành công",
  });
}

import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function handleProxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // Chuyển đổi endpoint từ /api/auth/me thành /auth/me sang Laravel
  const laravelPath = pathname.replace(/^\/api/, ""); 
  
  // Lấy access_token đang nằm an toàn trong HttpOnly Cookie trên NextServer
  const accessToken = req.cookies.get("access_token")?.value;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    // Đọc body từ client nếu có
    const body = req.method !== "GET" ? await req.json() : undefined;

    const response = await axios({
      method: req.method,
      url: `${process.env.NEXT_PUBLIC_URL}${laravelPath}${search}`,
      data: body,
      headers: headers,
    });

    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    if (error.response) {
      return NextResponse.json(error.response.data, { status: error.response.status });
    }
    return NextResponse.json({ error: "Lỗi kết nối Server" }, { status: 500 });
  }
}

export { handleProxy as GET, handleProxy as POST, handleProxy as PUT, handleProxy as DELETE };
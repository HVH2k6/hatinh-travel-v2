import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(req: NextRequest) {
  const refreshToken = req.cookies.get("refresh_token")?.value;

  if (!refreshToken) {
    return NextResponse.json({ error: "Không tìm thấy Refresh Token" }, { status: 401 });
  }

  try {
    // Gửi refresh token qua Laravel
    const response = await axios.post(`${process.env.NEXT_PUBLIC_URL}/auth/refresh-token`, {
      refresh_token: refreshToken,
    });

    const { access_token, refresh_token: new_refresh_token } = response.data;
    const res = NextResponse.json({ success: true });
    const isProduction = process.env.NODE_ENV === "production";

    // Ghi đè cặp cookie HttpOnly mới toanh
    res.cookies.set("access_token", access_token, {
      path: "/",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
    });

    res.cookies.set("refresh_token", new_refresh_token, {
      path: "/",
      expires: new Date(Date.now() + 100 * 24 * 60 * 60 * 1000),
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
    });

    return res;
  } catch (error) {
    
    const res = NextResponse.json({ error: "Refresh token hết hạn" }, { status: 401 });
    res.cookies.delete("access_token");
    res.cookies.delete("refresh_token");
    return res;
  }
}
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const refreshToken = cookieStore.get("refresh_token")?.value;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Thiếu refresh_token trong cookie" },
        { status: 400 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false } }
    );

    const { data, error } = await supabase.auth.refreshSession({ refresh_token: refreshToken });

    if (error || !data.session) {
      return NextResponse.json(
        { success: false, message: "Không thể refresh token" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Refresh token thành công!",
      access_token: data.session.access_token,
    });

    // SET LẠI COOKIE MỚI VÀO BROWSER (Giống hệt cách handle-auth.ts set cookie lúc login)
    response.cookies.set("access_token", data.session.access_token, {
      httpOnly: true, // Phải là true để bảo mật giống bên server action login
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    if (data.session.refresh_token) {
      response.cookies.set("refresh_token", data.session.refresh_token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error: any) {
    console.error("Refresh Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi refresh token" },
      { status: 500 }
    );
  }
}

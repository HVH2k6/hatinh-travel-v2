import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(request: Request) {
  try {
    const body = await request.json().catch(() => ({}));
    const refreshToken = body.refresh_token;

    if (!refreshToken) {
      return NextResponse.json(
        { success: false, message: "Thiếu refresh_token" },
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

    // Chỉ trả về JSON, không set Cookie
    return NextResponse.json({
      success: true,
      message: "Refresh token thành công!",
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

  } catch (error: any) {
    console.error("Admin Refresh Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi refresh token" },
      { status: 500 }
    );
  }
}

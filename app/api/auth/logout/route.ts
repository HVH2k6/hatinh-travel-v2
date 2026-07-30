import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST() {
  try {
    const supabase = await createClient();

    // Sign out khỏi Supabase (Hàm này sẽ tự động xóa các cookies liên quan qua SSR client)
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Lỗi khi sign out Supabase:", error);
    }

    return NextResponse.json({ success: true, message: "Đăng xuất thành công!" });
  } catch (error) {
    return NextResponse.json(
      { success: false, message: "Có lỗi xảy ra khi đăng xuất." },
      { status: 500 }
    );
  }
}

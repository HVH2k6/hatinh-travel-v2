import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cookies, headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const reqHeaders = await headers();
    let authHeader = reqHeaders.get("authorization");

    // Nếu không có header Authorization (do client gửi kèm cookie HttpOnly), đọc từ cookie
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      const cookieStore = await cookies();
      const cookieToken = cookieStore.get("access_token")?.value;
      if (cookieToken) {
        authHeader = `Bearer ${cookieToken}`;
      }
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader || "" } },
        auth: { persistSession: false },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    // Lấy thông tin thêm từ bảng User
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!dbUser) {
      return NextResponse.json(
        { success: false, message: "User not found in database" },
        { status: 404 }
      );
    }

    const { password: _, ...userWithoutPassword } = dbUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Get Me Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

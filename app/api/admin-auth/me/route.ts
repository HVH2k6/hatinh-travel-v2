import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { headers } from "next/headers";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const reqHeaders = await headers();
    let authHeader = reqHeaders.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Missing Token" },
        { status: 401 }
      );
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false },
      }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: Invalid Token" },
        { status: 401 }
      );
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
      include: { role: true },
    });

    if (!dbUser || !dbUser.role || (dbUser.role.name?.toLowerCase() !== "admin" && dbUser.role.name?.toLowerCase() !== "seller")) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Not an Admin or Seller" },
        { status: 403 }
      );
    }

    const { password: _, ...userWithoutPassword } = dbUser;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword,
    });
  } catch (error: any) {
    console.error("Admin Get Me Error:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

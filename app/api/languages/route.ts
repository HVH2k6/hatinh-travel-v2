import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

// Lấy danh sách ngôn ngữ
export async function GET() {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const languages = await prisma.language.findMany({
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: languages });
  } catch (error: any) {
    console.error("GET Languages Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách ngôn ngữ." },
      { status: 500 }
    );
  }
}

// Tạo mới ngôn ngữ
export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { code, name, flag_icon, is_active } = body;

    if (!code || !name) {
      return NextResponse.json(
        { success: false, message: "Mã ngôn ngữ (code) và tên (name) là bắt buộc." },
        { status: 400 }
      );
    }

    // Kiểm tra xem code đã tồn tại chưa
    const existingLanguage = await prisma.language.findUnique({
      where: { code },
    });

    if (existingLanguage) {
      return NextResponse.json(
        { success: false, message: "Mã ngôn ngữ này đã tồn tại." },
        { status: 400 }
      );
    }

    const newLanguage = await prisma.language.create({
      data: {
        code,
        name,
        flag_icon: flag_icon || null,
        is_active: is_active !== undefined ? is_active : true,
      },
    });

    return NextResponse.json(
      { success: true, message: "Tạo ngôn ngữ thành công!", data: newLanguage },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("POST Language Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo ngôn ngữ mới." },
      { status: 500 }
    );
  }
}

import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

// Lấy danh sách Type
export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const types = await prisma.attraction_Type.findMany({
      include: {
        translations: true,
      },
      orderBy: { created_at: "desc" },
    });

    return NextResponse.json({ success: true, data: types });
  } catch (error: any) {
    console.error("GET Types Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Type." },
      { status: 500 }
    );
  }
}

// Tạo mới Type
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
    const { icon, is_active, translations } = body;

    // Kiểm tra data hợp lệ
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp ít nhất một bản dịch." },
        { status: 400 }
      );
    }

    // Dùng transaction để đảm bảo toàn vẹn dữ liệu
    const newType = await prisma.$transaction(async (tx: any) => {
      // 1. Tạo type
      const type = await tx.attraction_Type.create({
        data: {
          icon: icon || null,
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      // 2. Tạo các bản dịch
      const translationsData = translations.map((t: any) => ({
        type_id: type.id,
        language_code: t.language_code,
        name: t.name,
        slug: t.slug,
      }));

      await tx.attraction_Type_Translation.createMany({
        data: translationsData,
      });

      return await tx.attraction_Type.findUnique({
        where: { id: type.id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo thành công", data: newType }, { status: 201 });
  } catch (error: any) {
    console.error("POST Type Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo Type." },
      { status: 500 }
    );
  }
}

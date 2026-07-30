import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const units = await prisma.unit.findMany({
      include: {
        translations: true,
      },
      where: search ? {
        OR: [
          {
            code: {
              contains: search,
              mode: 'insensitive',
            }
          },
          {
            translations: {
              some: {
                name: {
                  contains: search,
                  mode: 'insensitive',
                }
              }
            }
          }
        ]
      } : undefined,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: units });
  } catch (error: any) {
    console.error("GET Units Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Unit." },
      { status: 500 }
    );
  }
}

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
    const { code, is_active, translations } = body;

    if (!code) {
      return NextResponse.json(
        { success: false, message: "Mã đơn vị tính (code) là bắt buộc." },
        { status: 400 }
      );
    }

    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp ít nhất 1 bản dịch (ví dụ Tiếng Việt)." },
        { status: 400 }
      );
    }

    // Check if code exists
    const existingCode = await prisma.unit.findUnique({
      where: { code }
    });
    if (existingCode) {
      return NextResponse.json(
        { success: false, message: "Mã đơn vị tính này đã tồn tại." },
        { status: 400 }
      );
    }

    const newUnit = await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi Unit
      const unit = await tx.unit.create({
        data: {
          code: code,
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      // 2. Tạo các bản dịch tương ứng
      const translationsData = translations.map((t: any) => ({
        unit_id: unit.id,
        language_code: t.language_code,
        name: t.name,
      }));

      await tx.unit_Translation.createMany({
        data: translationsData,
      });

      return await tx.unit.findUnique({
        where: { id: unit.id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo mới thành công", data: newUnit });
  } catch (error: any) {
    console.error("POST Unit Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo mới Unit." },
      { status: 500 }
    );
  }
}

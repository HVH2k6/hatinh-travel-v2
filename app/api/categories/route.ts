import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const categories = await prisma.category.findMany({
      include: {
        translations: true,
      },
      where: search ? {
        translations: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive',
            }
          }
        }
      } : undefined,
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json({ success: true, data: categories });
  } catch (error: any) {
    console.error("GET Categories Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Category." },
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
    const { image, position, is_active, translations } = body;

    // translations is an array of { language_code, name, slug }
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp ít nhất 1 bản dịch (ví dụ Tiếng Việt)." },
        { status: 400 }
      );
    }

    const newCategory = await prisma.$transaction(async (tx) => {
      // 1. Tạo bản ghi Category
      const category = await tx.category.create({
        data: {
          image: image || null,
          position: position ? parseInt(position.toString(), 10) : 0,
          is_active: is_active !== undefined ? is_active : true,
        },
      });

      // 2. Tạo các bản dịch tương ứng
      const translationsData = translations.map((t: any) => ({
        category_id: category.id,
        language_code: t.language_code,
        name: t.name,
        slug: t.slug,
      }));

      await tx.category_Translation.createMany({
        data: translationsData,
      });

      return await tx.category.findUnique({
        where: { id: category.id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo mới thành công", data: newCategory });
  } catch (error: any) {
    console.error("POST Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo mới Category." },
      { status: 500 }
    );
  }
}

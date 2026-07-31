import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!category) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: category });
  } catch (error: any) {
    console.error("GET Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy chi tiết Category." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { id } = await params;
    const body = await request.json();
    const { image, position, is_active, translations } = body;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    const updatedCategory = await prisma.$transaction(async (tx: any) => {
      // 1. Cập nhật bảng chính
      await tx.category.update({
        where: { id },
        data: {
          image: image !== undefined ? image : existingCategory.image,
          position: position !== undefined ? parseInt(position.toString(), 10) : existingCategory.position,
          is_active: is_active !== undefined ? is_active : existingCategory.is_active,
          updated_at: new Date(),
        },
      });

      // 2. Cập nhật bản dịch nếu có truyền lên
      if (translations && Array.isArray(translations)) {
        await tx.category_Translation.deleteMany({
          where: { category_id: id },
        });

        const translationsData = translations.map((t: any) => ({
          category_id: id,
          language_code: t.language_code,
          name: t.name,
          slug: t.slug,
        }));

        if (translationsData.length > 0) {
          await tx.category_Translation.createMany({
            data: translationsData,
          });
        }
      }

      return await tx.category.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedCategory });
  } catch (error: any) {
    console.error("PUT Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật Category." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingCategory = await prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx: any) => {
      await tx.category_Translation.deleteMany({
        where: { category_id: id },
      });

      await tx.category.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE Category Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa Category. Có thể do dữ liệu này đang được sử dụng ở nơi khác." },
      { status: 500 }
    );
  }
}

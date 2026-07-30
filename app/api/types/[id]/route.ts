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
    
    const type = await prisma.attraction_Type.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!type) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: type });
  } catch (error: any) {
    console.error("GET Type Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy chi tiết Type." },
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
    const { icon, is_active, translations } = body;

    const existingType = await prisma.attraction_Type.findUnique({
      where: { id },
    });

    if (!existingType) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    const updatedType = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật bảng chính
      await tx.attraction_Type.update({
        where: { id },
        data: {
          icon: icon !== undefined ? icon : existingType.icon,
          is_active: is_active !== undefined ? is_active : existingType.is_active,
          updated_at: new Date(),
        },
      });

      // 2. Cập nhật bản dịch nếu có truyền lên
      if (translations && Array.isArray(translations)) {
        // Chiến lược: Xóa toàn bộ bản dịch cũ và insert lại cho sạch sẽ
        await tx.attraction_Type_Translation.deleteMany({
          where: { type_id: id },
        });

        const translationsData = translations.map((t: any) => ({
          type_id: id,
          language_code: t.language_code,
          name: t.name,
          slug: t.slug,
        }));

        if (translationsData.length > 0) {
          await tx.attraction_Type_Translation.createMany({
            data: translationsData,
          });
        }
      }

      return await tx.attraction_Type.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedType });
  } catch (error: any) {
    console.error("PUT Type Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật Type." },
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

    const existingType = await prisma.attraction_Type.findUnique({
      where: { id },
    });

    if (!existingType) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    // Xóa trong transaction để đảm bảo toàn vẹn
    await prisma.$transaction(async (tx) => {
      // Xóa bản dịch trước (Khóa ngoại)
      await tx.attraction_Type_Translation.deleteMany({
        where: { type_id: id },
      });

      // Xóa bảng chính
      await tx.attraction_Type.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE Type Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa Type. Có thể do dữ liệu này đang được sử dụng ở nơi khác." },
      { status: 500 }
    );
  }
}

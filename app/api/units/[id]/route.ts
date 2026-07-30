import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }
    
    const params = await props.params;
    const { id } = params;
    
    const unit = await prisma.unit.findUnique({
      where: { id },
      include: { translations: true },
    });

    if (!unit) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: unit });
  } catch (error: any) {
    console.error("GET Unit Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy chi tiết Unit." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const params = await props.params;
    const { id } = params;
    const body = await request.json();
    const { code, is_active, translations } = body;

    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    if (code && code !== existingUnit.code) {
      const codeCheck = await prisma.unit.findUnique({
        where: { code }
      });
      if (codeCheck) {
        return NextResponse.json(
          { success: false, message: "Mã đơn vị tính này đã tồn tại." },
          { status: 400 }
        );
      }
    }

    const updatedUnit = await prisma.$transaction(async (tx) => {
      // 1. Cập nhật bảng chính
      await tx.unit.update({
        where: { id },
        data: {
          code: code !== undefined ? code : existingUnit.code,
          is_active: is_active !== undefined ? is_active : existingUnit.is_active,
          updated_at: new Date(),
        },
      });

      // 2. Cập nhật bản dịch nếu có truyền lên
      if (translations && Array.isArray(translations)) {
        await tx.unit_Translation.deleteMany({
          where: { unit_id: id },
        });

        const translationsData = translations.map((t: any) => ({
          unit_id: id,
          language_code: t.language_code,
          name: t.name,
        }));

        if (translationsData.length > 0) {
          await tx.unit_Translation.createMany({
            data: translationsData,
          });
        }
      }

      return await tx.unit.findUnique({
        where: { id },
        include: { translations: true },
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedUnit });
  } catch (error: any) {
    console.error("PUT Unit Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật Unit." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const params = await props.params;
    const { id } = params;

    const existingUnit = await prisma.unit.findUnique({
      where: { id },
    });

    if (!existingUnit) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      await tx.unit_Translation.deleteMany({
        where: { unit_id: id },
      });

      await tx.unit.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE Unit Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa Unit. Có thể do dữ liệu này đang được sử dụng ở nơi khác." },
      { status: 500 }
    );
  }
}

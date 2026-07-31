import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { code } = await params;

    const language = await prisma.language.findUnique({
      where: { code },
    });

    if (!language) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy ngôn ngữ." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: language });
  } catch (error: any) {
    console.error("GET Language Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy thông tin ngôn ngữ." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { code } = await params;
    const body = await request.json();
    const { name, flag_icon, is_active } = body;

    const existingLanguage = await prisma.language.findUnique({
      where: { code },
    });

    if (!existingLanguage) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy ngôn ngữ để cập nhật." },
        { status: 404 }
      );
    }

    const updatedLanguage = await prisma.language.update({
      where: { code },
      data: {
        name: name !== undefined ? name : existingLanguage.name,
        flag_icon: flag_icon !== undefined ? flag_icon : existingLanguage.flag_icon,
        is_active: is_active !== undefined ? is_active : existingLanguage.is_active,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Cập nhật ngôn ngữ thành công!",
      data: updatedLanguage,
    });
  } catch (error: any) {
    console.error("PUT Language Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật ngôn ngữ." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { code } = await params;

    const existingLanguage = await prisma.language.findUnique({
      where: { code },
    });

    if (!existingLanguage) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy ngôn ngữ để xóa." },
        { status: 404 }
      );
    }

    await prisma.language.delete({
      where: { code },
    });

    return NextResponse.json({
      success: true,
      message: "Xóa ngôn ngữ thành công!",
    });
  } catch (error: any) {
    console.error("DELETE Language Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa ngôn ngữ. Có thể do dữ liệu này đang được liên kết ở nơi khác." },
      { status: 500 }
    );
  }
}

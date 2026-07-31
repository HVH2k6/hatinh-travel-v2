import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const district_name = searchParams.get('district_name');

    const wards = await prisma.ward.findMany({
      where: district_name ? {
        district_name: district_name
      } : undefined,
      orderBy: [
        { district_name: 'asc' },
        { name: 'asc' }
      ]
    });

    return NextResponse.json({ success: true, data: wards });
  } catch (error: any) {
    console.error("GET Wards Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Phường/Xã." },
      { status: 500 }
    );
  }
}

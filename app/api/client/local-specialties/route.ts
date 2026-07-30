import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const lang = searchParams.get('lang') || 'vi';
    
    const skip = (page - 1) * limit;

    const [specialties, total] = await Promise.all([
      prisma.local_Specialty.findMany({
        where: { status: 'active' },
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        include: {
          translations: {
            where: { language_code: lang }
          },
          category: {
            include: { translations: { where: { language_code: lang } } }
          },
          unit: {
            include: { translations: { where: { language_code: lang } } }
          },
          address: {
            include: {
              ward: true,
              translations: { where: { language_code: lang } }
            }
          }
        }
      }),
      prisma.local_Specialty.count({
        where: { status: 'active' }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: specialties,
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        total_items: total,
        per_page: limit
      }
    });
  } catch (error: any) {
    console.error("Client GET LocalSpecialties Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Đặc sản." },
      { status: 500 }
    );
  }
}

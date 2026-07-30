import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: Bạn không có quyền truy cập.' },
        { status: 403 }
      );
    }

    const roles = await prisma.role.findMany({
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({
      success: true,
      data: roles
    });
  } catch (error) {
    console.error('Error fetching roles:', error);
    return NextResponse.json(
      { success: false, message: 'Lỗi server khi lấy danh sách quyền' },
      { status: 500 }
    );
  }
}

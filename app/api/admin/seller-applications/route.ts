import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const whereClause: any = {};
    if (status && status !== 'all') {
      whereClause.status = status;
    }

    const [applications, total] = await Promise.all([
      prisma.seller_Application.findMany({
        where: whereClause,
        include: {
          user: true
        },
        orderBy: {
          created_at: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.seller_Application.count({
        where: whereClause
      })
    ]);

    return NextResponse.json({
      success: true,
      data: applications,
      total,
      page,
      last_page: Math.ceil(total / limit) || 1
    });

  } catch (error) {
    console.error('Error fetching seller applications:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

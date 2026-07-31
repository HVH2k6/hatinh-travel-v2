import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    // In Next.js 15, params is a Promise
    const { id } = await context.params;
    
    if (!id) {
      return NextResponse.json({ success: false, message: 'Thiếu ID đơn đăng ký' }, { status: 400 });
    }

    const body = await request.json();
    const { status, rejection_reason } = body;

    if (!['approved', 'rejected'].includes(status)) {
      return NextResponse.json({ success: false, message: 'Trạng thái không hợp lệ' }, { status: 400 });
    }

    if (status === 'rejected' && !rejection_reason) {
      return NextResponse.json({ success: false, message: 'Vui lòng cung cấp lý do từ chối' }, { status: 400 });
    }

    const application = await prisma.seller_Application.findUnique({
      where: { id }
    });

    if (!application) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy đơn đăng ký' }, { status: 404 });
    }

    if (status === 'approved') {
      // Tìm Role 'Seller'
      const sellerRole = await prisma.role.findFirst({
        where: { name: 'Seller' }
      });

      if (sellerRole) {
        // Cập nhật role của User
        await prisma.user.update({
          where: { id: application.user_id },
          data: { 
            roleId: sellerRole.id,
            status: true // Kích hoạt tài khoản nếu chưa
          }
        });
      }
    }

    // Cập nhật trạng thái đơn đăng ký
    const updatedApplication = await prisma.seller_Application.update({
      where: { id },
      data: {
        status,
        rejection_reason: status === 'rejected' ? rejection_reason : null,
        updated_at: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: status === 'approved' ? 'Đã duyệt đơn và cấp quyền Seller!' : 'Đã từ chối đơn đăng ký!',
      data: updatedApplication
    });

  } catch (error) {
    console.error('Lỗi cập nhật đơn đăng ký:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }
    const { id } = await params;
    const shop = await prisma.shop.findUnique({
      where: { id },
      include: {
        user: {
          select: { email: true, username: true, phoneNumber: true }
        },
        translations: true,
        address: {
          include: { translations: true }
        }
      }
    });

    if (!shop) {
      return NextResponse.json({ success: false, message: 'Shop không tồn tại' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: shop });
  } catch (error) {
    console.error('Lỗi khi lấy thông tin shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { status } = body;

    const existingShop = await prisma.shop.findUnique({
      where: { id }
    });

    if (!existingShop) {
      return NextResponse.json({ success: false, message: 'Shop không tồn tại' }, { status: 404 });
    }

    const updatedShop = await prisma.shop.update({
      where: { id },
      data: {
        status: status !== undefined ? status : existingShop.status,
        updated_at: new Date()
      }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật shop thành công', data: updatedShop });
  } catch (error) {
    console.error('Lỗi khi cập nhật shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // TODO: Verify if cascading delete is needed or manually delete related records
    // Hiện tại chỉ xóa translations của shop và shop
    await prisma.$transaction([
      prisma.shop_Translation.deleteMany({
        where: { shop_id: id }
      }),
      prisma.shop.delete({
        where: { id }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Xóa shop thành công' });
  } catch (error) {
    console.error('Lỗi khi xóa shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server (Có thể Shop đang có sản phẩm)' }, { status: 500 });
  }
}

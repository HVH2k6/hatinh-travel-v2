import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const userId = await checkUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập để xem thông tin' }, { status: 401 });
    }

    const applications = await prisma.seller_Application.findMany({
      where: {
        user_id: userId
      },
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({
      success: true,
      data: applications
    });
  } catch (error) {
    console.error('Lỗi khi lấy danh sách đơn đăng ký:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const userId = await checkUser();
    if (!userId) {
      return NextResponse.json({ success: false, message: 'Vui lòng đăng nhập để thực hiện chức năng này' }, { status: 401 });
    }

    const body = await request.json();
    const { shop_name, phone_number, description, documents, social_media } = body;

    if (!shop_name || !phone_number || !documents) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ các thông tin bắt buộc' }, { status: 400 });
    }

    // Kiểm tra xem đã có đơn đăng ký nào đang ở trạng thái pending chưa
    const existingApplication = await prisma.seller_Application.findFirst({
      where: {
        user_id: userId,
        status: 'pending'
      }
    });

    if (existingApplication) {
      return NextResponse.json({ success: false, message: 'Bạn đã có một đơn đăng ký đang chờ duyệt' }, { status: 400 });
    }

    const application = await prisma.seller_Application.create({
      data: {
        user_id: userId,
        shop_name: shop_name,
        phone_number: phone_number,
        description: description || null,
        documents: documents, // JSON string or object from frontend
        social_media: social_media || null,
        status: 'pending'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Gửi đơn đăng ký mở cửa hàng thành công!',
      data: application
    }, { status: 201 });

  } catch (error) {
    console.error('Lỗi khi tạo đơn đăng ký mở cửa hàng:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tạo đơn đăng ký' }, { status: 500 });
  }
}

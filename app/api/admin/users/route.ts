import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: { role: true }
      }),
      prisma.user.count()
    ]);

    const usersWithoutPassword = users.map(u => {
      const { password, ...userWithoutPassword } = u;
      return userWithoutPassword;
    });

    return NextResponse.json({
      success: true,
      data: usersWithoutPassword,
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        total
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, password, roleId, status } = body;

    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email và Password là bắt buộc' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ success: false, message: 'Email này đã tồn tại' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: username || '',
        email,
        password: hashedPassword,
        roleId: roleId || null,
        status: status !== undefined ? status : true,
      }
    });

    const { password: _, ...userWithoutPassword } = newUser;

    return NextResponse.json({ success: true, data: userWithoutPassword, message: 'Tạo tài khoản thành công' });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi tạo tài khoản' }, { status: 500 });
  }
}

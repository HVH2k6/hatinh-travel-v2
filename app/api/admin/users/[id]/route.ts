import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkAdmin } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const { username, email, password, roleId, status } = body;

    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: id } }
      });
      if (existingUser) {
        return NextResponse.json({ success: false, message: 'Email này đã tồn tại ở tài khoản khác' }, { status: 400 });
      }
    }

    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email;
    if (roleId !== undefined) updateData.roleId = roleId || null;
    if (status !== undefined) updateData.status = status;
    
    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    updateData.updatedAt = new Date();

    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData
    });

    const { password: _, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({ success: true, data: userWithoutPassword, message: 'Cập nhật tài khoản thành công' });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi cập nhật tài khoản' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Forbidden' }, { status: 403 });
    }

    // Soft delete by updating status to false
    await prisma.user.update({
      where: { id },
      data: { status: false, updatedAt: new Date() }
    });

    return NextResponse.json({ success: true, message: 'Khóa tài khoản thành công' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server khi khóa tài khoản' }, { status: 500 });
  }
}

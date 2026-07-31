import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';
import { checkAdmin } from '@/lib/auth';


export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    const blog = await prisma.blog.findUnique({
      where: { id },
    });

    if (!blog) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: blog });
  } catch (error) {
    console.error('Error fetching blog:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;
    const data = await request.json();
    const { name, image, list_image, content, author, is_active } = data;

    const existingBlog = await prisma.blog.findUnique({ where: { id } });
    if (!existingBlog) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    let slug = existingBlog.slug;
    // If name changed, optionally update slug, but usually we just keep or update it
    if (name && name !== existingBlog.name) {
      slug = slugify(name, { lower: true, locale: 'vi', strict: true });
      let count = 1;
      let uniqueSlug = slug;
      while (await prisma.blog.findFirst({ where: { slug: uniqueSlug, NOT: { id } } })) {
        uniqueSlug = `${slug}-${count}`;
        count++;
      }
      slug = uniqueSlug;
    }

    const updatedBlog = await prisma.blog.update({
      where: { id },
      data: {
        ...(name && { name }),
        slug,
        ...(image && { image }),
        ...(list_image !== undefined && { list_image }),
        ...(content && { content }),
        ...(author !== undefined && { author }),
        ...(is_active !== undefined && { is_active }),
      },
    });

    return NextResponse.json({ success: true, data: updatedBlog, message: 'Cập nhật bài viết thành công' });
  } catch (error) {
    console.error('Error updating blog:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await props.params;

    const existingBlog = await prisma.blog.findUnique({ where: { id } });
    if (!existingBlog) {
      return NextResponse.json({ success: false, message: 'Không tìm thấy bài viết' }, { status: 404 });
    }

    await prisma.blog.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: 'Xóa bài viết thành công' });
  } catch (error) {
    console.error('Error deleting blog:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import slugify from 'slugify';
import { checkAdmin } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const search = searchParams.get('search') || '';
    
    const skip = (page - 1) * limit;

    const where = {
      ...(search ? { name: { contains: search, mode: 'insensitive' as any } } : {}),
    };

    const [blogs, total] = await Promise.all([
      prisma.blog.findMany({
        where,
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
      }),
      prisma.blog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: blogs,
      pagination: {
        current_page: page,
        last_page: Math.ceil(total / limit) || 1,
        total_items: total,
        per_page: limit,
      },
    });
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    const { name, image, list_image, content, author, is_active } = data;

    if (!name || !content || !image) {
      return NextResponse.json({ success: false, message: 'Vui lòng điền đầy đủ tiêu đề, nội dung và ảnh bìa' }, { status: 400 });
    }

    let slug = slugify(name, { lower: true, locale: 'vi', strict: true });
    
    // Ensure slug is unique
    let count = 1;
    let uniqueSlug = slug;
    while (await prisma.blog.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${count}`;
      count++;
    }

    const newBlog = await prisma.blog.create({
      data: {
        name,
        slug: uniqueSlug,
        image,
        list_image: list_image || [],
        content,
        author: author || '',
        is_active: is_active ?? true,
      },
    });

    return NextResponse.json({ success: true, data: newBlog, message: 'Tạo bài viết thành công' });
  } catch (error) {
    console.error('Error creating blog:', error);
    return NextResponse.json({ success: false, message: 'Lỗi server' }, { status: 500 });
  }
}

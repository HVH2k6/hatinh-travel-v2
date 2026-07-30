import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

function slugify(text: string) {
  return text.toString().toLowerCase()
    .replace(/á|à|ả|ạ|ã|ă|ắ|ằ|ẳ|ẵ|ặ|â|ấ|ầ|ẩ|ẫ|ậ/gi, 'a')
    .replace(/é|è|ẻ|ẽ|ẹ|ê|ế|ề|ể|ễ|ệ/gi, 'e')
    .replace(/i|í|ì|ỉ|ĩ|ị/gi, 'i')
    .replace(/ó|ò|ỏ|õ|ọ|ô|ố|ồ|ổ|ỗ|ộ|ơ|ớ|ờ|ở|ỡ|ợ/gi, 'o')
    .replace(/ú|ù|ủ|ũ|ụ|ư|ứ|ừ|ử|ữ|ự/gi, 'u')
    .replace(/ý|ỳ|ỷ|ỹ|ỵ/gi, 'y')
    .replace(/đ/gi, 'd')
    .replace(/\s+/g, '-')           
    .replace(/[^\w\-]+/g, '')       
    .replace(/\-\-+/g, '-')         
    .replace(/^-+/, '')             
    .replace(/-+$/, '');            
}

async function getSellerShop() {
  const userId = await checkUser();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, shop: true }
  });

  if (!user || user.role?.name !== 'Seller' || !user.shop) return null;
  return user.shop;
}

export async function GET(request: Request) {
  try {
    const shop = await getSellerShop();
    if (!shop) {
      return NextResponse.json({ success: false, message: 'Unauthorized, or you do not have a shop yet.' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where: { shop_id: shop.id },
        include: {
          translations: true,
          unit: {
            include: { translations: true }
          }
        },
        orderBy: { created_at: 'desc' },
        skip,
        take: limit
      }),
      prisma.product.count({
        where: { shop_id: shop.id }
      })
    ]);

    return NextResponse.json({
      success: true,
      data: products,
      total,
      page,
      last_page: Math.ceil(total / limit) || 1
    });

  } catch (error) {
    console.error('Error fetching seller products:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const shop = await getSellerShop();
    if (!shop) {
      return NextResponse.json({ success: false, message: 'Unauthorized, or you do not have a shop yet.' }, { status: 403 });
    }

    const body = await request.json();
    const { price, image, list_image, status, is_featured, unit_id, translations } = body;

    const product = await prisma.product.create({
      data: {
        shop_id: shop.id,
        price: price || 0,
        image: image || '',
        list_image: list_image || [],
        status: status || 'active',
        is_featured: is_featured || false,
        unit_id: unit_id || null,
        translations: {
          create: translations?.map((t: any) => ({
            language_code: t.language_code,
            name: t.name,
            slug: slugify(t.name),
            description: t.description
          })) || []
        }
      },
      include: {
        translations: true
      }
    });

    return NextResponse.json({ success: true, message: 'Thêm sản phẩm thành công', data: product });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

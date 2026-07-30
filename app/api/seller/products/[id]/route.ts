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

export async function GET(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const shop = await getSellerShop();
    if (!shop) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });

    const { id } = await context.params;
    const product = await prisma.product.findFirst({
      where: { id, shop_id: shop.id },
      include: {
        translations: true,
      }
    });

    if (!product) return NextResponse.json({ success: false, message: 'Không tìm thấy sản phẩm' }, { status: 404 });
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const shop = await getSellerShop();
    if (!shop) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });

    const { id } = await context.params;
    const existingProduct = await prisma.product.findFirst({
      where: { id, shop_id: shop.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Sản phẩm không tồn tại hoặc không có quyền truy cập' }, { status: 404 });
    }

    const body = await request.json();
    const { price, image, list_image, status, is_featured, unit_id, translations } = body;

    await prisma.product.update({
      where: { id },
      data: {
        price,
        image,
        list_image,
        status,
        is_featured,
        unit_id,
        updated_at: new Date()
      }
    });

    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        if (!t.language_code || !t.name) continue;
        
        await prisma.product_Translation.upsert({
          where: {
            id: t.id || '00000000-0000-0000-0000-000000000000'
          },
          create: {
            product_id: id,
            language_code: t.language_code,
            name: t.name,
            slug: slugify(t.name),
            description: t.description
          },
          update: {
            name: t.name,
            slug: slugify(t.name),
            description: t.description,
            updated_at: new Date()
          }
        }).catch(async () => {
          const existingTrans = await prisma.product_Translation.findFirst({
            where: { product_id: id, language_code: t.language_code }
          });
          if (existingTrans) {
            await prisma.product_Translation.update({
              where: { id: existingTrans.id },
              data: {
                name: t.name,
                slug: slugify(t.name),
                description: t.description,
                updated_at: new Date()
              }
            });
          } else {
            await prisma.product_Translation.create({
              data: {
                product_id: id,
                language_code: t.language_code,
                name: t.name,
                slug: slugify(t.name),
                description: t.description
              }
            });
          }
        });
      }
    }

    const updatedProduct = await prisma.product.findUnique({
      where: { id },
      include: { translations: true }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật thành công', data: updatedProduct });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function DELETE(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const shop = await getSellerShop();
    if (!shop) return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 403 });

    const { id } = await context.params;
    const existingProduct = await prisma.product.findFirst({
      where: { id, shop_id: shop.id }
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, message: 'Sản phẩm không tồn tại' }, { status: 404 });
    }

    await prisma.product_Translation.deleteMany({
      where: { product_id: id }
    });

    await prisma.product.delete({
      where: { id }
    });

    return NextResponse.json({ success: true, message: 'Xóa sản phẩm thành công' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

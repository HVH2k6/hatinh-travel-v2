import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { checkUser } from '@/lib/auth';

function slugify(text: string, p0?: { lower: boolean; locale: string; }) {
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

// Hàm helper để check quyền Seller
async function getSellerUser() {
  const userId = await checkUser();
  if (!userId) return null;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true }
  });

  if (!user || user.role?.name !== 'Seller') return null;
  return user;
}

export async function GET(request: Request) {
  try {
    const user = await getSellerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized or not a Seller' }, { status: 403 });
    }

    const shop = await prisma.shop.findUnique({
      where: { user_id: user.id },
      include: {
        translations: true,
        address: true
      }
    });

    if (!shop) {
      return NextResponse.json({ success: true, data: null, message: 'Chưa có cửa hàng' });
    }

    return NextResponse.json({ success: true, data: shop });
  } catch (error) {
    console.error('Error fetching seller shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const user = await getSellerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized or not a Seller' }, { status: 403 });
    }

    // Kiểm tra xem đã có cửa hàng chưa
    const existingShop = await prisma.shop.findUnique({
      where: { user_id: user.id }
    });

    if (existingShop) {
      return NextResponse.json({ success: false, message: 'Cửa hàng đã tồn tại' }, { status: 400 });
    }

    const body = await request.json();
    const { phone_number, contact_email, logo_url, cover_image_url, ward_code, map_url, translations } = body;

    let address_id = null;
    if (ward_code) {
      const address = await prisma.address.create({
        data: {
          ward_code: Number(ward_code),
          map_url: map_url || '',
          translations: {
            create: translations?.map((t: any) => ({
              language_code: t.language_code,
              detail: t.address_detail || ''
            })).filter((t: any) => t.detail !== '') || []
          }
        }
      });
      address_id = address.id;
    }

    const shop = await prisma.shop.create({
      data: {
        user_id: user.id,
        phone_number,
        contact_email,
        logo_url,
        cover_image_url,
        address_id,
        translations: {
          create: translations?.map((t: any) => ({
            language_code: t.language_code,
            name: t.name,
            slug: slugify(t.name, { lower: true, locale: 'vi' }),
            description: t.description
          })) || []
        }
      },
      include: {
        translations: true,
        address: { include: { translations: true } }
      }
    });

    return NextResponse.json({ success: true, message: 'Tạo cửa hàng thành công', data: shop });
  } catch (error) {
    console.error('Error creating shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const user = await getSellerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized or not a Seller' }, { status: 403 });
    }

    const existingShop = await prisma.shop.findUnique({
      where: { user_id: user.id }
    });

    if (!existingShop) {
      return NextResponse.json({ success: false, message: 'Cửa hàng không tồn tại' }, { status: 404 });
    }

    const body = await request.json();
    const { phone_number, contact_email, logo_url, cover_image_url, ward_code, map_url, status, translations } = body;

    let address_id = existingShop.address_id;
    if (ward_code) {
      if (address_id) {
        // Update existing address
        await prisma.address.update({
          where: { id: address_id },
          data: {
            ward_code: Number(ward_code),
            map_url: map_url || '',
            updated_at: new Date()
          }
        });
        
        // Handle address translations
        for (const t of translations || []) {
          if (!t.language_code || !t.address_detail) continue;
          
          await prisma.address_Translation.upsert({
            where: {
              id: t.address_id || '00000000-0000-0000-0000-000000000000'
            },
            create: {
              address_id: address_id,
              language_code: t.language_code,
              detail: t.address_detail
            },
            update: {
              detail: t.address_detail,
              updated_at: new Date()
            }
          }).catch(async () => {
            const existingTrans = await prisma.address_Translation.findFirst({
              where: { address_id: address_id as string, language_code: t.language_code }
            });
            if (existingTrans) {
              await prisma.address_Translation.update({
                where: { id: existingTrans.id },
                data: { detail: t.address_detail, updated_at: new Date() }
              });
            } else {
              await prisma.address_Translation.create({
                data: { address_id: address_id as string, language_code: t.language_code, detail: t.address_detail }
              });
            }
          });
        }
      } else {
        // Create new address
        const address = await prisma.address.create({
          data: {
            ward_code: Number(ward_code),
            map_url: map_url || '',
            translations: {
              create: translations?.map((t: any) => ({
                language_code: t.language_code,
                detail: t.address_detail || ''
              })).filter((t: any) => t.detail !== '') || []
            }
          }
        });
        address_id = address.id;
      }
    }

    // Update the basic info
    const updatedShop = await prisma.shop.update({
      where: { id: existingShop.id },
      data: {
        phone_number,
        contact_email,
        logo_url,
        cover_image_url,
        address_id,
        status,
        updated_at: new Date()
      }
    });

    // Handle translations if provided
    if (translations && Array.isArray(translations)) {
      for (const t of translations) {
        if (!t.language_code || !t.name) continue;

        await prisma.shop_Translation.upsert({
          where: {
            id: t.id || '00000000-0000-0000-0000-000000000000' // fake id to force create if id not present
          },
          create: {
            shop_id: existingShop.id,
            language_code: t.language_code,
            name: t.name,
            slug: slugify(t.name, { lower: true, locale: 'vi' }),
            description: t.description
          },
          update: {
            name: t.name,
            slug: slugify(t.name, { lower: true, locale: 'vi' }),
            description: t.description,
            updated_at: new Date()
          }
        }).catch(async (e: any) => {
          // If upsert fails because we couldn't match ID, let's find by shop_id and language_code
          const existingTrans = await prisma.shop_Translation.findFirst({
            where: { shop_id: existingShop.id, language_code: t.language_code }
          });
          if (existingTrans) {
            await prisma.shop_Translation.update({
              where: { id: existingTrans.id },
              data: {
                name: t.name,
                slug: slugify(t.name, { lower: true, locale: 'vi' }),
                description: t.description,
                updated_at: new Date()
              }
            });
          } else {
            await prisma.shop_Translation.create({
              data: {
                shop_id: existingShop.id,
                language_code: t.language_code,
                name: t.name,
                slug: slugify(t.name, { lower: true, locale: 'vi' }),
                description: t.description
              }
            });
          }
        });
      }
    }

    const finalShop = await prisma.shop.findUnique({
      where: { id: existingShop.id },
      include: { translations: true, address: true }
    });

    return NextResponse.json({ success: true, message: 'Cập nhật thành công', data: finalShop });
  } catch (error) {
    console.error('Error updating shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const user = await getSellerUser();
    if (!user) {
      return NextResponse.json({ success: false, message: 'Unauthorized or not a Seller' }, { status: 403 });
    }

    const existingShop = await prisma.shop.findUnique({
      where: { user_id: user.id }
    });

    if (!existingShop) {
      return NextResponse.json({ success: false, message: 'Cửa hàng không tồn tại' }, { status: 404 });
    }

    // Xóa các translations trước (do Foreign Key)
    await prisma.shop_Translation.deleteMany({
      where: { shop_id: existingShop.id }
    });

    // Xóa sản phẩm thuộc cửa hàng
    const products = await prisma.product.findMany({ where: { shop_id: existingShop.id } });
    for (const p of products) {
      await prisma.product_Translation.deleteMany({ where: { product_id: p.id } });
    }
    await prisma.product.deleteMany({
      where: { shop_id: existingShop.id }
    });

    // Cuối cùng xóa cửa hàng
    await prisma.shop.delete({
      where: { id: existingShop.id }
    });

    return NextResponse.json({ success: true, message: 'Xóa cửa hàng thành công' });
  } catch (error) {
    console.error('Error deleting shop:', error);
    return NextResponse.json({ success: false, message: 'Lỗi hệ thống khi xóa cửa hàng' }, { status: 500 });
  }
}

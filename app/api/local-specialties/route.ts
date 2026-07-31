import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';

    const localSpecialties = await prisma.local_Specialty.findMany({
      include: {
        translations: true,
        category: {
          include: { translations: true }
        },
        unit: {
          include: { translations: true }
        },
        address: {
          include: {
            ward: true,
            translations: true
          }
        }
      },
      where: search ? {
        translations: {
          some: {
            name: {
              contains: search,
              mode: 'insensitive',
            }
          }
        }
      } : undefined,
      orderBy: {
        created_at: 'desc'
      }
    });

    return NextResponse.json({ success: true, data: localSpecialties });
  } catch (error: any) {
    console.error("GET LocalSpecialties Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Đặc sản địa phương." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { 
      translations, 
      ward_code, 
      map_url, 
      image, 
      list_image, 
      category_id,
      unit_id,
      price,
      status, 
      is_featured 
    } = body;

    // Validate
    if (!translations || !Array.isArray(translations) || translations.length === 0) {
      return NextResponse.json(
        { success: false, message: "Vui lòng cung cấp ít nhất 1 bản dịch (ví dụ Tiếng Việt)." },
        { status: 400 }
      );
    }

    let addressId: string | undefined = undefined;

    const newLocalSpecialty = await prisma.$transaction(async (tx: any) => {
      // 1. Tạo Address nếu có chọn ward_code
      if (ward_code) {
        const address = await tx.address.create({
          data: {
            ward_code: parseInt(ward_code.toString(), 10),
            map_url: map_url || null,
          }
        });
        addressId = address.id;

        // Tạo bản dịch cho address
        const addressTranslationsData: any[] = [];
        for (const t of translations) {
          if (t.address_detail) {
            addressTranslationsData.push({
              address_id: address.id,
              language_code: t.language_code,
              detail: t.address_detail,
            });
          }
        }
        if (addressTranslationsData.length > 0) {
          await tx.address_Translation.createMany({
            data: addressTranslationsData,
          });
        }
      }

      // 2. Tạo Local Specialty
      const localSpecialty = await tx.local_Specialty.create({
        data: {
          image: image || null,
          list_image: Array.isArray(list_image) ? list_image : (list_image ? [list_image] : []),
          category_id: category_id || null,
          unit_id: unit_id || null,
          address_id: addressId,
          price: price ? parseFloat(price.toString()) : 0,
          status: status || 'active',
          is_featured: is_featured !== undefined ? is_featured : false,
        }
      });

      // 3. Tạo các bản dịch
      const specialtyTranslationsData: any[] = [];

      for (const t of translations) {
        if (t.name) {
          specialtyTranslationsData.push({
            local_specialty_id: localSpecialty.id,
            language_code: t.language_code,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
            ingredients: t.ingredients || null,
          });
        }
      }

      if (specialtyTranslationsData.length > 0) {
        await tx.local_Specialty_Translation.createMany({
          data: specialtyTranslationsData,
        });
      }

      return await tx.local_Specialty.findUnique({
        where: { id: localSpecialty.id },
        include: { 
          translations: true,
          address: {
            include: { translations: true }
          }
        },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo mới thành công", data: newLocalSpecialty });
  } catch (error: any) {
    console.error("POST LocalSpecialty Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo mới Đặc sản địa phương." },
      { status: 500 }
    );
  }
}

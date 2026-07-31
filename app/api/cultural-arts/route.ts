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

    const culturalArts = await prisma.cultural_Art.findMany({
      include: {
        translations: true,
        category: {
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

    return NextResponse.json({ success: true, data: culturalArts });
  } catch (error: any) {
    console.error("GET CulturalArts Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Văn hóa nghệ thuật." },
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
      link_video,
      category_id,
      position,
      is_active, 
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

    const newCulturalArt = await prisma.$transaction(async (tx: any) => {
      // 1. Tạo Address nếu có chọn ward_code
      if (ward_code) {
        const address = await tx.address.create({
          data: {
            ward_code: parseInt(ward_code.toString(), 10),
            map_url: map_url || null,
          }
        });
        addressId = address.id;

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

      // 2. Tạo Cultural Art
      const culturalArt = await tx.cultural_Art.create({
        data: {
          image: image || null,
          list_image: Array.isArray(list_image) ? list_image : (list_image ? [list_image] : []),
          link_video: link_video || null,
          category_id: category_id || null,
          address_id: addressId,
          position: position ? parseInt(position.toString(), 10) : 0,
          is_active: is_active !== undefined ? is_active : true,
          is_featured: is_featured !== undefined ? is_featured : false,
        }
      });

      // 3. Tạo các bản dịch
      const artTranslationsData: any[] = [];

      for (const t of translations) {
        if (t.name) {
          artTranslationsData.push({
            cultural_art_id: culturalArt.id,
            language_code: t.language_code,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
          });
        }
      }

      if (artTranslationsData.length > 0) {
        await tx.cultural_Art_Translation.createMany({
          data: artTranslationsData,
        });
      }

      return await tx.cultural_Art.findUnique({
        where: { id: culturalArt.id },
        include: { 
          translations: true,
          address: {
            include: { translations: true }
          }
        },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo mới thành công", data: newCulturalArt });
  } catch (error: any) {
    console.error("POST CulturalArt Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo mới Văn hóa nghệ thuật." },
      { status: 500 }
    );
  }
}

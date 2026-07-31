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

    const attractions = await prisma.tourist_Attraction.findMany({
      include: {
        translations: true,
        category: {
          include: { translations: true }
        },
        type: {
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

    return NextResponse.json({ success: true, data: attractions });
  } catch (error: any) {
    console.error("GET Attractions Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy danh sách Điểm du lịch." },
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
      sub_image, 
      category_id, 
      type_id, 
      opening_time, 
      closing_time, 
      min_price, 
      max_price, 
      phone_number, 
      website, 
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

    if (!ward_code) {
      return NextResponse.json(
        { success: false, message: "Bắt buộc phải chọn Xã/Phường." },
        { status: 400 }
      );
    }

    const newAttraction = await prisma.$transaction(async (tx: any) => {
      // 1. Tạo Address
      const address = await tx.address.create({
        data: {
          ward_code: parseInt(ward_code.toString(), 10),
          map_url: map_url || null,
        }
      });

      // 2. Tạo Tourist Attraction
      // Note: opening_time / closing_time need to be valid Date objects if provided
      const attraction = await tx.tourist_Attraction.create({
        data: {
          image: image || null,
          sub_image: Array.isArray(sub_image) ? sub_image : (sub_image ? [sub_image] : []),
          category_id: category_id || null,
          type_id: type_id || null,
          address_id: address.id,
          opening_time: opening_time ? new Date(opening_time) : null,
          closing_time: closing_time ? new Date(closing_time) : null,
          min_price: min_price ? parseFloat(min_price.toString()) : 0,
          max_price: max_price ? parseFloat(max_price.toString()) : 0,
          phone_number: phone_number || null,
          website: website || null,
          is_active: is_active !== undefined ? is_active : true,
          is_featured: is_featured !== undefined ? is_featured : false,
        }
      });

      // 3. Tạo các bản dịch
      const attractionTranslationsData: any[] = [];
      const addressTranslationsData: any[] = [];

      for (const t of translations) {
        if (t.name) {
          attractionTranslationsData.push({
            attraction_id: attraction.id,
            language_code: t.language_code,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
          });
        }
        if (t.address_detail) {
          addressTranslationsData.push({
            address_id: address.id,
            language_code: t.language_code,
            detail: t.address_detail,
          });
        }
      }

      if (attractionTranslationsData.length > 0) {
        await tx.tourist_Attraction_Translation.createMany({
          data: attractionTranslationsData,
        });
      }

      if (addressTranslationsData.length > 0) {
        await tx.address_Translation.createMany({
          data: addressTranslationsData,
        });
      }

      return await tx.tourist_Attraction.findUnique({
        where: { id: attraction.id },
        include: { 
          translations: true,
          address: {
            include: { translations: true }
          }
        },
      });
    });

    return NextResponse.json({ success: true, message: "Tạo mới thành công", data: newAttraction });
  } catch (error: any) {
    console.error("POST Attraction Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi tạo mới Điểm du lịch." },
      { status: 500 }
    );
  }
}

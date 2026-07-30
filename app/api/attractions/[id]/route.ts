import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }
    
    const { id } = await params;
    
    const attraction = await prisma.tourist_Attraction.findUnique({
      where: { id },
      include: { 
        translations: true,
        address: {
          include: { translations: true }
        }
      },
    });

    if (!attraction) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: attraction });
  } catch (error: any) {
    console.error("GET Attraction Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi lấy chi tiết Điểm du lịch." },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { id } = await params;
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

    const existingAttraction = await prisma.tourist_Attraction.findUnique({
      where: { id },
    });

    if (!existingAttraction) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    const updatedAttraction = await prisma.$transaction(async (tx) => {
      // 1. Xử lý Address
      let addressId = existingAttraction.address_id;
      
      if (addressId) {
        // Cập nhật Address cũ
        await tx.address.update({
          where: { id: addressId },
          data: {
            ward_code: ward_code !== undefined ? parseInt(ward_code.toString(), 10) : undefined,
            map_url: map_url !== undefined ? map_url : undefined,
            updated_at: new Date(),
          }
        });
      } else if (ward_code) {
        // Tạo Address mới nếu chưa có
        const newAddress = await tx.address.create({
          data: {
            ward_code: parseInt(ward_code.toString(), 10),
            map_url: map_url || null,
          }
        });
        addressId = newAddress.id;
      }

      // 2. Cập nhật Attraction
      await tx.tourist_Attraction.update({
        where: { id },
        data: {
          image: image !== undefined ? image : existingAttraction.image,
          sub_image: (sub_image !== undefined ? (Array.isArray(sub_image) ? sub_image : (sub_image ? [sub_image] : [])) : existingAttraction.sub_image) as any,
          category_id: category_id !== undefined ? category_id : existingAttraction.category_id,
          type_id: type_id !== undefined ? type_id : existingAttraction.type_id,
          address_id: addressId,
          opening_time: opening_time !== undefined ? (opening_time ? new Date(opening_time) : null) : existingAttraction.opening_time,
          closing_time: closing_time !== undefined ? (closing_time ? new Date(closing_time) : null) : existingAttraction.closing_time,
          min_price: min_price !== undefined ? parseFloat(min_price.toString()) : existingAttraction.min_price,
          max_price: max_price !== undefined ? parseFloat(max_price.toString()) : existingAttraction.max_price,
          phone_number: phone_number !== undefined ? phone_number : existingAttraction.phone_number,
          website: website !== undefined ? website : existingAttraction.website,
          is_active: is_active !== undefined ? is_active : existingAttraction.is_active,
          is_featured: is_featured !== undefined ? is_featured : existingAttraction.is_featured,
          updated_at: new Date(),
        },
      });

      // 3. Xử lý translations
      if (translations && Array.isArray(translations)) {
        // Xóa sạch bản dịch cũ của Attraction
        await tx.tourist_Attraction_Translation.deleteMany({
          where: { attraction_id: id },
        });

        // Xóa sạch bản dịch cũ của Address (nếu có)
        if (addressId) {
          await tx.address_Translation.deleteMany({
            where: { address_id: addressId },
          });
        }

        const attractionTranslationsData: any[] = [];
        const addressTranslationsData: any[] = [];

        for (const t of translations) {
          if (t.name) {
            attractionTranslationsData.push({
              attraction_id: id,
              language_code: t.language_code,
              name: t.name,
              slug: t.slug,
              description: t.description || null,
            });
          }
          if (t.address_detail && addressId) {
            addressTranslationsData.push({
              address_id: addressId,
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
      }

      return await tx.tourist_Attraction.findUnique({
        where: { id },
        include: { 
          translations: true,
          address: {
            include: { translations: true }
          }
        },
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedAttraction });
  } catch (error: any) {
    console.error("PUT Attraction Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi cập nhật Điểm du lịch." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Bạn không có quyền truy cập." },
        { status: 403 }
      );
    }

    const { id } = await params;

    const existingAttraction = await prisma.tourist_Attraction.findUnique({
      where: { id },
    });

    if (!existingAttraction) {
      return NextResponse.json(
        { success: false, message: "Không tìm thấy dữ liệu." },
        { status: 404 }
      );
    }

    await prisma.$transaction(async (tx) => {
      // 1. Xóa bản dịch của attraction
      await tx.tourist_Attraction_Translation.deleteMany({
        where: { attraction_id: id },
      });

      // 2. Xóa bản thân attraction
      await tx.tourist_Attraction.delete({
        where: { id },
      });

      // 3. Nếu có address, xóa address_translation và address đó luôn
      // (Bởi vì logic là mỗi attraction tạo ra 1 address riêng biệt lúc create)
      if (existingAttraction.address_id) {
        // Kiểm tra xem address này có đang bị dùng ở đâu khác không (Shop, Local_Specialty...)
        // Ở đây schema của chúng ta tạo address riêng biệt lúc create attraction, nên khá an toàn để xóa
        // Tuy nhiên để đảm bảo toàn vẹn nếu lỡ ai đó link vào, ta kiểm tra số lượng
        const shopCount = await tx.shop.count({ where: { address_id: existingAttraction.address_id }});
        const specialtyCount = await tx.local_Specialty.count({ where: { address_id: existingAttraction.address_id }});
        const artCount = await tx.cultural_Art.count({ where: { address_id: existingAttraction.address_id }});

        if (shopCount === 0 && specialtyCount === 0 && artCount === 0) {
          await tx.address_Translation.deleteMany({
            where: { address_id: existingAttraction.address_id },
          });
          await tx.address.delete({
            where: { id: existingAttraction.address_id },
          });
        }
      }
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE Attraction Error:", error);
    return NextResponse.json(
      { success: false, message: "Lỗi khi xóa Điểm du lịch. Có thể do dữ liệu này đang được sử dụng ở nơi khác." },
      { status: 500 }
    );
  }
}

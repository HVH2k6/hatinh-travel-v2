import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { checkAdmin } from "@/lib/auth";

export async function GET(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

    let culturalArt;

    if (isUUID) {
      culturalArt = await prisma.cultural_Art.findUnique({
        where: { id },
        include: {
          translations: true,
          address: {
            include: { translations: true }
          }
        }
      });
    } else {
      const translation = await prisma.cultural_Art_Translation.findFirst({
        where: { slug: id }
      });

      if (translation) {
        culturalArt = await prisma.cultural_Art.findUnique({
          where: { id: translation.cultural_art_id, is_active: true },
          include: {
            translations: true,
            address: {
              include: { translations: true }
            }
          }
        });
      }
    }

    if (!culturalArt) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: culturalArt });
  } catch (error: any) {
    console.error("GET CulturalArt Detail Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;
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

    const existingCulturalArt = await prisma.cultural_Art.findUnique({
      where: { id },
      include: { address: true }
    });

    if (!existingCulturalArt) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    const updatedCulturalArt = await prisma.$transaction(async (tx) => {
      let addressId = existingCulturalArt.address_id;

      if (ward_code) {
        if (addressId) {
          await tx.address.update({
            where: { id: addressId },
            data: {
              ward_code: parseInt(ward_code.toString(), 10),
              map_url: map_url !== undefined ? map_url : existingCulturalArt.address?.map_url,
            }
          });
        } else {
          const newAddress = await tx.address.create({
            data: {
              ward_code: parseInt(ward_code.toString(), 10),
              map_url: map_url || null,
            }
          });
          addressId = newAddress.id;
        }

        if (translations && Array.isArray(translations)) {
          await tx.address_Translation.deleteMany({
            where: { address_id: addressId }
          });
          const addressTranslationsData = translations
            .filter((t: any) => t.address_detail)
            .map((t: any) => ({
              address_id: addressId as string,
              language_code: t.language_code,
              detail: t.address_detail,
            }));
          
          if (addressTranslationsData.length > 0) {
            await tx.address_Translation.createMany({ data: addressTranslationsData });
          }
        }
      }

      await tx.cultural_Art.update({
        where: { id },
        data: {
          image: image !== undefined ? image : existingCulturalArt.image,
          list_image: (list_image !== undefined ? (Array.isArray(list_image) ? list_image : (list_image ? [list_image] : [])) : existingCulturalArt.list_image) as any,
          link_video: link_video !== undefined ? link_video : existingCulturalArt.link_video,
          category_id: category_id !== undefined ? category_id : existingCulturalArt.category_id,
          address_id: addressId,
          position: position !== undefined ? parseInt(position.toString(), 10) : existingCulturalArt.position,
          is_active: is_active !== undefined ? is_active : existingCulturalArt.is_active,
          is_featured: is_featured !== undefined ? is_featured : existingCulturalArt.is_featured,
        }
      });

      if (translations && Array.isArray(translations) && translations.length > 0) {
        await tx.cultural_Art_Translation.deleteMany({
          where: { cultural_art_id: id }
        });

        const artTranslationsData = translations
          .filter((t: any) => t.name)
          .map((t: any) => ({
            cultural_art_id: id,
            language_code: t.language_code,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
          }));

        if (artTranslationsData.length > 0) {
          await tx.cultural_Art_Translation.createMany({ data: artTranslationsData });
        }
      }

      return await tx.cultural_Art.findUnique({
        where: { id },
        include: { translations: true, address: { include: { translations: true } } }
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedCulturalArt });
  } catch (error: any) {
    console.error("PUT CulturalArt Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const isAdmin = await checkAdmin();
    if (!isAdmin) {
      return NextResponse.json({ success: false, message: "Forbidden" }, { status: 403 });
    }

    const { id } = await context.params;

    const existing = await prisma.cultural_Art.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.cultural_Art_Translation.deleteMany({ where: { cultural_art_id: id } });
      await tx.cultural_Art.delete({ where: { id } });
      if (existing.address_id) {
        await tx.address_Translation.deleteMany({ where: { address_id: existing.address_id } });
        await tx.address.delete({ where: { id: existing.address_id } });
      }
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE CulturalArt Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

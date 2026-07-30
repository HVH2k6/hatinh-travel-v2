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

    let localSpecialty;

    if (isUUID) {
      localSpecialty = await prisma.local_Specialty.findUnique({
        where: { id },
        include: {
          translations: true,
          address: {
            include: { translations: true }
          }
        }
      });
    } else {
      const translation = await prisma.local_Specialty_Translation.findFirst({
        where: { slug: id }
      });

      if (translation) {
        localSpecialty = await prisma.local_Specialty.findUnique({
          where: { id: translation.local_specialty_id, status: 'active' },
          include: {
            translations: true,
            address: {
              include: { translations: true }
            }
          }
        });
      }
    }

    if (!localSpecialty) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: localSpecialty });
  } catch (error: any) {
    console.error("GET LocalSpecialty Detail Error:", error);
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
      category_id,
      unit_id,
      price,
      status, 
      is_featured 
    } = body;

    const existingLocalSpecialty = await prisma.local_Specialty.findUnique({
      where: { id },
      include: { address: true }
    });

    if (!existingLocalSpecialty) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    const updatedLocalSpecialty = await prisma.$transaction(async (tx) => {
      let addressId = existingLocalSpecialty.address_id;

      if (ward_code) {
        if (addressId) {
          await tx.address.update({
            where: { id: addressId },
            data: {
              ward_code: parseInt(ward_code.toString(), 10),
              map_url: map_url !== undefined ? map_url : existingLocalSpecialty.address?.map_url,
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
            .filter(t => t.address_detail)
            .map(t => ({
              address_id: addressId as string,
              language_code: t.language_code,
              detail: t.address_detail,
            }));
          
          if (addressTranslationsData.length > 0) {
            await tx.address_Translation.createMany({ data: addressTranslationsData });
          }
        }
      }

      await tx.local_Specialty.update({
        where: { id },
        data: {
          image: image !== undefined ? image : existingLocalSpecialty.image,
          list_image: (list_image !== undefined ? (Array.isArray(list_image) ? list_image : (list_image ? [list_image] : [])) : existingLocalSpecialty.list_image) as any,
          category_id: category_id !== undefined ? category_id : existingLocalSpecialty.category_id,
          unit_id: unit_id !== undefined ? unit_id : existingLocalSpecialty.unit_id,
          address_id: addressId,
          price: price !== undefined ? parseFloat(price.toString()) : existingLocalSpecialty.price,
          status: status !== undefined ? status : existingLocalSpecialty.status,
          is_featured: is_featured !== undefined ? is_featured : existingLocalSpecialty.is_featured,
        }
      });

      if (translations && Array.isArray(translations) && translations.length > 0) {
        await tx.local_Specialty_Translation.deleteMany({
          where: { local_specialty_id: id }
        });

        const specialtyTranslationsData = translations
          .filter(t => t.name)
          .map(t => ({
            local_specialty_id: id,
            language_code: t.language_code,
            name: t.name,
            slug: t.slug,
            description: t.description || null,
            ingredients: t.ingredients || null,
          }));

        if (specialtyTranslationsData.length > 0) {
          await tx.local_Specialty_Translation.createMany({ data: specialtyTranslationsData });
        }
      }

      return await tx.local_Specialty.findUnique({
        where: { id },
        include: { translations: true, address: { include: { translations: true } } }
      });
    });

    return NextResponse.json({ success: true, message: "Cập nhật thành công", data: updatedLocalSpecialty });
  } catch (error: any) {
    console.error("PUT LocalSpecialty Error:", error);
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

    const existing = await prisma.local_Specialty.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ success: false, message: "Không tìm thấy dữ liệu" }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.local_Specialty_Translation.deleteMany({ where: { local_specialty_id: id } });
      await tx.local_Specialty.delete({ where: { id } });
      if (existing.address_id) {
        await tx.address_Translation.deleteMany({ where: { address_id: existing.address_id } });
        await tx.address.delete({ where: { id: existing.address_id } });
      }
    });

    return NextResponse.json({ success: true, message: "Xóa thành công" });
  } catch (error: any) {
    console.error("DELETE LocalSpecialty Error:", error);
    return NextResponse.json({ success: false, message: "Lỗi hệ thống" }, { status: 500 });
  }
}

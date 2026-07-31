import { CulturalArt } from "@/interface/ICulturalArt";
import { CulturalArtDetailView } from "@/models/cultural-arts/cultural-art-detail-view";
import { notFound } from "next/navigation";

import prisma from "@/lib/prisma";

// Hàm Server gọi Database trực tiếp (chuẩn App Router)
async function getCulturalArtDetail(slug: string, locale: string): Promise<CulturalArt | null> {
  try {
    const translationWithSlug = await prisma.cultural_Art_Translation.findFirst({
      where: { slug: slug }
    });

    if (!translationWithSlug) return null;

    const dbArt = await prisma.cultural_Art.findUnique({
      where: { id: translationWithSlug.cultural_art_id },
      include: {
        translations: true,
        address: {
          include: { 
            ward: true,
            translations: true 
          }
        },
        category: {
          include: { translations: true }
        }
      }
    });

    if (!dbArt) return null;

    // 3. Map dữ liệu
    const translation = dbArt.translations?.find((t: any) => t.language_code === locale) || dbArt.translations?.find((t: any) => t.language_code === 'vi') || dbArt.translations?.[0];
    const catTrans = dbArt.category?.translations?.find((t: any) => t.language_code === locale) || dbArt.category?.translations?.find((t: any) => t.language_code === 'vi');
    const addrTrans = dbArt.address?.translations?.find((t: any) => t.language_code === locale) || dbArt.address?.translations?.find((t: any) => t.language_code === 'vi');

    const slugs: Record<string, string> = {};
    if (dbArt.translations) {
      dbArt.translations.forEach((t: any) => {
        slugs[t.language_code] = t.slug;
      });
    }

    return {
      id: dbArt.id,
      image: dbArt.image,
      list_image: dbArt.list_image as string[] | null,
      link_video: dbArt.link_video || null,
      name: translation?.name || '',
      slug: translation?.slug || '',
      slugs: slugs,
      description: translation?.description || '',
      is_featured: dbArt.is_featured || false,
      views: dbArt.views || 0,
      position: dbArt.position || 0,
      category: catTrans ? { id: dbArt.category_id!, name: catTrans.name } : null,
      address: {
        ward: dbArt.address?.ward?.name || null,
        address_detail: addrTrans?.detail || '',
        map_url: dbArt.address?.map_url || null,
      },
      created_at: dbArt.created_at ? new Date(dbArt.created_at).toISOString() : null,
    };
  } catch (error) {
    console.error("Lỗi API văn hóa nghệ thuật:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function CulturalArtDetailPage({ params }: PageProps) {
  // Mở gói params bất đồng bộ chuẩn Next.js 15+
  const { locale, slug } = await params;
  
  // Gọi dữ liệu trên Server
  const data = await getCulturalArtDetail(slug, locale);

  // Nếu không tìm thấy data từ API -> ném ra trang lỗi 404 mặc định của hệ thống
  if (!data) {
    notFound();
  }

  // Truyền data xuống cho Model View hiển thị giao diện
  return <CulturalArtDetailView item={data}  />;
}

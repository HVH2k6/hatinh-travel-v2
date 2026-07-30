import prisma from "@/lib/prisma";
import { TouristAttraction } from "@/interface/IAttraction";
import { AttractionDetailView } from "@/models/attractions/attraction-detail-view";
import { notFound } from "next/navigation";

async function getAttractionDetail(slug: string, locale: string): Promise<TouristAttraction | null> {
  try {
    // 1. Tìm bản dịch có slug khớp để lấy ra attraction_id
    const translationWithSlug = await prisma.tourist_Attraction_Translation.findFirst({
      where: { slug: slug }
    });

    if (!translationWithSlug) return null;

    // 2. Lấy chi tiết Attraction bằng ID
    const dbAttraction = await prisma.tourist_Attraction.findUnique({
      where: { id: translationWithSlug.attraction_id, is_active: true },
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
      }
    });

    if (!dbAttraction) return null;

    // 3. Map dữ liệu
    const translation = dbAttraction.translations.find(t => t.language_code === locale) || dbAttraction.translations.find(t => t.language_code === 'vi') || dbAttraction.translations[0];
    const catTrans = dbAttraction.category?.translations.find(t => t.language_code === locale) || dbAttraction.category?.translations.find(t => t.language_code === 'vi');
    const typeTrans = dbAttraction.type?.translations.find(t => t.language_code === locale) || dbAttraction.type?.translations.find(t => t.language_code === 'vi');
    const addrTrans = dbAttraction.address?.translations.find(t => t.language_code === locale) || dbAttraction.address?.translations.find(t => t.language_code === 'vi');

    const slugs: Record<string, string> = {};
    dbAttraction.translations.forEach(t => {
      slugs[t.language_code] = t.slug;
    });

    return {
      id: dbAttraction.id,
      image: dbAttraction.image,
      sub_image: dbAttraction.sub_image as string[] | null,
      name: translation?.name || '',
      slug: translation?.slug || '',
      slugs: slugs,
      description: translation?.description || '',
      category: catTrans?.name || null,
      type: typeTrans?.name || null,
      address: {
        ward: dbAttraction.address?.ward?.name || null,
        district: dbAttraction.address?.ward?.district_name || null,
        address_detail: addrTrans?.detail || '',
        map_url: dbAttraction.address?.map_url || null,
      },
      opening_time: dbAttraction.opening_time ? dbAttraction.opening_time.toISOString() : null,
      closing_time: dbAttraction.closing_time ? dbAttraction.closing_time.toISOString() : null,
      min_price: dbAttraction.min_price ? Number(dbAttraction.min_price) : 0,
      max_price: dbAttraction.max_price ? Number(dbAttraction.max_price) : 0,
      phone_number: dbAttraction.phone_number,
      website: dbAttraction.website,
      is_featured: dbAttraction.is_featured || false,
      view_count: dbAttraction.view_count || 0,
    };
  } catch (error) {
    console.error("Lỗi lấy chi tiết điểm du lịch:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function AttractionDetailPage({ params }: PageProps) {
  const { locale, slug } = await params;
  
  const attractionData = await getAttractionDetail(slug, locale);

  if (!attractionData) {
    notFound();
  }

  return <AttractionDetailView item={attractionData} />;
}
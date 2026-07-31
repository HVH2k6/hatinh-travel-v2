
import { LocalSpecialty } from "@/interface/ILocalSpecialty";
import { AttractionDetailView } from "@/models/attractions/attraction-detail-view";
import { LocalSpecialtyDetailView } from "@/models/local-specialty/local-specialty-detail";
import { notFound } from "next/navigation";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string; slug: string }> }): Promise<Metadata> {
  const { locale, slug } = await params;
  const specialty = await getData(slug, locale);
  
  if (!specialty) {
    return {
      title: 'Local Specialty Not Found',
    };
  }

  return {
    title: `${specialty.name} | Hà Tĩnh Travel`,
    description: specialty.description || (locale === 'en' ? 'Discover local specialties in Ha Tinh' : 'Khám phá đặc sản địa phương tại Hà Tĩnh'),
    openGraph: {
      title: specialty.name,
      description: specialty.description || (locale === 'en' ? 'Discover local specialties in Ha Tinh' : 'Khám phá đặc sản địa phương tại Hà Tĩnh'),
      images: specialty.image ? [{ url: specialty.image }] : [],
    }
  };
}



import prisma from "@/lib/prisma";

async function getData(slug: string, locale: string): Promise<LocalSpecialty | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/local-specialties/${slug}?lang=${locale}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    
    if (!json.success || !json.data) return null;

    const dbSpecialty = json.data;

    // 3. Map dữ liệu
    const translation = dbSpecialty.translations?.find((t: any) => t.language_code === locale) || dbSpecialty.translations?.find((t: any) => t.language_code === 'vi') || dbSpecialty.translations?.[0];
    const catTrans = dbSpecialty.category?.translations?.find((t: any) => t.language_code === locale) || dbSpecialty.category?.translations?.find((t: any) => t.language_code === 'vi');
    const unitTrans = dbSpecialty.unit?.translations?.find((t: any) => t.language_code === locale) || dbSpecialty.unit?.translations?.find((t: any) => t.language_code === 'vi');
    const addrTrans = dbSpecialty.address?.translations?.find((t: any) => t.language_code === locale) || dbSpecialty.address?.translations?.find((t: any) => t.language_code === 'vi');

    const slugs: Record<string, string> = {};
    if (dbSpecialty.translations) {
      dbSpecialty.translations.forEach((t: any) => {
        slugs[t.language_code] = t.slug;
      });
    }

    return {
      id: dbSpecialty.id,
      image: dbSpecialty.image,
      sub_image: dbSpecialty.list_image as string[] | null,
      name: translation?.name || '',
      slug: translation?.slug || '',
      slugs: slugs,
      description: translation?.description || '',
      ingredients: translation?.ingredients || null,
      category: catTrans ? { id: dbSpecialty.category_id!, name: catTrans.name } : null,
      unit: unitTrans?.name || null,
      price: dbSpecialty.price ? Number(dbSpecialty.price) : 0,
      address: {
        ward: dbSpecialty.address?.ward?.name || null,
        district: dbSpecialty.address?.ward?.district_name || null,
        address_detail: addrTrans?.detail || '',
        map_url: dbSpecialty.address?.map_url || null,
      },
      is_featured: dbSpecialty.is_featured || false,
      view_count: dbSpecialty.views || 0,
    };
  } catch (error) {
    console.error("Lỗi API đặc sản:", error);
    return null;
  }
}

interface PageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function LocalSpecialtyDetailPage({ params }: PageProps) {
  
  const { locale, slug } = await params;
  
  
  const localSpecialtyData = await getData(slug, locale);
  console.log("🚀 ~ LocalSpecialtyDetailPage ~ localSpecialtyData:", localSpecialtyData)

  
  if (!localSpecialtyData) {
    notFound();
  }

  
  return <LocalSpecialtyDetailView item={localSpecialtyData}  />;
}
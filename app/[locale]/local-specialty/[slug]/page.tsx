
import { LocalSpecialty } from "@/interface/ILocalSpecialty";
import { AttractionDetailView } from "@/models/attractions/attraction-detail-view";
import { LocalSpecialtyDetailView } from "@/models/local-specialty/local-specialty-detail";
import { notFound } from "next/navigation";



async function getData(slug: string, locale: string): Promise<LocalSpecialty | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/local-specialties/${slug}?lang=${locale}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch (error) {
    console.error("Lỗi API:", error);
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
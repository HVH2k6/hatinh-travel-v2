import { TouristAttraction } from "@/interface/IAttraction";
import { AttractionDetailView } from "@/models/attractions/attraction-detail-view";
import { notFound } from "next/navigation";


// Hàm Server gọi API từ Laravel
async function getAttractionDetail(slug: string, locale: string): Promise<TouristAttraction | null> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/tourist-attractions/${slug}?lang=${locale}`, {
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

export default async function AttractionDetailPage({ params }: PageProps) {
  // Mở gói params bất đồng bộ chuẩn Next.js 15+
  const { locale, slug } = await params;
  
  // Gọi dữ liệu trên Server
  const attractionData = await getAttractionDetail(slug, locale);

  // Nếu không tìm thấy data từ API -> ném ra trang lỗi 404 mặc định của hệ thống
  if (!attractionData) {
    notFound();
  }

  // Truyền data xuống cho Model View hiển thị giao diện
  return <AttractionDetailView item={attractionData}  />;
}
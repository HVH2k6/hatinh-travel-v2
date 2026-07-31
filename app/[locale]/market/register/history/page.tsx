import { handleServerGetMyApplications } from "@/actions/handle-auth";
import HistoryRegisterSeller from "@/models/market/history-register";


interface PageProps {
  params: Promise<{ locale: string }>;
}

export default async function HistoryRegisterPage({ params }: PageProps) {
  const { locale } = await params;

  // Lấy dữ liệu trực tiếp trên Server Next.js
  const result = await handleServerGetMyApplications(locale);
  const applications = result.success ? result.data : [];

  return (
    <HistoryRegisterSeller initialData={applications as any} />
    // <></>

  );
}
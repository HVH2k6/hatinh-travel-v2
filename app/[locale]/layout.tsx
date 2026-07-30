import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/navigation';
import { SiteHeader } from '@/components/layout/header';


export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // Nếu người dùng gõ bậy locale không tồn tại trên URL (vd: /abc) -> đá sang trang 404
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  // Lấy các câu dịch trên Server
  const messages = await getMessages();

  return (
    <div lang={locale}>
      <NextIntlClientProvider messages={messages}>
        <SiteHeader />
        <main>{children}</main>
      </NextIntlClientProvider>
    </div>
  );
}
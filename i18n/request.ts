import { getRequestConfig } from 'next-intl/server';
import { routing } from './navigation';


export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Đảm bảo locale hợp lệ, nếu không thì dùng mặc định
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    // Đường dẫn trỏ tới thư mục chứa các file json của bạn
    messages: (await import(`@/messages/${locale}.json`)).default
  };
});
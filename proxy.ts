import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/navigation';

export default createMiddleware(routing);

export const config = {
  // Matcher chuẩn của next-intl để bỏ qua các file tĩnh
  matcher: [
    '/',
    '/(en|ja|ko|ru|vi|zh)/:path*',
    
    '/((?!api|_next|_vercel|.*\\..*).*)'
  ],
};

import { createNavigation } from 'next-intl/navigation';

export const routing = {
  locales: ['en', 'ja', 'ko', 'ru', 'vi', 'zh'], // Danh sách ngôn ngữ của bạn
  defaultLocale: 'vi'
};

// Xuất bản các hàm điều hướng chuẩn hóa của next-intl
export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
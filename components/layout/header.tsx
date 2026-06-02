'use client';

import {
  Search,
  Menu,
  Settings,
  LogOut,
  User,
  HistoryIcon,
} from 'lucide-react';
import { LanguageCombobox } from '../language/select-language';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

// Import từ next-intl
import { useTranslations, useLocale } from 'next-intl';
// Import từ file navigation cấu hình next-intl của bạn
import { Link, usePathname } from '@/i18n/navigation';
import { useAuth } from '@/providers/auth-provider';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Button } from '../ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

export function SiteHeader() {
  const pathname = usePathname();
  const currentLocale = useLocale();
  const { user, isLoading, logout } = useAuth();
  // Gọi hook trỏ vào nhánh "header" trong file JSON dịch
  const t = useTranslations('header');

  // Định nghĩa các link điều hướng
  const navItems = [
    { label: t('home'), href: '/' },
    { label: t('market'), href: '/market' },
    { label: t('audio'), href: '/audio' },
    { label: t('ranking'), href: '/search' },
    { label: t('blog'), href: '/blog' },
    // { label: t('history'), href: '/blog' },
  ];

  return (
    <header className='sticky top-0 z-50 w-full border-b bg-white shadow-sm'>
      <div className='container mx-auto px-4 lg:px-8'>
        <div className='flex h-20 items-center justify-between'>
          {/* Logo Section */}
          <Link href='/' className='flex items-center gap-2'>
            <div className='flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-orange-500 relative'>
              <div className='absolute w-6 h-6 border-[2px] border-slate-800 rounded-full -ml-1'></div>
            </div>
            <span className='text-xl font-extrabold tracking-widest text-slate-800 uppercase'>
              Travel<span className='text-slate-500 font-medium'>Tour</span>
            </span>
          </Link>

          {/* Navigation & Actions */}
          <div className='flex items-center gap-4 lg:gap-6'>
            {/* Desktop Navigation */}
            <nav className='hidden lg:flex items-center gap-8'>
              {navItems.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== '/' && pathname?.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative py-7 text-[13px] font-bold tracking-wider transition-colors hover:text-slate-900 ${
                      isActive ? 'text-slate-900' : 'text-slate-500'
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <span className='absolute bottom-0 left-0 h-[3px] w-full bg-slate-300'></span>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className='hidden lg:block h-6 w-px bg-slate-200 mx-2'></div>

            {/* Khu vực Actions */}
            <div className='flex items-center gap-1 sm:gap-2'>
              <button className='p-2 text-slate-600 hover:text-orange-500 transition-colors'>
                <Search className='h-5 w-5' />
              </button>

              {/* Ô chọn ngôn ngữ cho Desktop */}
              <div className='hidden lg:block'>
                <LanguageCombobox />
              </div>

              <div className='ml-auto'>
                {isLoading ? (
                  <div className='h-9 w-9 rounded-full bg-zinc-700 animate-pulse' />
                ) : user ? (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant='ghost'
                        className='relative h-9 w-9 rounded-full p-0 border border-zinc-600'
                      >
                        <Avatar className='h-9 w-9'>
                          <AvatarImage src={user.avatar || ''} />
                          <AvatarFallback className='bg-zinc-700 text-white text-[10px]'>
                            {user.username?.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className='w-52 bg-[#242526] text-white border-zinc-700'
                      align='end'
                    >
                      <DropdownMenuItem className='cursor-pointer text-sm'>
                        <Settings className='mr-2 h-4 w-4' /> {t('setting')}
                      </DropdownMenuItem>
                      <DropdownMenuItem className='cursor-pointer text-sm'>
                        <Link href={'/market/register/history'} className='flex items-center gap-1 w-full h-full'>
                          <HistoryIcon className='mr-2 h-4 w-4' />{' '}
                          {t('history')}
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator className='bg-zinc-700' />
                      <DropdownMenuItem
                        onClick={logout}
                        className='text-red-400 cursor-pointer text-sm'
                      >
                        <LogOut className='mr-2 h-4 w-4' /> {t('logout')}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                ) : (
                  <Link
                    href='/auth/login'
                    className='hidden lg:inline-flex items-center justify-center border border-slate-200 text-slate-700 text-xs font-bold h-10 px-4 rounded-xl hover:bg-slate-50 hover:text-slate-900 transition-colors ml-1 bg-blue-500'
                  >
                    {t('login')}
                  </Link>
                )}
              </div>

              {/* MOBILE MENU TRIGGER (Sheet Shadcn) */}
              <div className='lg:hidden'>
                <Sheet>
                  <SheetTrigger asChild>
                    <button
                      className='p-2 text-slate-600 hover:text-slate-900 transition-colors'
                      aria-label='Toggle Menu'
                    >
                      <Menu className='h-6 w-6' />
                    </button>
                  </SheetTrigger>
                  <SheetContent
                    side='right'
                    className='w-[280px] sm:w-[350px] flex flex-col justify-between p-6'
                  >
                    <div>
                      <SheetHeader className='text-left pb-4 border-b'>
                        <SheetTitle>
                          <span className='text-lg font-extrabold tracking-widest text-slate-800 uppercase'>
                            Travel
                            <span className='text-slate-500 font-medium'>
                              Tour
                            </span>
                          </span>
                        </SheetTitle>
                      </SheetHeader>

                      {/* Danh sách menu dọc trên Mobile */}
                      <nav className='flex flex-col gap-1 mt-4'>
                        {navItems.map((item) => {
                          const isActive =
                            pathname === item.href ||
                            (item.href !== '/' &&
                              pathname?.startsWith(item.href));
                          return (
                            <Link
                              key={item.href}
                              href={item.href}
                              className={`text-sm font-bold tracking-wider py-3 px-2 rounded-md transition-colors ${
                                isActive
                                  ? 'text-orange-600 bg-orange-50'
                                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                              }`}
                            >
                              {item.label}
                            </Link>
                          );
                        })}

                        {/* 2. NÚT LOGIN TRÊN MOBILE (Nằm gọn gàng ngay dưới danh sách link) */}
                        <Link
                          href='/login'
                          className='mt-4 text-center text-sm font-bold tracking-wider py-3 px-4 rounded-xl bg-slate-950 text-white hover:bg-orange-600 transition-colors shadow-sm'
                        >
                          {t('login')}
                        </Link>
                      </nav>
                    </div>

                    {/* Ô chọn Ngôn ngữ dưới đáy Sidebar di động */}
                    <div className='pt-4 border-t flex flex-col gap-2'>
                      <span className='text-xs font-semibold text-slate-400 uppercase tracking-wider px-2'>
                        {currentLocale === 'vi'
                          ? 'Ngôn ngữ'
                          : currentLocale === 'zh'
                            ? '语言'
                            : 'Language'}
                      </span>
                      <div className='w-full [&>button]:w-full'>
                        <LanguageCombobox />
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

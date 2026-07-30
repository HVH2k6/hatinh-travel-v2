'use client';

import * as React from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { usePathname, useRouter } from '@/i18n/navigation';
import { useLocale } from 'next-intl';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

// 1. IMPORT HOOK CONTEXT VÀ ZUSTAND STORE
import { useLanguages } from '@/context/LanguageContext';
import { useSlugStore } from '@/store/use-slug-store';

export function LanguageCombobox() {
  const [open, setOpen] = React.useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  const languages = useLanguages();

  const currentSlugs = useSlugStore((state) => state.currentSlugs);

  const handleLanguageChange = (newLocale: string) => {
    // NẾU ĐANG Ở TRANG CHI TIẾT VÀ CÓ SLUG DỊCH TƯƠNG ỨNG
    if (currentSlugs && currentSlugs[newLocale]) {
      const translatedSlug = currentSlugs[newLocale];
      const cleanSlug = encodeURIComponent(translatedSlug);

      // Lấy path hiện tại và thay thế slug cũ bằng slug mới
      const segments = pathname.split('/');
      if (segments.length > 1) {
        segments[segments.length - 1] = cleanSlug;
        const newPath = segments.join('/');
        router.replace(newPath, { locale: newLocale });
      } else {
        router.replace(`/${cleanSlug}`, { locale: newLocale });
      }
    } else {
      // NẾU ĐANG Ở TRANG BÌNH THƯỜNG (Trang chủ, blog...)
      router.replace(pathname, { locale: newLocale });
    }

    setOpen(false);
  };

  // Tìm tên ngôn ngữ hiện tại để hiển thị lên nút button
  const currentLanguage = languages.find((lang) => lang.code === currentLocale);
  const currentLanguageName = currentLanguage
    ? currentLanguage.name
    : 'Tiếng Việt';

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          role='combobox'
          className='w-[220px] justify-between'
        >
          {/* Nếu API chưa kịp trả về dữ liệu thì hiện chữ Đang tải... */}
          {languages.length === 0 ? 'Đang tải...' : currentLanguageName}
          <ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[220px] p-0'>
        <Command>
          <CommandInput placeholder='Tìm ngôn ngữ...' />
          <CommandList>
            <CommandEmpty>Không tìm thấy.</CommandEmpty>
            <CommandGroup>
              {languages.map((lang) => (
                <CommandItem
                  key={lang.code}
                  value={lang.code} // Cần gán value là code để Command nhận diện đúng
                  onSelect={(val) => {
                    const selected = languages.find(
                      (l) => l.code.toLowerCase() === val.toLowerCase(),
                    );
                    if (selected) handleLanguageChange(selected.code);
                  }}
                  className='cursor-pointer'
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentLocale === lang.code
                        ? 'opacity-100 text-orange-600'
                        : 'opacity-0',
                    )}
                  />
                  {/* Hiển thị cờ và tên ngôn ngữ */}
                  {lang.flag_icon && (
                    <img
                      src={lang.flag_icon}
                      alt={`${lang.code} flag`}
                      className='w-5 h-5 mr-2 rounded-sm object-cover shadow-sm'
                    />
                  )}
                  <span
                    className={cn(
                      'font-medium',
                      currentLocale === lang.code ? 'text-orange-600' : '',
                    )}
                  >
                    {lang.name}
                  </span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

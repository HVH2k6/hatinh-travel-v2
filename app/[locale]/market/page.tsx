import { ShoppingBagIcon } from 'lucide-react';
import { useLocale } from 'next-intl';
import { getTranslations } from 'next-intl/server';
import Link from 'next/link';

export default async function page() {
  const t = await getTranslations('market');
  return (
    <>
      <div className='flex items-center gap-3'>
        <span>{t('registerLink')}</span>
        <Link href={'/market/register'}>
          <ShoppingBagIcon />
        </Link>
      </div>
    </>
  );
}

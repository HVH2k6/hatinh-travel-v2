'use client';

import * as React from 'react';
import {
  Clock,
  MapPin,
  Ticket,
  Phone,
  Globe,
  ArrowLeft,
  Maximize2,
  Eye,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';
import { TouristAttraction } from '@/interface/IAttraction';
import { useSlugStore } from '@/store/use-slug-store';
import { formatCurrency } from '@/lib/format-currency';
import ReviewSection from '@/components/review/review-section';

interface AttractionDetailViewProps {
  item: TouristAttraction;
}

export function AttractionDetailView({ item }: AttractionDetailViewProps) {
  const t = useTranslations('attraction.detail');
  const [viewCount, setViewCount] = React.useState(item.view_count);
  const setCurrentSlugs = useSlugStore((state) => state.setCurrentSlugs);
  const hasCalledView = React.useRef(false);
  const currentLocale = useLocale();
  React.useEffect(() => {
    if (item.slugs) {
      setCurrentSlugs(item.slugs);
    }

    return () => {
      setCurrentSlugs(null);
    };
  }, [item.slugs, setCurrentSlugs]);

  React.useEffect(() => {
    let isMounted = true;
    let viewTimer: NodeJS.Timeout;

    const incrementView = async () => {
      if (hasCalledView.current) return;
      hasCalledView.current = true;

      try {
        const res = await fetch('/api/attractions/view', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: item.id }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && isMounted) {
            setViewCount(data.current_views);
          }
        } else {
          hasCalledView.current = false;
        }
      } catch (error) {
        hasCalledView.current = false;
      }
    };

    if (item.id) {
      viewTimer = setTimeout(() => {
        incrementView();
      }, 5000); // Tối ưu UX: Chờ 5 giây thay vì 10 giây để ghi nhận view
    }

    return () => {
      isMounted = false;
      if (viewTimer) clearTimeout(viewTimer);
    };
  }, [item.id]);

  const albumImages = React.useMemo(() => {
    const images: string[] = [];
    if (item.image) images.push(item.image);
    if (item.sub_image && Array.isArray(item.sub_image)) {
      images.push(...item.sub_image);
    }
    return images;
  }, [item.image, item.sub_image]);

  const formatPrice = (min: number, max: number) => {
    if (max === 0) return t('free');

    const formattedMin = formatCurrency(min, currentLocale);
    const formattedMax = formatCurrency(max, currentLocale);

    return `${formattedMin} - ${formattedMax}`;
  };

  return (
    <div className='min-h-screen bg-slate-50/50 pb-16 font-sans'>
      {/* 1. HERO BANNER */}
      <div className='relative h-[40vh] md:h-[55vh] w-full bg-slate-950'>
        <img
          src={
            item.image ||
            'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200'
          }
          alt={item.name}
          className='w-full h-full object-cover opacity-75 object-center'
        />
        <div className='absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent' />

        <div className='absolute top-6 left-4 lg:left-8 z-10'>
          <Link
            href='/'
            className='inline-flex items-center gap-2 bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold h-9 px-3.5 rounded-full shadow-sm hover:bg-white transition-all active:scale-95'
          >
            <ArrowLeft className='h-4 w-4' />
            <span className='hidden sm:inline'>{t('home')}</span>
          </Link>
        </div>

        <div className='absolute bottom-6 md:bottom-10 left-0 w-full'>
          <div className='container mx-auto px-4 lg:px-8 space-y-3'>
            <div className='flex items-center gap-3'>
              {(item.type || item.category) && (
                <span className='inline-block bg-orange-600 text-white text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-md'>
                  {item.type || item.category}
                </span>
              )}

              <div className='flex items-center gap-1.5 text-white/90 text-sm font-medium backdrop-blur-sm bg-black/20 px-2.5 py-1 rounded-md'>
                <Eye className='h-3.5 w-3.5' />
                <span>
                  {viewCount.toLocaleString()} {t('views')}
                </span>
              </div>
            </div>

            <h1 className='text-2xl md:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight uppercase max-w-4xl'>
              {item.name}
            </h1>
          </div>
        </div>
      </div>

      {/* 2. LAYOUT CHÍNH */}
      <div className='container mx-auto px-4 lg:px-8 mt-8'>
        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8 items-start'>
          <div className='lg:col-span-2 space-y-8'>
            {/* THƯ VIỆN ẢNH */}
            {albumImages.length > 0 && (
              <div className='bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm space-y-4'>
                <h3 className='text-xl font-black text-slate-900 uppercase tracking-wider border-l-4 border-orange-500 pl-3'>
                  {t('photo_gallery')}
                </h3>

                <Dialog>
                  <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3'>
                    {albumImages.map((imgUrl, index) => (
                      <DialogTrigger asChild key={index}>
                        <div className='group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-slate-100 bg-slate-50'>
                          <img
                            src={imgUrl}
                            alt={`Gallery ${index}`}
                            className='w-full h-full object-cover transition duration-300 group-hover:scale-105'
                          />
                          <div className='absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                            <Maximize2 className='text-white h-5 w-5 drop-shadow-sm' />
                          </div>
                        </div>
                      </DialogTrigger>
                    ))}
                  </div>

                  <DialogContent className='max-w-[95vw] lg:max-w-6xl h-[90vh] bg-black/95 border-none text-white p-0 flex flex-col items-center justify-center sm:rounded-3xl shadow-2xl'>
                    <DialogTitle className='sr-only'>
                      {t('image_viewer')}
                    </DialogTitle>
                    <div className='relative w-full h-full px-4 md:px-16 py-8 flex items-center justify-center'>
                      <Carousel className='w-full h-full flex items-center justify-center'>
                        <CarouselContent className='items-center'>
                          {albumImages.map((imgUrl, index) => (
                            <CarouselItem
                              key={index}
                              className='flex justify-center items-center'
                            >
                              <div className='relative h-full max-h-[85vh] flex items-center justify-center rounded-xl overflow-hidden'>
                                <img
                                  src={imgUrl}
                                  alt={`View ${index}`}
                                  className='object-contain max-w-full max-h-[85vh] select-none'
                                />
                              </div>
                            </CarouselItem>
                          ))}
                        </CarouselContent>
                        <CarouselPrevious className='absolute left-0 bg-white/10 hover:bg-white/30 border-none text-white h-10 w-10 md:h-12 md:w-12' />
                        <CarouselNext className='absolute right-0 bg-white/10 hover:bg-white/30 border-none text-white h-10 w-10 md:h-12 md:w-12' />
                      </Carousel>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            )}

            {/* BÀI VIẾT */}
            <div className='bg-white border border-slate-100 rounded-3xl p-5 md:p-8 shadow-sm'>
              <article
                className='prose prose-slate max-w-none 
                  prose-headings:font-black prose-headings:text-slate-900 prose-headings:uppercase prose-headings:tracking-tight
                  prose-h2:text-xl prose-h2:md:text-2xl prose-h2:border-l-4 prose-h2:border-orange-500 prose-h2:pl-3 prose-h2:mt-8
                  prose-h3:text-lg prose-h3:text-slate-800 prose-h3:mt-6
                  prose-p:text-slate-600 prose-p:leading-relaxed prose-p:text-sm md:prose-p:text-base
                  prose-img:rounded-2xl prose-img:shadow-sm prose-img:mx-auto prose-img:my-6
                  prose-em:text-xs prose-em:text-slate-400 prose-em:block prose-em:text-center prose-em:-mt-4 prose-em:font-medium prose-em:not-italic'
                dangerouslySetInnerHTML={{ __html: item.description }}
              />
            </div>
            <ReviewSection type='location' id={item.id} />
          </div>

          {/* CỘT PHẢI */}
          <div className='space-y-6 lg:sticky lg:top-24'>
            <div className='bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6'>
              <h3 className='text-base font-black text-slate-900 uppercase tracking-wider pb-3 border-b border-slate-100'>
                {t('trip_info')}
              </h3>

              <div className='space-y-4'>
                <div className='flex items-start gap-3.5'>
                  <div className='p-2 rounded-xl bg-orange-50 text-orange-600 shrink-0 mt-0.5'>
                    <MapPin className='h-4 w-4' />
                  </div>
                  <div className='space-y-0.5'>
                    <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                      {t('location')}
                    </span>
                    <p className='text-sm font-semibold text-slate-800'>
                      {item.address.address_detail
                        ? `${item.address.address_detail}, `
                        : ''}
                      {item.address.ward}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3.5'>
                  <div className='p-2 rounded-xl bg-slate-50 text-slate-600 shrink-0 mt-0.5'>
                    <Clock className='h-4 w-4' />
                  </div>
                  <div className='space-y-0.5'>
                    <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                      {t('opening_hours')}
                    </span>
                    <p className='text-sm font-semibold text-slate-800'>
                      {item.opening_time && item.closing_time
                        ? `${item.opening_time.substring(0, 5)} - ${item.closing_time.substring(0, 5)}`
                        : t('not_updated')}
                    </p>
                  </div>
                </div>

                <div className='flex items-start gap-3.5'>
                  <div className='p-2 rounded-xl bg-green-50 text-green-600 shrink-0 mt-0.5'>
                    <Ticket className='h-4 w-4' />
                  </div>
                  <div className='space-y-0.5'>
                    <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                      {t('estimated_price')}
                    </span>
                    <p className='text-sm font-bold text-green-700'>
                      {formatPrice(item.min_price, item.max_price)}
                    </p>
                  </div>
                </div>

                {item.phone_number && (
                  <div className='flex items-start gap-3.5'>
                    <div className='p-2 rounded-xl bg-blue-50 text-blue-600 shrink-0 mt-0.5'>
                      <Phone className='h-4 w-4' />
                    </div>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                        {t('hotline')}
                      </span>
                      <p className='text-sm font-semibold text-slate-800'>
                        {item.phone_number}
                      </p>
                    </div>
                  </div>
                )}

                {item.website && (
                  <div className='flex items-start gap-3.5'>
                    <div className='p-2 rounded-xl bg-purple-50 text-purple-600 shrink-0 mt-0.5'>
                      <Globe className='h-4 w-4' />
                    </div>
                    <div className='space-y-0.5'>
                      <span className='text-xs text-slate-400 font-bold uppercase tracking-wider'>
                        {t('website')}
                      </span>
                      <a
                        href={item.website}
                        target='_blank'
                        rel='noreferrer'
                        className='text-sm font-semibold text-purple-600 hover:underline block line-clamp-1'
                      >
                        {item.website}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {item.address.map_url && (
                <div className='pt-2'>
                  <a
                    href={item.address.map_url}
                    target='_blank'
                    rel='noopener noreferrer'
                    className='w-full inline-flex items-center justify-center bg-slate-900 text-white text-xs font-bold h-11 rounded-xl hover:bg-orange-600 transition-colors shadow-sm gap-2'
                  >
                    <MapPin className='h-4 w-4' />
                    <span>{t('view_map')}</span>
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

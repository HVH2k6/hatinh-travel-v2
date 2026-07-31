import { HeroSection } from "@/components/sections/hero-section";
import { DynamicIcon } from "@/components/ui/dynamatic-icon";
import { timelineMilestones } from "@/data/timeline";
import AttractionData from "@/models/attractions/AttractionData";
import CulturalArtData from "@/models/cultural-arts/cultural-art-data";
import LocalSpecialtyData from "@/models/local-specialty/local-specialty-data";
import { Calendar, Compass, ShieldCheck, Users, ArrowRight } from "lucide-react";
import { Link } from '@/i18n/navigation';
import { getTranslations } from "next-intl/server";
import AIChatBox from "@/components/AIChatBox";
import { Metadata } from 'next';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  
  if (locale === 'en') {
    return {
      title: 'Ha Tinh Travel - Explore the Beauty of Ha Tinh',
      description: 'Discover tourist attractions, local specialties, and cultural arts in Ha Tinh. Your ultimate travel guide.',
      openGraph: {
        title: 'Ha Tinh Travel - Explore the Beauty of Ha Tinh',
        description: 'Discover tourist attractions, local specialties, and cultural arts in Ha Tinh. Your ultimate travel guide.',
      }
    };
  }
  
  return {
    title: 'Hà Tĩnh Travel - Khám phá vẻ đẹp Hà Tĩnh',
    description: 'Khám phá các điểm đến du lịch, đặc sản địa phương và văn hóa nghệ thuật tại Hà Tĩnh. Cẩm nang du lịch dành cho bạn.',
    openGraph: {
      title: 'Hà Tĩnh Travel - Khám phá vẻ đẹp Hà Tĩnh',
      description: 'Khám phá các điểm đến du lịch, đặc sản địa phương và văn hóa nghệ thuật tại Hà Tĩnh. Cẩm nang du lịch dành cho bạn.',
    }
  };
}


export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const title = await getTranslations('home.title');
  const welcome = await getTranslations('home.welcome');
  const about = await getTranslations('home.about');
  const timeline = await getTranslations('home.timeline');
  const cta = await getTranslations('home.cta');

  return (
    <div className="bg-slate-50/30 overflow-hidden">
      {/* -------------------------------------------------- */}
      {/* SECTION 1: HERO BANNER */}
      {/* -------------------------------------------------- */}
      <HeroSection />

      {/* -------------------------------------------------- */}
      {/* FLOATING AI CHATBOX */}
      {/* -------------------------------------------------- */}
      <AIChatBox />

      {/* -------------------------------------------------- */}
      {/* SECTION 2: LỜI CHÀO MỪNG & STATS */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-20 px-4 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-4">
          <span className="text-orange-600 font-bold text-xs uppercase tracking-widest bg-orange-50 px-3 py-1 rounded-full border border-orange-100">
            {welcome('tagline')}
          </span>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            {welcome('heading')}
          </h2>
          <p className="text-slate-600 font-medium text-sm md:text-base leading-relaxed max-w-2xl mx-auto whitespace-pre-line">
            {welcome('description')}
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto mt-12 bg-white border border-slate-200/60 p-6 md:p-8 rounded-3xl shadow-xs">
          {[
            { icon: Compass, count: '50+', label: welcome('stat_destinations') },
            { icon: ShieldCheck, count: '100%', label: welcome('stat_safe') },
            { icon: Users, count: '2M+', label: welcome('stat_visitors') },
            { icon: Calendar, count: '365', label: welcome('stat_days') },
          ].map((stat, idx) => (
            <div key={idx} className="text-center space-y-2 group">
              <div className="mx-auto w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform duration-300">
                <stat.icon className="w-5 h-5" />
              </div>
              <div className="space-y-0.5">
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.count}</p>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 3: GIỚI THIỆU VÙNG ĐẤT (LAYOUT SO LE) */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-28 px-4 lg:px-8 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-tr from-orange-600 to-amber-500 rounded-3xl rotate-3 scale-102 opacity-10 blur-md group-hover:rotate-1 transition-all duration-500" />
          <div className="relative aspect-[16/11] rounded-3xl overflow-hidden border border-slate-200/60 bg-slate-100 shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1000&auto=format&fit=crop"
              alt="Ha Tinh Landscape"
              className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 ease-out"
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-1.5">
            <span className="text-orange-600 font-bold text-xs uppercase tracking-wider">{about('section_tag')}</span>
            <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              {about('heading')}
            </h3>
            <div className="h-1 w-12 bg-orange-500 rounded-full" />
          </div>
          <div className="space-y-4 text-sm font-medium text-slate-600 leading-relaxed">
            <p className="whitespace-pre-line">{about('paragraph_1')}</p>
            <p className="whitespace-pre-line">{about('paragraph_2')}</p>
          </div>
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 4: [ĐÃ ĐẨY LÊN] TIMELINE QUÁ TRÌNH PHÁT TRIỂN */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-28 px-4 lg:px-8 space-y-16">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
            {timeline('heading')}
          </h2>
          <div className="h-1 w-16 bg-orange-500 rounded-full mx-auto" />
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider pt-1">{timeline('subtitle')}</p>
        </div>

        {/* Cải tiến khoảng cách phản hồi (space-y-16 trên mobile, py-12 trên md) làm trục dài và thoáng hơn */}
        <div className="relative max-w-4xl mx-auto before:absolute before:inset-y-0 before:left-4 md:before:left-1/2 before:w-0.5 before:bg-gradient-to-b before:from-orange-200 before:via-orange-500 before:to-transparent space-y-16 md:space-y-0">
          {timelineMilestones.map((item, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <div
                key={idx}
                className={`relative flex flex-col md:flex-row items-start md:items-center justify-between w-full md:py-14 group ${isEven ? 'md:flex-row-reverse' : ''
                  }`}
              >

                <div className="absolute left-4 md:left-1/2 -translate-x-1/2 w-10 h-10 rounded-2xl bg-white border-2 border-orange-500 shadow-sm flex items-center justify-center text-orange-600 z-10 group-hover:bg-orange-600 group-hover:text-white transition-all duration-300 group-hover:scale-110">
                  <DynamicIcon name={item.iconName} className="w-4 h-4" />
                </div>

                {/* Hộp nội dung */}
                <div className={`w-full md:w-[44%] pl-12 md:pl-0 ${isEven ? 'md:text-left' : 'md:text-right'
                  }`}>
                  <div className="bg-white border border-slate-200/70 p-6 rounded-2xl shadow-xs hover:shadow-md hover:-translate-y-1 transition-all duration-300 space-y-2 relative">
                    <span className="inline-block bg-orange-50 text-orange-700 text-[11px] font-black px-2.5 py-0.5 rounded-md border border-orange-100">
                      {item.year}
                    </span>
                    <h4 className="font-bold text-slate-900 text-base">
                      {timeline(`${item.key}_title`)}
                    </h4>
                    <p className="text-xs font-medium text-slate-500 leading-relaxed">
                      {timeline(`${item.key}_desc`)}
                    </p>
                  </div>
                </div>

                <div className="hidden md:block w-[44%]" />
              </div>
            );
          })}
        </div>
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 5: DANH SÁCH ĐỊA ĐIỂM DU LỊCH */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-28 px-4 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {title('attraction')}
            </h2>
            <div className="h-1 w-16 bg-orange-500 rounded-full" />
          </div>
          <Link href="#" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group pb-1">
            {cta('see_more')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <AttractionData locale={locale} />
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 6: DANH SÁCH ĐẶC SẢN ĐỊA PHƯƠNG */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-28 px-4 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {title('local_specialty')}
            </h2>
            <div className="h-1 w-16 bg-orange-500 rounded-full" />
          </div>
          <Link href="/local-specialty" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group pb-1">
            {cta('see_more')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <LocalSpecialtyData locale={locale} />
      </section>

      {/* -------------------------------------------------- */}
      {/* SECTION 7: DANH SÁCH VĂN HÓA NGHỆ THUẬT */}
      {/* -------------------------------------------------- */}
      <section className="container mx-auto pt-28 px-4 lg:px-8 space-y-8">
        <div className="flex items-end justify-between">
          <div className="space-y-1.5">
            <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight uppercase">
              {title('cultural_art')}
            </h2>
            <div className="h-1 w-16 bg-orange-500 rounded-full" />
          </div>
          <Link href="/cultural-arts" className="text-sm font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1 group pb-1">
            {cta('see_more')}
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        <CulturalArtData locale={locale} />
      </section>
    </div>

  );
}
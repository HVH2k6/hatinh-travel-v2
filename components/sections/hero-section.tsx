import { getTranslations } from 'next-intl/server';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { PlaneTakeoff, MapPinned } from 'lucide-react'; // Đảm bảo bạn đã cài lucide-react

export async function HeroSection() {
  // Lấy các câu dịch trên Server, trỏ vào nhánh "home.hero"
  const t = await getTranslations('home.hero');

  return (
    <section className="relative min-h-[85vh] w-full overflow-hidden flex items-center">
      
      {/* Background Image - Tối ưu cho Hà Tĩnh (nên dùng ảnh thật của Hà Tĩnh) */}
      {/* Tôi dùng placeholder ảnh đẹp của Hà Tĩnh để bạn dễ hình dung */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1779044991881-b1d0763fefe4?q=80&w=2129&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" // Ví dụ: Cảnh Thiên Cầm đẹp (bạn nên host ảnh trên server thật)
          alt="Hà Tĩnh, Thiên Cầm landscape"
          fill
          priority // Ảnh hero luôn phải load trước
          className="object-cover"
        />
        {/* Overlay tối để chữ dễ đọc */}
        <div className="absolute inset-0 bg-slate-950/50"></div>
      </div>

      {/* Content Container */}
      <div className="container mx-auto px-4 lg:px-8 relative z-10 text-white">
        <div className="max-w-3xl space-y-6">
          
          {/* Tiêu đề in hoa, in đậm, đa ngôn ngữ */}
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tighter uppercase leading-tight">
            {t('title')}
          </h1>
          
          {/* Mô tả chi tiết */}
          <p className="text-lg md:text-xl text-slate-100 max-w-2xl leading-relaxed">
            {t('description')}
          </p>
          
          {/* Nhóm Call-To-Action (CTA) Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
            
            {/* Button 1: Xem địa điểm, màu sắc trang nhã, đa ngôn ngữ */}
            <Button size="lg" className="w-full sm:w-auto font-semibold bg-white text-slate-900 hover:bg-slate-100">
              <MapPinned className="mr-2 h-5 w-5" />
              {t('ctaSeePlaces')}
            </Button>
        
          </div>
        </div>
      </div>
    </section>
  );
}
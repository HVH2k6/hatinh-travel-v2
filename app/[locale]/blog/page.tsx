import React from 'react';
import prisma from '@/lib/prisma';
import { BlogCard } from '@/components/cards/blog-card';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';

export default async function BlogListPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations('header');

  const blogs = await prisma.blog.findMany({
    where: { is_active: true },
    orderBy: { created_at: 'desc' },
  });

  return (
    <div className="bg-slate-50/30 min-h-screen pt-28 pb-12">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="space-y-2 mb-10 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight uppercase">
            {t('blog')}
          </h1>
          <div className="h-1 w-16 bg-orange-500 rounded-full mx-auto" />
          <p className="text-sm text-slate-500 mt-4 max-w-2xl mx-auto">
            Khám phá những câu chuyện, kinh nghiệm và vẻ đẹp văn hóa, du lịch tuyệt vời tại Hà Tĩnh qua các bài viết dưới đây.
          </p>
        </div>

        {blogs.length === 0 ? (
          <div className="text-center text-slate-500 py-20">
            Chưa có bài viết nào.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {blogs.map((blog) => (
              <BlogCard key={blog.id} item={blog} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

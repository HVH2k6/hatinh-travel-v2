import React from 'react';
import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { CalendarDays, User, Eye, ArrowLeft } from 'lucide-react';
import { Link } from '@/i18n/navigation';

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string, locale: string }> }) {
  const { slug } = await params;

  const blog = await prisma.blog.findUnique({
    where: { slug },
  });

  if (!blog || !blog.is_active) {
    notFound();
  }

  // Tăng lượt view (không cần await để tránh block render nếu không cần thiết, nhưng an toàn nhất là await trong Nextjs App Router)
  await prisma.blog.update({
    where: { id: blog.id },
    data: { views: { increment: 1 } }
  });

  return (
    <div className="bg-slate-50/30 min-h-screen pt-28 pb-16">
      <div className="max-w-4xl mx-auto px-4 lg:px-8">
        <Link href="/blog" className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-orange-600 transition-colors mb-8 group">
          <ArrowLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
          Quay lại danh sách
        </Link>

        <article className="bg-white rounded-3xl p-6 md:p-10 shadow-sm border border-slate-100">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-6">
            {blog.name}
          </h1>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-slate-500 mb-8 pb-8 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>{blog.author || 'Ẩn danh'}</span>
            </div>
            <div className="flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              <span>{new Date(blog.created_at).toLocaleDateString('vi-VN')}</span>
            </div>
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4" />
              <span>{blog.views + 1} lượt xem</span>
            </div>
          </div>

          {blog.image && (
            <div className="mb-10 rounded-2xl overflow-hidden aspect-[21/9]">
              <img src={blog.image} alt={blog.name} className="w-full h-full object-cover" />
            </div>
          )}

          <div 
            className="prose prose-slate prose-lg max-w-none 
            prose-headings:font-bold prose-headings:text-slate-900 
            prose-a:text-orange-600 prose-img:rounded-xl 
            whitespace-pre-wrap"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </article>
      </div>
    </div>
  );
}

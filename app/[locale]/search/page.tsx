'use client';

import { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { Search, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Link } from '@/i18n/navigation';
import Image from 'next/image';

// Helper: strip HTML tags và decode entities để render plain text an toàn
const stripHtml = (html: string | null | undefined): string => {
  if (!html) return '';
  return html
    .replace(/<[^>]*>/g, ' ')   // xóa tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#[0-9]+;/g, '')
    .replace(/\s+/g, ' ')       // gom nhiều khoảng trắng thành 1
    .trim();
};

interface SearchResult {
  id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  category_id: string;
  views: number;
  created_at: string;
  type: 'attraction' | 'specialty' | 'art';
}

export default function SearchPage() {
  const t = useTranslations('search');
  const locale = useLocale();

  const [query, setQuery] = useState('');
  const [types, setTypes] = useState<string[]>([]);
  const [sort, setSort] = useState('latest');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const filterOptions = [
    { id: 'attraction', label: t('type_attraction') },
    { id: 'specialty', label: t('type_specialty') },
    { id: 'art', label: t('type_art') },
  ];

  const fetchResults = async (reset = false, currentPage = page) => {
    // Không gọi API nếu chưa tích loại nào
    if (types.length === 0) {
      setResults([]);
      setHasMore(false);
      return;
    }
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query) params.append('q', query);
      params.append('types', types.join(','));
      if (sort) params.append('sort', sort);
      params.append('page', currentPage.toString());
      params.append('limit', '12');

      const response = await fetch(`${process.env.NEXT_PUBLIC_URL}/search?${params.toString()}`, {
        headers: {
          // Gửi ngôn ngữ hiện tại của web thay vì dùng header mặc định của browser
          'Accept-Language': locale,
        },
      });
      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();

      if (reset) {
        setResults(data.data);
      } else {
        setResults(prev => [...prev, ...data.data]);
      }
      setHasMore(currentPage < data.last_page);
    } catch (error) {
      console.error('Error fetching search results:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults(true, 1);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [types, sort]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchResults(true, 1);
    setPage(1);
  };

  const handleTypeChange = (typeId: string, checked: boolean) => {
    if (checked) {
      setTypes(prev => [...prev, typeId]);
    } else {
      setTypes(prev => prev.filter(t => t !== typeId));
    }
  };

  const getLinkHref = (item: SearchResult) => {
    if (item.type === 'attraction') return `/attractions/${item.slug}`;
    if (item.type === 'specialty') return `/local-specialty/${item.slug}`;
    if (item.type === 'art') return `/cultural-arts/${item.slug}`;
    return '#';
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4 lg:px-8">
        <h1 className="text-3xl font-extrabold text-slate-800 mb-8">{t('title')}</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Filters */}
          <div className="w-full lg:w-1/4">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 sticky top-24">
              <h3 className="font-bold text-lg mb-4 border-b pb-2">{t('filter_type')}</h3>
              <div className="space-y-4">
                {filterOptions.map((option) => (
                  <div key={option.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`type-${option.id}`}
                      checked={types.includes(option.id)}
                      onCheckedChange={(checked) => handleTypeChange(option.id, checked as boolean)}
                    />
                    <Label htmlFor={`type-${option.id}`} className="text-slate-700 cursor-pointer">
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>

              <h3 className="font-bold text-lg mt-8 mb-4 border-b pb-2">{t('sort_by')}</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-latest"
                    name="sort"
                    value="latest"
                    checked={sort === 'latest'}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <Label htmlFor="sort-latest" className="text-slate-700 cursor-pointer">{t('sort_latest')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="radio"
                    id="sort-views"
                    name="sort"
                    value="views_desc"
                    checked={sort === 'views_desc'}
                    onChange={(e) => setSort(e.target.value)}
                    className="w-4 h-4 text-orange-600 border-gray-300 focus:ring-orange-500"
                  />
                  <Label htmlFor="sort-views" className="text-slate-700 cursor-pointer">{t('sort_views')}</Label>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="w-full lg:w-3/4 flex flex-col gap-6">
            {/* Search Input Box */}
            <div className="bg-white p-2 rounded-2xl shadow-sm border border-slate-200">
              <form onSubmit={handleSearch} className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder={t('placeholder')}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="border-0 shadow-none focus-visible:ring-0 text-base py-6"
                />
                <Button type="submit" className="h-12 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold transition-all">
                  <Search className="mr-2 h-5 w-5" />
                  {t('button')}
                </Button>
              </form>
            </div>

            {/* Results Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {results.map((item) => (
                <Link key={`${item.type}-${item.id}`} href={getLinkHref(item)}>
                  <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-all border border-slate-100 group h-full flex flex-col">
                    <div className="relative h-48 w-full overflow-hidden bg-slate-200">
                      <Image
                        src={item.image || '/placeholder-image.jpg'}
                        alt={item.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute top-3 left-3">
                        <span className="bg-white/90 backdrop-blur-sm text-xs font-bold px-3 py-1.5 rounded-full text-slate-800 shadow-sm uppercase tracking-wider">
                          {item.type === 'attraction' ? t('type_attraction') : item.type === 'specialty' ? t('type_specialty') : t('type_art')}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex flex-col flex-grow">
                      <h3 className="font-bold text-lg text-slate-900 line-clamp-2 mb-2 group-hover:text-orange-600 transition-colors">
                        {item.name}
                      </h3>
                      {/* <p className="text-slate-500 text-sm line-clamp-3 mb-4">
                        {stripHtml(item.description) || 'Chưa có mô tả.'}
                      </p> */}
                      <div className="mt-auto flex items-center justify-between text-xs font-medium text-slate-400">
                        <div className="flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          <span>{item.views} {t('views')}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {types.length === 0 && !loading && (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-16 h-16 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-orange-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('filter_type')}</h3>
                <p className="text-slate-500">Vui lòng chọn ít nhất một loại để bắt đầu tìm kiếm.</p>
              </div>
            )}

            {types.length > 0 && results.length === 0 && !loading && (
              <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
                <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">{t('no_results')}</h3>
                <p className="text-slate-500">Thử thay đổi từ khóa hoặc bộ lọc để tìm được nhiều kết quả hơn.</p>
              </div>
            )}

            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  variant="outline"
                  className="rounded-xl px-8 font-bold text-slate-700 bg-white"
                  onClick={() => {
                    const nextPage = page + 1;
                    setPage(nextPage);
                    fetchResults(false, nextPage);
                  }}
                  disabled={loading}
                >
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Tải thêm
                </Button>
              </div>
            )}

            {loading && results.length === 0 && (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

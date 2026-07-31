export interface CulturalArtAddress {
  ward: string | null;
  address_detail: string;
  map_url: string | null;
}

export interface CulturalArtCategory {
  id: string;
  name: string | null;
}

export interface CulturalArt {
  id: string;
  image: string | null;
  list_image: string[] | null;
  link_video: string | null;
  name: string;
  slug: string;
  slugs?: Record<string, string>;
  description: string;
  is_featured: boolean;
  views: number;
  position: number;
  category: CulturalArtCategory | null;
  address: CulturalArtAddress;
  created_at: string | null;
}

export interface CulturalArtApiResponse {
  success: boolean;
  current_language: string;
  sort_by: string;
  data: CulturalArt[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}

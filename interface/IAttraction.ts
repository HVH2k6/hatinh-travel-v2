export interface AttractionAddress {
  ward: string | null;
  district: string | null;
  address_detail: string;
  map_url: string | null;
}

export interface TouristAttraction {
  id: string;
  image: string | null;
  sub_image: string[] | null;
  name: string;
  slug: string;
  slugs?: Record<string, string>;
  description: string;
  category: string | null;
  type: string | null;
  address: AttractionAddress;
  opening_time: string | null;
  closing_time: string | null;
  min_price: number;
  max_price: number;
  phone_number: string | null;
  website: string | null;
  is_featured: boolean;
  view_count: number;
}

export interface AttractionApiResponse {
  success: boolean;
  current_language: string;
  sort_by: string;
  data: TouristAttraction[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}

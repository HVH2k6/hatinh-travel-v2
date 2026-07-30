import { ILaravelPaginatedResponse } from './IShop';

export interface IProduct {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  price: number;
  image: string;
  list_image: string[];
  is_featured: boolean;
  unit: string;
}

export interface IGetShopProductsResponse {
  success: boolean;
  message: string;
  data: ILaravelPaginatedResponse<IProduct>;
}
export interface IProductShopRelation {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  rating: number;
}

export interface IProductDetail {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  list_image: string[];
  is_featured: boolean;
  unit: string;
  created_at: string;
  shop: IProductShopRelation | null;
}

export interface IGetProductDetailResponse {
  success: boolean;
  message: string;
  data: IProductDetail;
}

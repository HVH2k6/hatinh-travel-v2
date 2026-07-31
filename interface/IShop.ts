// 1. Interface thông tin vị trí của cửa hàng (gọt phẳng từ addressData)
export interface IShopLocation {
  address_detail: string; // Số nhà, ngõ ngách, tên đường
  ward_name: string;      // Tên Xã/Phường
  map_url: string | null; // Đường dẫn Google Maps
}

// 2. Interface cốt lõi của một Cửa hàng Đặc sản (Shop)
export interface IShop {
  id: string;             // Định dạng UUID từ Supabase
  slug: string;           // Slug SEO tương ứng với ngôn ngữ đang hiển thị
  name: string;           // Tên shop (Đã qua xử lý fallback đa ngôn ngữ)
  description: string;    // Mô tả shop (Đã qua xử lý đa ngôn ngữ)
  phone_number: string;   // Số điện thoại hotline
  contact_email: string;  // Email liên hệ
  logo_url: string | null;// URL ảnh đại diện CDN TikTok/Supabase
  rating: number;         // Điểm đánh giá (Float, Vd: 4.8)
  total_reviews: number;  // Tổng số lượng lượt review
  views: number;          // Số lượt xem cửa hàng
  location: IShopLocation;// Object thông tin vị trí chi tiết
  created_at: string;     // Định dạng ISO String (Vd: "2026-06-03T...")
}

// 3. Interface bọc gói phân trang chuẩn của Laravel (Pagination Layout)
export interface ILaravelPaginatedResponse<T> {
  current_page: number;
  data: T[];               // Mảng chứa danh sách (Vd: IShop[], IProduct[])
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  links: {
    url: string | null;
    label: string;
    active: boolean;
  }[];
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// 4. Interface bọc API gốc (Cục JSON nhận được từ Axios/Fetch)
export interface IGetShopsResponse {
  success: boolean;
  message: string;
  data: ILaravelPaginatedResponse<IShop>;
}
export interface IGetShopDetailResponse {
  success: boolean;
  message: string;
  data: IShop;
}
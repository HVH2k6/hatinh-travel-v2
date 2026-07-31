// 1. Interface Địa chỉ đặc sản (Đồng bộ với AttractionAddress)
export interface SpecialtyAddress {
  ward: string | null;
  district: string | null;
  address_detail: string;
  map_url: string | null;
}

// 2. Interface Danh mục đặc sản (Nếu hệ thống trả về object hoặc string phẳng)
export interface SpecialtyCategory {
  id: string;
  name: string | null;
}

// 3. Interface cốt lõi của một Đặc sản địa phương (Đồng bộ hoàn toàn với TouristAttraction)
export interface LocalSpecialty {
  id: string;
  image: string | null;
  sub_image: string[] | null;       // Đổi từ list_image sang sub_image
  name: string;
  slug: string;
  slugs?: Record<string, string>;   // Hỗ trợ map slug đa ngôn ngữ phục vụ SEO chuyển đổi ngôn ngữ nhanh
  description: string;              // Gộp chung hiển thị
  ingredients: string | null;       // Thành phần đặc trưng của món ăn/sản phẩm
  category: SpecialtyCategory | null; // Cấu trúc danh mục phân loại đặc sản
  unit: string | null;              // Đơn vị tính (Vd: "Hộp", "Kg", "Chai")
  price: number;                    // Giá gốc/Giá bán hiện tại
  address: SpecialtyAddress;        // Đổi từ location phẳng sang object address độc lập
  is_featured: boolean;
  view_count: number;               // Đổi từ views sang view_count
}

// 4. Interface bọc API gốc trả về danh sách (Đồng bộ hoàn toàn với AttractionApiResponse)
export interface SpecialtyApiResponse {
  success: boolean;
  current_language: string;
  sort_by: string;
  data: LocalSpecialty[];
  pagination: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}
// 1. Interface đại diện cho cụm dữ liệu địa chỉ liên kết (Đã dịch i18n)
export interface AttractionAddress {
  ward: string | null;          // Tên Phường/Xã cố định (vđ: "Xã Cẩm Xuyên")
  district: string | null;      // Tên Quận/Huyện cố định (vđ: "Huyện Cẩm Xuyên")
  address_detail: string;       // Số nhà, tên đường đã dịch i18n (vđ: "ngo quyen street")
  map_url: string | null;       // Đường dẫn Google Maps dùng chung
}

// 2. Interface chính của Địa điểm du lịch (Tourist Attraction)
export interface TouristAttraction {
  id: string;                   // Khóa chính dạng UUID
  image: string | null;         // Link ảnh đại diện chính (TikTok CDN)
  sub_image: string[] | null;   // Mảng chuỗi chứa link ảnh phụ (Laravel đã cast JSON thành Array)
  name: string;                 // Tên danh thắng đã dịch (vđ: "Thiem Cam Beach")
  slug: string;                 // Slug băm theo tiếng phục vụ SEO URL đẹp
  slugs?: Record<string, string>;
  description: string;          // Bài giới thiệu/Review chi tiết theo tiếng
  category: string | null;      // Tên danh mục liên kết đã dịch (vđ: "Tour", "Danh lam")
  type: string | null;          // Tên loại hình liên kết đã dịch (vđ: "Biển", "Tâm linh")
  address: AttractionAddress;   // Khối Object vị trí hành chính & chi tiết
  opening_time: string | null;  // Giờ mở cửa dạng string (vđ: "07:00:00")
  closing_time: string | null;  // Giờ đóng cửa dạng string (vđ: "19:00:00")
  min_price: number;            // Giá sàn (Đã được Laravel ép sang kiểu number)
  max_price: number;            // Giá trần
  phone_number: string | null;  // Hotline liên hệ BQL
  website: string | null;       // Website/Fanpage chính thức
  is_featured: boolean;         // Đánh dấu địa điểm HOT nổi bật
  view_count: number;           // Số lượt click xem thực tế
}

// 3. Wrapper bọc phản hồi API tổng thể từ Laravel (Cực kỳ tiện khi destructuring)
export interface AttractionApiResponse {
  success: boolean;
  current_language: string;
  sort_by: string;
  data: TouristAttraction[];     // Mảng danh sách địa điểm khớp interface trên
  pagination: {                  // Metadata phục vụ chia trang, sẽ là null nếu dùng ?limit=
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  } | null;
}
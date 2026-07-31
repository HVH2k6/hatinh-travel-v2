export interface IReview {
  id: string;
  user: {
    id: string;
    name: string;
    avatar_url: string;
  };
  rating: number;
  review_content: string | null; // 🚀 CẬP NHẬT KIỂU DỮ LIỆU ĐỒNG BỘ
  list_image: string[];
  reply_message: string | null;
  pin: boolean;
  created_at: string;
}

export interface IStoreReviewBody {
  type: 'product' | 'shop' | 'location';
  id: string;
  rating: number;
  review_content?: string; // 🚀 CẬP NHẬT KIỂU DỮ LIỆU ĐỒNG BỘ
  list_image?: string; 
}
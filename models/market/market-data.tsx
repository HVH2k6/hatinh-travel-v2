import ShopCard from "@/components/cards/shop-card";
import { IGetShopsResponse } from "@/interface/IShop";


// Dưới đây là ví dụ lặp mảng
export default function ShopsList({ response }: { response: IGetShopsResponse }) {
  
  if (!response.success || !response.data.data.length) {
    return <div className="text-center p-10 text-slate-500">Không tìm thấy gian hàng nào.</div>;
  }

  const shops = response.data.data; // Mảng chứa IShop[]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      {shops.map((shop) => (
        <ShopCard key={shop.id} shop={shop} />
      ))}
    </div>
  );
}
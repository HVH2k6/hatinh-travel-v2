import prisma from './lib/prisma';

async function main() {
  try {
    const reviews = await prisma.review.findMany({
      include: {
        user: true
      },
      orderBy: { created_at: 'desc' },
      skip: 0,
      take: 10
    });
    console.log("Reviews fetched:", reviews.length);
    
    const productIds: string[] = [];
    const shopIds: string[] = [];
    const attractionIds: string[] = [];
    const specialtyIds: string[] = [];
    const artIds: string[] = [];

    reviews.forEach((r: any) => {
      if (r.reviewable_type === 'Product' || r.reviewable_type === 'App\\Models\\Product') productIds.push(r.reviewable_id);
      else if (r.reviewable_type === 'Shop' || r.reviewable_type === 'App\\Models\\Shop') shopIds.push(r.reviewable_id);
      else if (r.reviewable_type === 'TouristAttraction' || r.reviewable_type === 'App\\Models\\TouristAttraction') attractionIds.push(r.reviewable_id);
      else if (r.reviewable_type === 'LocalSpecialty' || r.reviewable_type === 'App\\Models\\LocalSpecialty') specialtyIds.push(r.reviewable_id);
      else if (r.reviewable_type === 'CulturalArt' || r.reviewable_type === 'App\\Models\\CulturalArt') artIds.push(r.reviewable_id);
    });
    
    console.log("IDs parsed", { productIds, shopIds, attractionIds, specialtyIds, artIds });

    const [products, shops, attractions, specialties, arts] = await Promise.all([
      productIds.length > 0 ? prisma.product.findMany({ where: { id: { in: productIds } }, select: { id: true, translations: true } }) : [],
      shopIds.length > 0 ? prisma.shop.findMany({ where: { id: { in: shopIds } }, select: { id: true, translations: true } }) : [],
      attractionIds.length > 0 ? prisma.tourist_Attraction.findMany({ where: { id: { in: attractionIds } }, select: { id: true, translations: true } }) : [],
      specialtyIds.length > 0 ? prisma.local_Specialty.findMany({ where: { id: { in: specialtyIds } }, select: { id: true, translations: true } }) : [],
      artIds.length > 0 ? prisma.cultural_Art.findMany({ where: { id: { in: artIds } }, select: { id: true, translations: true } }) : []
    ]);
    
    console.log("Bulk query completed.");

    const formattedReviews = reviews.map((review: any) => {
      const date = new Date(review.created_at);
      const formattedDate = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
      
      let targetName = 'Không xác định';
      let typeLabel = '';

      if (review.reviewable_type === 'Product' || review.reviewable_type === 'App\\Models\\Product') {
        const p = products.find((x: any) => x.id === review.reviewable_id);
        targetName = p?.translations?.find((t:any) => t.language_code === 'vi')?.name || 'Sản phẩm';
        typeLabel = 'Sản phẩm';
      } else if (review.reviewable_type === 'Shop' || review.reviewable_type === 'App\\Models\\Shop') {
        const s = shops.find((x: any) => x.id === review.reviewable_id);
        targetName = s?.translations?.find((t:any) => t.language_code === 'vi')?.name || 'Cửa hàng';
        typeLabel = 'Cửa hàng';
      } else if (review.reviewable_type === 'TouristAttraction' || review.reviewable_type === 'App\\Models\\TouristAttraction') {
        const a = attractions.find((x: any) => x.id === review.reviewable_id);
        targetName = a?.translations?.find((t:any) => t.language_code === 'vi')?.name || 'Điểm du lịch';
        typeLabel = 'Điểm du lịch';
      } else if (review.reviewable_type === 'LocalSpecialty' || review.reviewable_type === 'App\\Models\\LocalSpecialty') {
        const ls = specialties.find((x: any) => x.id === review.reviewable_id);
        targetName = ls?.translations?.find((t:any) => t.language_code === 'vi')?.name || 'Đặc sản';
        typeLabel = 'Đặc sản';
      } else if (review.reviewable_type === 'CulturalArt' || review.reviewable_type === 'App\\Models\\CulturalArt') {
        const ca = arts.find((x: any) => x.id === review.reviewable_id);
        targetName = ca?.translations?.find((t:any) => t.language_code === 'vi')?.name || 'VH Nghệ thuật';
        typeLabel = 'VH Nghệ thuật';
      }

      return {
        id: review.id,
        user: {
          id: review.user_id,
          name: review.user?.username || 'Khách hàng ẩn danh',
          avatar_url: review.user?.avatar || '/default-avatar.png'
        },
        target_name: `${typeLabel}: ${targetName}`,
        reviewable_type: review.reviewable_type,
        rating: review.rating,
        review_content: review.review_content,
        list_image: review.list_image || [],
        reply_message: review.reply_message,
        pin: review.pin || false,
        is_approved: review.is_approved,
        created_at: formattedDate
      };
    });
    
    console.log("Mapped reviews", formattedReviews);
  } catch (error) {
    console.error("Test Error:", error);
  }
}
main();

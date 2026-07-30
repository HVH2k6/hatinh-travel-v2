import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import prisma from '@/lib/prisma';
import { getWeatherForecast } from '@/lib/weather';

function formatWeather(weatherData: any) {
  if (!weatherData || !weatherData.daily) return 'Không có dữ liệu thời tiết.';
  
  const daily = weatherData.daily;
  let weatherStr = '';
  
  for (let i = 0; i < Math.min(3, daily.time.length); i++) {
    const date = daily.time[i];
    const maxTemp = daily.temperature_2m_max[i];
    const minTemp = daily.temperature_2m_min[i];
    const rain = daily.precipitation_sum[i];
    const code = daily.weathercode[i];
    
    let condition = 'Có mây';
    if (code === 0) condition = 'Trời trong xanh';
    else if (code >= 1 && code <= 3) condition = 'Có mây';
    else if (code >= 45 && code <= 48) condition = 'Có sương mù';
    else if (code >= 51 && code <= 67) condition = 'Trời mưa';
    else if (code >= 71 && code <= 77) condition = 'Có tuyết rơi';
    else if (code >= 80 && code <= 82) condition = 'Mưa rào lớn';
    else if (code >= 95) condition = 'Có sấm chớp, mưa bão';
    
    weatherStr += `- Ngày ${date}: ${condition}, Nhiệt độ: ${minTemp}°C - ${maxTemp}°C, Lượng mưa: ${rain}mm\n`;
  }
  return weatherStr;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ success: false, message: 'Message is required' }, { status: 400 });
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({ success: false, message: 'Thiếu cấu hình OPENAI_API_KEY trong hệ thống' }, { status: 500 });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Lấy thời tiết
    const weatherData = await getWeatherForecast();
    const weatherContext = formatWeather(weatherData);

    // Lấy context DB (top địa điểm, đặc sản, văn hóa)
    const [attractions, specialties, arts] = await Promise.all([
      prisma.tourist_Attraction.findMany({
        where: { is_active: true },
        take: 5,
        orderBy: { view_count: 'desc' },
        include: { translations: { where: { language_code: 'vi' } } }
      }),
      prisma.local_Specialty.findMany({
        where: { status: 'active' },
        take: 5,
        orderBy: { views: 'desc' },
        include: { translations: { where: { language_code: 'vi' } } }
      }),
      prisma.cultural_Art.findMany({
        where: { is_active: true },
        take: 5,
        orderBy: { views: 'desc' },
        include: { translations: { where: { language_code: 'vi' } } }
      })
    ]);

    let dbContext = 'CÁC ĐỊA ĐIỂM DU LỊCH NỔI BẬT Ở HÀ TĨNH:\n';
    attractions.forEach(a => {
      const name = a.translations[0]?.name || 'Không rõ';
      const desc = a.translations[0]?.description?.substring(0, 100) || '';
      dbContext += `- ${name}: Giá từ ${a.min_price || 0} đến ${a.max_price || 0}. Mô tả ngắn: ${desc}...\n`;
    });

    dbContext += '\nĐẶC SẢN ĐỊA PHƯƠNG:\n';
    specialties.forEach(s => {
      const name = s.translations[0]?.name || 'Không rõ';
      dbContext += `- ${name}: Giá khoảng ${s.price || 0}\n`;
    });

    dbContext += '\nVĂN HÓA NGHỆ THUẬT:\n';
    arts.forEach(a => {
      const name = a.translations[0]?.name || 'Không rõ';
      dbContext += `- ${name}\n`;
    });

    const systemPrompt = `Bạn là một chuyên gia du lịch am hiểu về Hà Tĩnh, nhiệt tình và thân thiện.
Bạn đang tư vấn cho du khách bằng tiếng Việt.
Dưới đây là thông tin thời tiết trong 3 ngày tới ở Hà Tĩnh:
${weatherContext}

Dưới đây là một số thông tin tham khảo về các địa điểm, đặc sản và văn hóa nổi bật tại Hà Tĩnh (lấy từ CSDL hệ thống):
${dbContext}

Nhiệm vụ của bạn:
- Hãy trả lời câu hỏi của người dùng dựa trên thông tin thời tiết và thông tin địa điểm (giá cả, loại hình) ở trên.
- Nếu trời mưa to (precipitation_sum > 10) hoặc có sấm chớp, hãy khuyên họ không nên đi biển hoặc đi núi, ưu tiên các trải nghiệm trong nhà, ẩm thực đặc sản hoặc trải nghiệm văn hóa.
- Nếu người dùng nhắc đến giá cả, hãy tư vấn địa điểm phù hợp với túi tiền dựa vào min_price và max_price.
- Trả lời ngắn gọn, súc tích, định dạng dễ nhìn (dùng bullet points) và tự nhiên nhất.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Dùng model nhanh và rẻ
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 800,
    });

    const reply = response.choices[0]?.message?.content || 'Xin lỗi, tôi không thể trả lời lúc này.';

    return NextResponse.json({
      success: true,
      data: reply
    });

  } catch (error) {
    console.error('AI Consult Error:', error);
    return NextResponse.json({ success: false, message: 'Lỗi khi gọi API AI' }, { status: 500 });
  }
}

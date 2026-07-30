export async function getWeatherForecast() {
  try {
    // Tọa độ Hà Tĩnh: Vĩ độ 18.3333, Kinh độ 105.9
    const response = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=18.3333&longitude=105.9&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=Asia/Ho_Chi_Minh',
      { next: { revalidate: 3600 } } // Cache 1 giờ
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch weather');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching weather:', error);
    return null;
  }
}

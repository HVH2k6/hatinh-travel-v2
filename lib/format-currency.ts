// Định nghĩa tỉ giá giả lập so với VNĐ (VND làm gốc)
// Thực tế: Sếp nên bắt Backend trả mảng tỉ giá này về qua API cho chuẩn xác theo ngày
const EXCHANGE_RATES: Record<string, number> = {
  vi: 1,           // VNĐ
  en: 26364,       // 1 USD 
  zh: 3875,        // 1 CNY 
  ja: 165,         // 1 JPY 
  ko: 17.5,        // 1 KRW 
  ru: 275,         // 1 RUB 
};

// Map locale của hệ thống với mã tiền tệ chuẩn quốc tế (ISO 4217)
const CURRENCY_CONFIG: Record<string, { currency: string; localeMap: string }> = {
  vi: { currency: 'VND', localeMap: 'vi-VN' },
  en: { currency: 'USD', localeMap: 'en-US' },
  zh: { currency: 'CNY', localeMap: 'zh-CN' },
  ja: { currency: 'JPY', localeMap: 'ja-JP' },
  ko: { currency: 'KRW', localeMap: 'ko-KR' },
  ru: { currency: 'RUB', localeMap: 'ru-RU' },
};

/**
 * Hàm quy đổi và định dạng tiền tệ đa quốc gia
 * @param amountInVND Số tiền gốc bằng VNĐ lấy từ Database
 * @param currentLocale Ngôn ngữ hiện tại (vi, en, zh...)
 * @returns Chuỗi tiền tệ đã format đẹp mắt (VD: $13.75, 350.000 ₫)
 */
export function formatCurrency(amountInVND: number, currentLocale: string): string {
  // 1. Lấy cấu hình tiền tệ, nếu không có thì mặc định lấy tiếng Việt
  const rate = EXCHANGE_RATES[currentLocale] || 1;
  const config = CURRENCY_CONFIG[currentLocale] || CURRENCY_CONFIG['vi'];

  // 2. Quy đổi giá trị toán học
  const convertedAmount = amountInVND / rate;

  // 3. Quy tắc làm tròn: Các nước dùng tiền mệnh giá to (VND, JPY, KRW) không lấy số thập phân
  const isNoDecimalCurrency = ['VND', 'JPY', 'KRW'].includes(config.currency);

  // 4. Trả về chuỗi format chuẩn quốc tế
  return new Intl.NumberFormat(config.localeMap, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: isNoDecimalCurrency ? 0 : 2,
    maximumFractionDigits: isNoDecimalCurrency ? 0 : 2,
  }).format(convertedAmount);
}
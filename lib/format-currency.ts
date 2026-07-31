// Định nghĩa tỉ giá giả lập so với VNĐ (VND làm gốc)
// Nên lấy từ Backend/API theo thời gian thực để đảm bảo chính xác
const EXCHANGE_RATES: Record<string, number> = {
  vi: 1,          // VND
  en: 26364,      // USD
  zh: 3875,       // CNY
  ja: 165,        // JPY
  ko: 17.5,       // KRW
  ru: 275,        // RUB

  // Thêm
  fr: 30800,      // EUR (Pháp)
  de: 30800,      // EUR (Đức)
  es: 30800,      // EUR (Tây Ban Nha)
  it: 30800,      // EUR (Ý)

  gb: 35700,      // GBP (Anh)
  th: 810,        // THB (Thái Lan)
  sg: 19600,      // SGD (Singapore)
  au: 17300,      // AUD (Úc)
};

// Map locale của hệ thống với mã tiền tệ ISO 4217
const CURRENCY_CONFIG: Record<
  string,
  { currency: string; localeMap: string }
> = {
  vi: { currency: 'VND', localeMap: 'vi-VN' },
  en: { currency: 'USD', localeMap: 'en-US' },
  zh: { currency: 'CNY', localeMap: 'zh-CN' },
  ja: { currency: 'JPY', localeMap: 'ja-JP' },
  ko: { currency: 'KRW', localeMap: 'ko-KR' },
  ru: { currency: 'RUB', localeMap: 'ru-RU' },

  // Euro
  fr: { currency: 'EUR', localeMap: 'fr-FR' },
  de: { currency: 'EUR', localeMap: 'de-DE' },
  es: { currency: 'EUR', localeMap: 'es-ES' },
  it: { currency: 'EUR', localeMap: 'it-IT' },

  // Khác
  gb: { currency: 'GBP', localeMap: 'en-GB' },
  th: { currency: 'THB', localeMap: 'th-TH' },
  sg: { currency: 'SGD', localeMap: 'en-SG' },
  au: { currency: 'AUD', localeMap: 'en-AU' },
};

/**
 * Format tiền tệ theo locale
 *
 * @param amountInVND Số tiền gốc (VNĐ)
 * @param currentLocale Locale hiện tại (vi, en, fr...)
 */
export function formatCurrency(
  amountInVND: number,
  currentLocale: string
): string {
  // Lấy tỉ giá và cấu hình
  const rate = EXCHANGE_RATES[currentLocale] ?? EXCHANGE_RATES.vi;
  const config =
    CURRENCY_CONFIG[currentLocale] ?? CURRENCY_CONFIG.vi;

  // Quy đổi
  const convertedAmount = amountInVND / rate;

  // Những đồng tiền không hiển thị phần thập phân
  const noDecimalCurrencies = ['VND', 'JPY', 'KRW'];

  const isNoDecimal = noDecimalCurrencies.includes(config.currency);

  return new Intl.NumberFormat(config.localeMap, {
    style: 'currency',
    currency: config.currency,
    minimumFractionDigits: isNoDecimal ? 0 : 2,
    maximumFractionDigits: isNoDecimal ? 0 : 2,
  }).format(convertedAmount);
}
export interface Currency {
  code: string;
  nameAr: string;
  nameEn: string;
  symbol: string;
  rate: number;
}

export const CURRENCIES: Currency[] = [
  { code: "USD", nameAr: "دولار أمريكي", nameEn: "US Dollar", symbol: "$", rate: 1 },
  { code: "AED", nameAr: "درهم إماراتي", nameEn: "UAE Dirham", symbol: "د.إ", rate: 3.6725 },
  { code: "EUR", nameAr: "يورو", nameEn: "Euro", symbol: "€", rate: 0.92 },
  { code: "GBP", nameAr: "جنيه إسترليني", nameEn: "British Pound", symbol: "£", rate: 0.79 },
  { code: "SAR", nameAr: "ريال سعودي", nameEn: "Saudi Riyal", symbol: "ر.س", rate: 3.75 },
  { code: "JPY", nameAr: "ين ياباني", nameEn: "Japanese Yen", symbol: "¥", rate: 149.5 },
  { code: "AUD", nameAr: "دولار أسترالي", nameEn: "Australian Dollar", symbol: "A$", rate: 1.53 },
  { code: "CAD", nameAr: "دولار كندي", nameEn: "Canadian Dollar", symbol: "C$", rate: 1.36 },
];

export function convertCurrency(amountUSD: number, toCurrency: string): number {
  const currency = CURRENCIES.find((c) => c.code === toCurrency);
  if (!currency) return amountUSD;
  return amountUSD * currency.rate;
}

export function formatCurrency(amountUSD: number, currencyCode: string): string {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency) return `$${amountUSD.toLocaleString()}`;
  const converted = convertCurrency(amountUSD, currencyCode);
  return `${currency.symbol} ${converted.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function getCurrencyByCode(code: string): Currency {
  return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
}

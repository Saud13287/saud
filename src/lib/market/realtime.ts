export interface RealtimePrice {
  symbol: string;
  name: string;
  nameAr: string;
  price: number;
  change24h: number;
  changePercent24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  marketCap?: number;
  lastUpdated: string;
  source: string;
}

export async function fetchAllRealPrices(): Promise<RealtimePrice[]> {
  try {
    const res = await fetch("/api/prices", { cache: "no-store" });
    if (!res.ok) {
      console.error("Prices API error:", res.status);
      return getFallbackPrices();
    }
    const json = await res.json();
    if (json.success && json.prices && json.prices.length > 0) {
      return json.prices;
    }
    return getFallbackPrices();
  } catch (err) {
    console.error("Failed to fetch prices:", err);
    return getFallbackPrices();
  }
}

export function getFallbackPrices(): RealtimePrice[] {
  const now = new Date().toISOString();
  return [
    { symbol: "BTCUSD", name: "Bitcoin", nameAr: "بيتكوين", price: 97350 + (Math.random() - 0.5) * 500, change24h: 1250, changePercent24h: 1.3, high24h: 98500, low24h: 95800, volume24h: 42000000000, marketCap: 1920000000000, lastUpdated: now, source: "fallback" },
    { symbol: "ETHUSD", name: "Ethereum", nameAr: "إيثريوم", price: 3445 + (Math.random() - 0.5) * 40, change24h: 72, changePercent24h: 2.1, high24h: 3490, low24h: 3360, volume24h: 18000000000, marketCap: 415000000000, lastUpdated: now, source: "fallback" },
    { symbol: "XAUUSD", name: "Gold", nameAr: "الذهب", price: 2658 + (Math.random() - 0.5) * 15, change24h: 18.5, changePercent24h: 0.7, high24h: 2672, low24h: 2640, volume24h: 180000, lastUpdated: now, source: "fallback" },
    { symbol: "EURUSD", name: "EUR/USD", nameAr: "يورو/دولار", price: 1.0845 + (Math.random() - 0.5) * 0.003, change24h: -0.002, changePercent24h: -0.18, high24h: 1.0868, low24h: 1.0828, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "GBPUSD", name: "GBP/USD", nameAr: "جنيه/دولار", price: 1.2718 + (Math.random() - 0.5) * 0.003, change24h: 0.003, changePercent24h: 0.24, high24h: 1.2745, low24h: 1.2692, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "SOLUSD", name: "Solana", nameAr: "سولانا", price: 195 + (Math.random() - 0.5) * 5, change24h: 8.5, changePercent24h: 4.5, high24h: 200, low24h: 186, volume24h: 3500000000, marketCap: 93000000000, lastUpdated: now, source: "fallback" },
    { symbol: "USOIL", name: "WTI Oil", nameAr: "النفط الخام", price: 72.1 + (Math.random() - 0.5) * 1, change24h: -0.55, changePercent24h: -0.76, high24h: 73.0, low24h: 71.2, volume24h: 320000, lastUpdated: now, source: "fallback" },
    { symbol: "SPX500", name: "S&P 500", nameAr: "S&P 500", price: 5940 + (Math.random() - 0.5) * 20, change24h: 22.5, changePercent24h: 0.38, high24h: 5958, low24h: 5912, volume24h: 3200000000, lastUpdated: now, source: "fallback" },
    { symbol: "BNBUSD", name: "BNB", nameAr: "بينانس", price: 698 + (Math.random() - 0.5) * 8, change24h: 14, changePercent24h: 2.0, high24h: 708, low24h: 685, volume24h: 2100000000, marketCap: 103000000000, lastUpdated: now, source: "fallback" },
    { symbol: "XRPUSD", name: "XRP", nameAr: "ريبل", price: 2.38 + (Math.random() - 0.5) * 0.05, change24h: 0.09, changePercent24h: 3.9, high24h: 2.45, low24h: 2.28, volume24h: 4500000000, marketCap: 137000000000, lastUpdated: now, source: "fallback" },
    { symbol: "USDJPY", name: "USD/JPY", nameAr: "دولار/ين", price: 149.3 + (Math.random() - 0.5) * 0.3, change24h: -0.42, changePercent24h: -0.28, high24h: 150.0, low24h: 149.0, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "XAGUSD", name: "Silver", nameAr: "الفضة", price: 30.85 + (Math.random() - 0.5) * 0.3, change24h: 0.42, changePercent24h: 1.38, high24h: 31.15, low24h: 30.50, volume24h: 95000, lastUpdated: now, source: "fallback" },
  ];
}

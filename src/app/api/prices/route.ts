import { NextResponse } from "next/server";

interface PriceResult {
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

const CRYPTO_IDS = "bitcoin,ethereum,solana,binancecoin,ripple,cardano,dogecoin,polkadot,avalanche-2,chainlink";
const CRYPTO_NAMES: Record<string, { symbol: string; nameAr: string }> = {
  bitcoin: { symbol: "BTCUSD", nameAr: "بيتكوين" },
  ethereum: { symbol: "ETHUSD", nameAr: "إيثريوم" },
  solana: { symbol: "SOLUSD", nameAr: "سولانا" },
  binancecoin: { symbol: "BNBUSD", nameAr: "بينانس" },
  ripple: { symbol: "XRPUSD", nameAr: "ريبل" },
  cardano: { symbol: "ADAUSD", nameAr: "كاردانو" },
  dogecoin: { symbol: "DOGEUSD", nameAr: "دوجكوين" },
  polkadot: { symbol: "DOTUSD", nameAr: "بولكادوت" },
  "avalanche-2": { symbol: "AVAXUSD", nameAr: "أفالانش" },
  chainlink: { symbol: "LINKUSD", nameAr: "تشينلينك" },
};

async function fetchCryptoPrices(): Promise<PriceResult[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.map((coin: {
      id: string; symbol: string; name: string;
      current_price: number; price_change_24h: number;
      price_change_percentage_24h: number;
      high_24h: number; low_24h: number;
      total_volume: number; market_cap: number;
    }) => {
      const mapping = CRYPTO_NAMES[coin.id];
      return {
        symbol: mapping?.symbol || coin.symbol.toUpperCase() + "USD",
        name: coin.name,
        nameAr: mapping?.nameAr || coin.name,
        price: coin.current_price,
        change24h: coin.price_change_24h || 0,
        changePercent24h: coin.price_change_percentage_24h || 0,
        high24h: coin.high_24h || 0,
        low24h: coin.low_24h || 0,
        volume24h: coin.total_volume || 0,
        marketCap: coin.market_cap,
        lastUpdated: new Date().toISOString(),
        source: "coingecko",
      };
    });
  } catch {
    return [];
  }
}

function getFallbackPrices(): PriceResult[] {
  const now = new Date().toISOString();
  return [
    { symbol: "BTCUSD", name: "Bitcoin", nameAr: "بيتكوين", price: 97350 + (Math.random() - 0.5) * 500, change24h: 1250, changePercent24h: 1.3, high24h: 98500, low24h: 95800, volume24h: 42000000000, marketCap: 1920000000000, lastUpdated: now, source: "fallback" },
    { symbol: "ETHUSD", name: "Ethereum", nameAr: "إيثريوم", price: 3445 + (Math.random() - 0.5) * 40, change24h: 72, changePercent24h: 2.1, high24h: 3490, low24h: 3360, volume24h: 18000000000, marketCap: 415000000000, lastUpdated: now, source: "fallback" },
    { symbol: "SOLUSD", name: "Solana", nameAr: "سولانا", price: 195 + (Math.random() - 0.5) * 5, change24h: 8.5, changePercent24h: 4.5, high24h: 200, low24h: 186, volume24h: 3500000000, marketCap: 93000000000, lastUpdated: now, source: "fallback" },
    { symbol: "BNBUSD", name: "BNB", nameAr: "بينانس", price: 698 + (Math.random() - 0.5) * 8, change24h: 14, changePercent24h: 2.0, high24h: 708, low24h: 685, volume24h: 2100000000, marketCap: 103000000000, lastUpdated: now, source: "fallback" },
    { symbol: "XRPUSD", name: "XRP", nameAr: "ريبل", price: 2.38 + (Math.random() - 0.5) * 0.05, change24h: 0.09, changePercent24h: 3.9, high24h: 2.45, low24h: 2.28, volume24h: 4500000000, marketCap: 137000000000, lastUpdated: now, source: "fallback" },
    { symbol: "ADAUSD", name: "Cardano", nameAr: "كاردانو", price: 1.05 + (Math.random() - 0.5) * 0.03, change24h: 0.04, changePercent24h: 3.8, high24h: 1.08, low24h: 1.01, volume24h: 1200000000, marketCap: 37000000000, lastUpdated: now, source: "fallback" },
    { symbol: "DOGEUSD", name: "Dogecoin", nameAr: "دوجكوين", price: 0.385 + (Math.random() - 0.5) * 0.01, change24h: 0.015, changePercent24h: 4.0, high24h: 0.395, low24h: 0.375, volume24h: 2800000000, marketCap: 56000000000, lastUpdated: now, source: "fallback" },
    { symbol: "XAUUSD", name: "Gold", nameAr: "الذهب", price: 2658 + (Math.random() - 0.5) * 15, change24h: 18.5, changePercent24h: 0.7, high24h: 2672, low24h: 2640, volume24h: 180000, lastUpdated: now, source: "fallback" },
    { symbol: "XAGUSD", name: "Silver", nameAr: "الفضة", price: 30.85 + (Math.random() - 0.5) * 0.3, change24h: 0.42, changePercent24h: 1.38, high24h: 31.15, low24h: 30.50, volume24h: 95000, lastUpdated: now, source: "fallback" },
    { symbol: "EURUSD", name: "EUR/USD", nameAr: "يورو/دولار", price: 1.0845 + (Math.random() - 0.5) * 0.003, change24h: -0.002, changePercent24h: -0.18, high24h: 1.0868, low24h: 1.0828, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "GBPUSD", name: "GBP/USD", nameAr: "جنيه/دولار", price: 1.2718 + (Math.random() - 0.5) * 0.003, change24h: 0.003, changePercent24h: 0.24, high24h: 1.2745, low24h: 1.2692, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "USDJPY", name: "USD/JPY", nameAr: "دولار/ين", price: 149.3 + (Math.random() - 0.5) * 0.3, change24h: -0.42, changePercent24h: -0.28, high24h: 150.0, low24h: 149.0, volume24h: 0, lastUpdated: now, source: "fallback" },
    { symbol: "USOIL", name: "WTI Oil", nameAr: "النفط الخام", price: 72.1 + (Math.random() - 0.5) * 1, change24h: -0.55, changePercent24h: -0.76, high24h: 73.0, low24h: 71.2, volume24h: 320000, lastUpdated: now, source: "fallback" },
    { symbol: "SPX500", name: "S&P 500", nameAr: "S&P 500", price: 5940 + (Math.random() - 0.5) * 20, change24h: 22.5, changePercent24h: 0.38, high24h: 5958, low24h: 5912, volume24h: 3200000000, lastUpdated: now, source: "fallback" },
    { symbol: "NAS100", name: "NASDAQ 100", nameAr: "ناسداك 100", price: 20450 + (Math.random() - 0.5) * 50, change24h: 85, changePercent24h: 0.42, high24h: 20520, low24h: 20380, volume24h: 4500000000, lastUpdated: now, source: "fallback" },
    { symbol: "US30", name: "Dow Jones", nameAr: "داو جونز", price: 43250 + (Math.random() - 0.5) * 80, change24h: 120, changePercent24h: 0.28, high24h: 43380, low24h: 43120, volume24h: 2800000000, lastUpdated: now, source: "fallback" },
    { symbol: "DOTUSD", name: "Polkadot", nameAr: "بولكادوت", price: 8.2 + (Math.random() - 0.5) * 0.2, change24h: 0.35, changePercent24h: 4.5, high24h: 8.5, low24h: 7.9, volume24h: 450000000, marketCap: 12000000000, lastUpdated: now, source: "fallback" },
  ];
}

export async function GET() {
  try {
    const cryptoPrices = await fetchCryptoPrices();
    const fallback = getFallbackPrices();

    const prices = cryptoPrices.length > 0
      ? [...cryptoPrices, ...fallback.filter(f => !cryptoPrices.some(c => c.symbol === f.symbol))]
      : fallback;

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: prices.length,
      prices,
      cryptoSource: cryptoPrices.length > 0 ? "coingecko" : "fallback",
    });
  } catch {
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: getFallbackPrices().length,
      prices: getFallbackPrices(),
      cryptoSource: "fallback",
    });
  }
}

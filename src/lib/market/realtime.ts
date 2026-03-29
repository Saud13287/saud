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

const CRYPTO_MAP: Record<string, { id: string; name: string; nameAr: string }> = {
  BTCUSD: { id: "bitcoin", name: "Bitcoin", nameAr: "بيتكوين" },
  ETHUSD: { id: "ethereum", name: "Ethereum", nameAr: "إيثريوم" },
  BNBUSD: { id: "binancecoin", name: "BNB", nameAr: "بينانس" },
  SOLUSD: { id: "solana", name: "Solana", nameAr: "سولانا" },
  XRPUSD: { id: "ripple", name: "XRP", nameAr: "ريبل" },
  ADAUSD: { id: "cardano", name: "Cardano", nameAr: "كاردانو" },
  DOGEUSD: { id: "dogecoin", name: "Dogecoin", nameAr: "دوجكوين" },
  DOTUSD: { id: "polkadot", name: "Polkadot", nameAr: "بولكادوت" },
  AVAXUSD: { id: "avalanche-2", name: "Avalanche", nameAr: "أفالانش" },
  LINKUSD: { id: "chainlink", name: "Chainlink", nameAr: "تشينلينك" },
};

const TRADITIONAL_ASSETS: Record<string, { name: string; nameAr: string }> = {
  XAUUSD: { name: "Gold", nameAr: "الذهب" },
  XAGUSD: { name: "Silver", nameAr: "الفضة" },
  EURUSD: { name: "EUR/USD", nameAr: "يورو/دولار" },
  GBPUSD: { name: "GBP/USD", nameAr: "جنيه/دولار" },
  USDJPY: { name: "USD/JPY", nameAr: "دولار/ين" },
  USOIL: { name: "WTI Oil", nameAr: "النفط الخام" },
  SPX500: { name: "S&P 500", nameAr: "S&P 500" },
  NAS100: { name: "NASDAQ 100", nameAr: "ناسداك 100" },
};

export async function fetchRealCryptoPrices(): Promise<RealtimePrice[]> {
  try {
    const ids = Object.values(CRYPTO_MAP).map((c) => c.id).join(",");
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, {
      headers: { Accept: "application/json" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return getFallbackCryptoPrices();
    const data = await res.json();
    return data.map((coin: {
      id: string; symbol: string; name: string;
      current_price: number; price_change_24h: number;
      price_change_percentage_24h: number;
      high_24h: number; low_24h: number;
      total_volume: number; market_cap: number;
    }) => {
      const mapping = Object.values(CRYPTO_MAP).find((c) => c.id === coin.id);
      return {
        symbol: coin.symbol.toUpperCase() + "USD",
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
    return getFallbackCryptoPrices();
  }
}

export async function fetchYahooPrice(symbol: string): Promise<RealtimePrice | null> {
  try {
    const yahooMap: Record<string, string> = {
      XAUUSD: "GC=F", XAGUSD: "SI=F", EURUSD: "EURUSD=X",
      GBPUSD: "GBPUSD=X", USDJPY: "JPY=X", USOIL: "CL=F",
      SPX500: "^GSPC", NAS100: "^IXIC", US30: "^DJI",
      AAPL: "AAPL", TSLA: "TSLA", MSFT: "MSFT",
    };
    const yahooSymbol = yahooMap[symbol] || symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 15 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;
    const trad = TRADITIONAL_ASSETS[symbol];
    return {
      symbol,
      name: meta.shortName || trad?.name || symbol,
      nameAr: trad?.nameAr || symbol,
      price: meta.regularMarketPrice,
      change24h: meta.regularMarketPrice - meta.previousClose,
      changePercent24h: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      high24h: meta.regularMarketDayHigh || meta.regularMarketPrice * 1.01,
      low24h: meta.regularMarketDayLow || meta.regularMarketPrice * 0.99,
      volume24h: meta.regularMarketVolume || 0,
      lastUpdated: new Date().toISOString(),
      source: "yahoo",
    };
  } catch {
    return null;
  }
}

export async function fetchAllRealPrices(): Promise<RealtimePrice[]> {
  const [cryptoPrices, ...yahooResults] = await Promise.all([
    fetchRealCryptoPrices(),
    fetchYahooPrice("XAUUSD"),
    fetchYahooPrice("EURUSD"),
    fetchYahooPrice("GBPUSD"),
    fetchYahooPrice("USDJPY"),
    fetchYahooPrice("USOIL"),
    fetchYahooPrice("SPX500"),
    fetchYahooPrice("XAGUSD"),
    fetchYahooPrice("US30"),
    fetchYahooPrice("NAS100"),
  ]);

  const prices: RealtimePrice[] = [...cryptoPrices];
  for (const result of yahooResults) {
    if (result) prices.push(result);
  }
  return prices;
}

function getFallbackCryptoPrices(): RealtimePrice[] {
  return [
    { symbol: "BTCUSD", name: "Bitcoin", nameAr: "بيتكوين", price: 97250 + (Math.random() - 0.5) * 1000, change24h: 1150, changePercent24h: 1.2, high24h: 98500, low24h: 95800, volume24h: 42000000000, marketCap: 1920000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "ETHUSD", name: "Ethereum", nameAr: "إيثريوم", price: 3420 + (Math.random() - 0.5) * 80, change24h: 65, changePercent24h: 1.9, high24h: 3480, low24h: 3350, volume24h: 18000000000, marketCap: 412000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "SOLUSD", name: "Solana", nameAr: "سولانا", price: 192 + (Math.random() - 0.5) * 10, change24h: 7.5, changePercent24h: 4.0, high24h: 198, low24h: 184, volume24h: 3500000000, marketCap: 91000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "BNBUSD", name: "BNB", nameAr: "بينانس", price: 695 + (Math.random() - 0.5) * 15, change24h: 12, changePercent24h: 1.8, high24h: 705, low24h: 682, volume24h: 2100000000, marketCap: 102000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "XRPUSD", name: "XRP", nameAr: "ريبل", price: 2.35 + (Math.random() - 0.5) * 0.1, change24h: 0.08, changePercent24h: 3.5, high24h: 2.42, low24h: 2.25, volume24h: 4500000000, marketCap: 135000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "ADAUSD", name: "Cardano", nameAr: "كاردانو", price: 1.05 + (Math.random() - 0.5) * 0.05, change24h: 0.04, changePercent24h: 3.9, high24h: 1.08, low24h: 1.0, volume24h: 1200000000, marketCap: 37000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "DOGEUSD", name: "Dogecoin", nameAr: "دوجكوين", price: 0.385 + (Math.random() - 0.5) * 0.02, change24h: 0.015, changePercent24h: 4.0, high24h: 0.395, low24h: 0.365, volume24h: 2800000000, marketCap: 56000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "DOTUSD", name: "Polkadot", nameAr: "بولكادوت", price: 8.2 + (Math.random() - 0.5) * 0.3, change24h: 0.35, changePercent24h: 4.5, high24h: 8.5, low24h: 7.8, volume24h: 450000000, marketCap: 12000000000, lastUpdated: new Date().toISOString(), source: "fallback" },
  ];
}

export function getFallbackTraditionalPrices(): RealtimePrice[] {
  return [
    { symbol: "XAUUSD", name: "Gold", nameAr: "الذهب", price: 2655 + (Math.random() - 0.5) * 20, change24h: 15.5, changePercent24h: 0.58, high24h: 2668, low24h: 2638, volume24h: 180000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "XAGUSD", name: "Silver", nameAr: "الفضة", price: 30.8 + (Math.random() - 0.5) * 0.5, change24h: 0.35, changePercent24h: 1.15, high24h: 31.2, low24h: 30.4, volume24h: 95000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "EURUSD", name: "EUR/USD", nameAr: "يورو/دولار", price: 1.0842 + (Math.random() - 0.5) * 0.005, change24h: -0.0018, changePercent24h: -0.17, high24h: 1.0865, low24h: 1.0825, volume24h: 0, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "GBPUSD", name: "GBP/USD", nameAr: "جنيه/دولار", price: 1.2715 + (Math.random() - 0.5) * 0.005, change24h: 0.0028, changePercent24h: 0.22, high24h: 1.2740, low24h: 1.2690, volume24h: 0, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "USDJPY", name: "USD/JPY", nameAr: "دولار/ين", price: 149.5 + (Math.random() - 0.5) * 0.5, change24h: -0.35, changePercent24h: -0.23, high24h: 150.1, low24h: 149.2, volume24h: 0, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "USOIL", name: "WTI Oil", nameAr: "النفط الخام", price: 71.8 + (Math.random() - 0.5) * 1.5, change24h: -0.65, changePercent24h: -0.9, high24h: 72.8, low24h: 70.8, volume24h: 320000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "SPX500", name: "S&P 500", nameAr: "S&P 500", price: 5935 + (Math.random() - 0.5) * 30, change24h: 18.5, changePercent24h: 0.31, high24h: 5955, low24h: 5905, volume24h: 3200000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "US30", name: "Dow Jones", nameAr: "داو جونز", price: 43250 + (Math.random() - 0.5) * 100, change24h: 120, changePercent24h: 0.28, high24h: 43400, low24h: 43050, volume24h: 2800000000, lastUpdated: new Date().toISOString(), source: "fallback" },
    { symbol: "NAS100", name: "NASDAQ 100", nameAr: "ناسداك 100", price: 20450 + (Math.random() - 0.5) * 80, change24h: 85, changePercent24h: 0.42, high24h: 20550, low24h: 20350, volume24h: 4500000000, lastUpdated: new Date().toISOString(), source: "fallback" },
  ];
}

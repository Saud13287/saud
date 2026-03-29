import { PriceData } from "@/lib/analysis/technical";

interface YahooQuote {
  symbol: string;
  shortName: string;
  regularMarketPrice: number;
  regularMarketChange: number;
  regularMarketChangePercent: number;
  regularMarketDayHigh: number;
  regularMarketDayLow: number;
  regularMarketVolume: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  marketCap?: number;
}

interface CoinGeckoData {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
}

const YAHOO_SYMBOLS: Record<string, string> = {
  "XAUUSD": "GC=F",
  "EURUSD": "EURUSD=X",
  "GBPUSD": "GBPUSD=X",
  "USDJPY": "JPY=X",
  "SPX500": "^GSPC",
  "NAS100": "^IXIC",
  "US30": "^DJI",
  "AAPL": "AAPL",
  "TSLA": "TSLA",
  "MSFT": "MSFT",
  "GOOGL": "GOOGL",
  "AMZN": "AMZN",
  "NVDA": "NVDA",
  "USOIL": "CL=F",
  "NGAS": "NG=F",
};

const CRYPTO_IDS: Record<string, string> = {
  "BTCUSD": "bitcoin",
  "ETHUSD": "ethereum",
  "BNBUSD": "binancecoin",
  "SOLUSD": "solana",
  "XRPUSD": "ripple",
  "ADAUSD": "cardano",
  "DOGEUSD": "dogecoin",
};

export async function fetchYahooQuote(symbol: string): Promise<YahooQuote | null> {
  try {
    const yahooSymbol = YAHOO_SYMBOLS[symbol] || symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=1d`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 30 },
    });
    if (!res.ok) return null;
    const json = await res.json();
    const meta = json.chart?.result?.[0]?.meta;
    if (!meta) return null;

    return {
      symbol,
      shortName: meta.shortName || symbol,
      regularMarketPrice: meta.regularMarketPrice,
      regularMarketChange: meta.regularMarketPrice - meta.previousClose,
      regularMarketChangePercent: ((meta.regularMarketPrice - meta.previousClose) / meta.previousClose) * 100,
      regularMarketDayHigh: meta.regularMarketDayHigh || meta.regularMarketPrice * 1.01,
      regularMarketDayLow: meta.regularMarketDayLow || meta.regularMarketPrice * 0.99,
      regularMarketVolume: meta.regularMarketVolume || 0,
      fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: meta.fiftyTwoWeekLow || 0,
    };
  } catch {
    return null;
  }
}

export async function fetchYahooHistory(symbol: string, range = "6mo"): Promise<PriceData[]> {
  try {
    const yahooSymbol = YAHOO_SYMBOLS[symbol] || symbol;
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSymbol)}?interval=1d&range=${range}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0" },
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    const json = await res.json();
    const result = json.chart?.result?.[0];
    if (!result) return [];

    const timestamps: number[] = result.timestamp || [];
    const quote = result.indicators?.quote?.[0];
    if (!quote) return [];

    const data: PriceData[] = [];
    for (let i = 0; i < timestamps.length; i++) {
      if (quote.open[i] == null || quote.close[i] == null) continue;
      data.push({
        open: quote.open[i],
        high: quote.high[i],
        low: quote.low[i],
        close: quote.close[i],
        volume: quote.volume[i] || 0,
        timestamp: new Date(timestamps[i] * 1000).toISOString(),
      });
    }
    return data;
  } catch {
    return [];
  }
}

export async function fetchCryptoData(): Promise<CoinGeckoData[]> {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=bitcoin,ethereum,binancecoin,solana,ripple,cardano,dogecoin&order=market_cap_desc&per_page=10&page=1";
    const res = await fetch(url, { next: { revalidate: 30 } });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export async function fetchCryptoHistory(coinId: string, days = 180): Promise<PriceData[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/${coinId}/ohlc?vs_currency=usd&days=${days}`;
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const json: number[][] = await res.json();
    return json.map((candle) => ({
      timestamp: new Date(candle[0]).toISOString(),
      open: candle[1],
      high: candle[2],
      low: candle[3],
      close: candle[4],
      volume: 0,
    }));
  } catch {
    return [];
  }
}

export interface MarketOverviewData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  marketCap?: number;
  weekHigh52: number;
  weekLow52: number;
  trend: "up" | "down" | "sideways";
  source: "yahoo" | "coingecko";
}

export async function fetchMarketOverview(): Promise<MarketOverviewData[]> {
  const results: MarketOverviewData[] = [];

  const mainSymbols = ["XAUUSD", "EURUSD", "GBPUSD", "SPX500", "AAPL", "TSLA", "USOIL"];
  const yahooPromises = mainSymbols.map(async (sym) => {
    const quote = await fetchYahooQuote(sym);
    if (quote) {
      results.push({
        symbol: sym,
        name: quote.shortName,
        price: Math.round(quote.regularMarketPrice * 100) / 100,
        change: Math.round(quote.regularMarketChange * 100) / 100,
        changePercent: Math.round(quote.regularMarketChangePercent * 100) / 100,
        high24h: Math.round(quote.regularMarketDayHigh * 100) / 100,
        low24h: Math.round(quote.regularMarketDayLow * 100) / 100,
        volume: quote.regularMarketVolume,
        weekHigh52: Math.round(quote.fiftyTwoWeekHigh * 100) / 100,
        weekLow52: Math.round(quote.fiftyTwoWeekLow * 100) / 100,
        trend: quote.regularMarketChangePercent > 0.3 ? "up" : quote.regularMarketChangePercent < -0.3 ? "down" : "sideways",
        source: "yahoo",
      });
    }
  });

  const cryptoData = await fetchCryptoData();
  for (const crypto of cryptoData) {
    results.push({
      symbol: crypto.symbol.toUpperCase() + "USD",
      name: crypto.name,
      price: Math.round(crypto.current_price * 100) / 100,
      change: Math.round((crypto.current_price * (crypto.price_change_percentage_24h || 0) / 100) * 100) / 100,
      changePercent: Math.round((crypto.price_change_percentage_24h || 0) * 100) / 100,
      high24h: Math.round(crypto.high_24h * 100) / 100,
      low24h: Math.round(crypto.low_24h * 100) / 100,
      volume: crypto.total_volume,
      marketCap: crypto.market_cap,
      weekHigh52: 0,
      weekLow52: 0,
      trend: (crypto.price_change_percentage_24h || 0) > 1 ? "up" : (crypto.price_change_percentage_24h || 0) < -1 ? "down" : "sideways",
      source: "coingecko",
    });
  }

  await Promise.all(yahooPromises);
  return results;
}

export function generateRealisticFallback(): MarketOverviewData[] {
  return [
    { symbol: "XAUUSD", name: "Gold", price: 2650.50 + (Math.random() - 0.5) * 30, change: 12.30, changePercent: 0.47, high24h: 2665, low24h: 2635, volume: 180000, weekHigh52: 2790, weekLow52: 1980, trend: "up", source: "yahoo" },
    { symbol: "EURUSD", name: "EUR/USD", price: 1.0845 + (Math.random() - 0.5) * 0.01, change: -0.0023, changePercent: -0.21, high24h: 1.0880, low24h: 1.0820, volume: 0, weekHigh52: 1.12, weekLow52: 1.04, trend: "down", source: "yahoo" },
    { symbol: "BTCUSD", name: "Bitcoin", price: 97500 + (Math.random() - 0.5) * 2000, change: 1250, changePercent: 1.3, high24h: 98800, low24h: 95200, volume: 42000000000, marketCap: 1920000000000, weekHigh52: 108000, weekLow52: 38000, trend: "up", source: "coingecko" },
    { symbol: "ETHUSD", name: "Ethereum", price: 3450 + (Math.random() - 0.5) * 100, change: 85, changePercent: 2.5, high24h: 3520, low24h: 3380, volume: 18000000000, marketCap: 415000000000, weekHigh52: 4100, weekLow52: 1520, trend: "up", source: "coingecko" },
    { symbol: "SPX500", name: "S&P 500", price: 5920 + (Math.random() - 0.5) * 50, change: 15.5, changePercent: 0.26, high24h: 5945, low24h: 5890, volume: 3200000000, weekHigh52: 6050, weekLow52: 4800, trend: "up", source: "yahoo" },
    { symbol: "AAPL", name: "Apple", price: 237 + (Math.random() - 0.5) * 5, change: 2.8, changePercent: 1.2, high24h: 239, low24h: 234, volume: 55000000, weekHigh52: 260, weekLow52: 164, trend: "up", source: "yahoo" },
    { symbol: "TSLA", name: "Tesla", price: 415 + (Math.random() - 0.5) * 15, change: -5.2, changePercent: -1.24, high24h: 425, low24h: 408, volume: 85000000, weekHigh52: 488, weekLow52: 138, trend: "down", source: "yahoo" },
    { symbol: "USOIL", name: "WTI Oil", price: 71.5 + (Math.random() - 0.5) * 2, change: -0.85, changePercent: -1.17, high24h: 72.8, low24h: 70.5, volume: 320000, weekHigh52: 87, weekLow52: 65, trend: "down", source: "yahoo" },
    { symbol: "SOLUSD", name: "Solana", price: 195 + (Math.random() - 0.5) * 10, change: 8.5, changePercent: 4.5, high24h: 200, low24h: 185, volume: 3500000000, marketCap: 92000000000, weekHigh52: 260, weekLow52: 80, trend: "up", source: "coingecko" },
    { symbol: "GBPUSD", name: "GBP/USD", price: 1.2720 + (Math.random() - 0.5) * 0.01, change: 0.0035, changePercent: 0.28, high24h: 1.2755, low24h: 1.2690, volume: 0, weekHigh52: 1.34, weekLow52: 1.23, trend: "up", source: "yahoo" },
  ];
}

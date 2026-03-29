import { NextResponse } from "next/server";

interface AssetData {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  high24h: number;
  low24h: number;
  volume: number;
  trend: "up" | "down" | "sideways";
  volatility: number;
  rsi: number;
  sma20: number;
  sma50: number;
}

function generateAssetPrice(base: number, volatility: number): number {
  return base + (Math.random() - 0.5) * base * volatility;
}

const baseAssets = [
  { symbol: "XAUUSD", name: "الذهب", base: 2045, vol: 0.015 },
  { symbol: "EURUSD", name: "يورو/دولار", base: 1.0872, vol: 0.005 },
  { symbol: "BTCUSD", name: "بيتكوين", base: 67450, vol: 0.03 },
  { symbol: "SPX500", name: "S&P 500", base: 5123, vol: 0.01 },
  { symbol: "USOIL", name: "الن الخام", base: 78.45, vol: 0.02 },
  { symbol: "AAPL", name: "آبل", base: 189.84, vol: 0.015 },
  { symbol: "TSLA", name: "تسلا", base: 245.50, vol: 0.035 },
  { symbol: "GBPUSD", name: "جنيه/دولار", base: 1.2650, vol: 0.006 },
];

export async function GET() {
  const assets: AssetData[] = baseAssets.map((a) => {
    const price = generateAssetPrice(a.base, a.vol);
    const prevPrice = a.base;
    const change = price - prevPrice;
    const changePercent = (change / prevPrice) * 100;
    const high24h = price * (1 + Math.random() * 0.02);
    const low24h = price * (1 - Math.random() * 0.02);

    return {
      symbol: a.symbol,
      name: a.name,
      price: Math.round(price * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent * 100) / 100,
      high24h: Math.round(high24h * 100) / 100,
      low24h: Math.round(low24h * 100) / 100,
      volume: Math.round(1000000 + Math.random() * 10000000),
      trend: changePercent > 0.5 ? "up" : changePercent < -0.5 ? "down" : "sideways",
      volatility: Math.round(a.vol * 100 * 100) / 100,
      rsi: Math.round(30 + Math.random() * 40),
      sma20: Math.round(price * (1 + (Math.random() - 0.5) * 0.02) * 100) / 100,
      sma50: Math.round(price * (1 + (Math.random() - 0.5) * 0.04) * 100) / 100,
    };
  });

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    marketStatus: new Date().getHours() >= 9 && new Date().getHours() <= 17 ? "open" : "after-hours",
    assets,
    marketSummary: {
      fearGreedIndex: 45 + Math.round(Math.random() * 20),
      sp500Change: Math.round((Math.random() - 0.5) * 2 * 100) / 100,
      vixLevel: Math.round((15 + Math.random() * 15) * 10) / 10,
      usdIndex: Math.round((103 + Math.random() * 3) * 100) / 100,
    },
  });
}

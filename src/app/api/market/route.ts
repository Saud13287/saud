import { NextResponse } from "next/server";

const mockAssets = [
  { symbol: "XAUUSD", name: "الذهب", price: 2045.50, change: 0.8, trend: "up" },
  { symbol: "EURUSD", name: "يورو/دولار", price: 1.0872, change: -0.12, trend: "down" },
  { symbol: "BTCUSD", name: "بيتكوين", price: 67450, change: 2.5, trend: "up" },
  { symbol: "SPX500", name: "S&P 500", price: 5123.41, change: 0.3, trend: "up" },
  { symbol: "USOIL", name: "الن الخام", price: 78.45, change: -1.2, trend: "down" },
  { symbol: "AAPL", name: "آبل", price: 189.84, change: 0.5, trend: "up" },
];

export async function GET() {
  return NextResponse.json({
    timestamp: new Date().toISOString(),
    marketStatus: "open",
    assets: mockAssets,
  });
}

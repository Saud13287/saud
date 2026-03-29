import { NextResponse } from "next/server";

interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_24h: number;
  price_change_percentage_24h: number;
  high_24h: number;
  low_24h: number;
  total_volume: number;
  market_cap: number;
}

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

const YAHOO_ASSETS: { symbol: string; yahoo: string; name: string; nameAr: string }[] = [
  { symbol: "XAUUSD", yahoo: "GC=F", name: "Gold", nameAr: "الذهب" },
  { symbol: "XAGUSD", yahoo: "SI=F", name: "Silver", nameAr: "الفضة" },
  { symbol: "EURUSD", yahoo: "EURUSD=X", name: "EUR/USD", nameAr: "يورو/دولار" },
  { symbol: "GBPUSD", yahoo: "GBPUSD=X", name: "GBP/USD", nameAr: "جنيه/دولار" },
  { symbol: "USDJPY", yahoo: "JPY=X", name: "USD/JPY", nameAr: "دولار/ين" },
  { symbol: "USOIL", yahoo: "CL=F", name: "WTI Oil", nameAr: "النفط الخام" },
  { symbol: "SPX500", yahoo: "^GSPC", name: "S&P 500", nameAr: "S&P 500" },
  { symbol: "NAS100", yahoo: "^IXIC", name: "NASDAQ", nameAr: "ناسداك" },
  { symbol: "US30", yahoo: "^DJI", name: "Dow Jones", nameAr: "داو جونز" },
  { symbol: "BTCUSD", yahoo: "BTC-USD", name: "Bitcoin", nameAr: "بيتكوين" },
  { symbol: "ETHUSD", yahoo: "ETH-USD", name: "Ethereum", nameAr: "إيثريوم" },
];

async function fetchCryptoPrices(): Promise<PriceResult[]> {
  try {
    const url = `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=${CRYPTO_IDS}&order=market_cap_desc&per_page=20&page=1&sparkline=false&price_change_percentage=24h`;
    const res = await fetch(url, {
      headers: { Accept: "application/json", "User-Agent": "SaudFin/4.0" },
      cache: "no-store",
    });
    if (!res.ok) {
      console.error("CoinGecko API error:", res.status, res.statusText);
      return [];
    }
    const data: CryptoCoin[] = await res.json();
    return data.map((coin) => {
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
  } catch (err) {
    console.error("CoinGecko fetch error:", err);
    return [];
  }
}

async function fetchYahooPrices(): Promise<PriceResult[]> {
  const results: PriceResult[] = [];
  const promises = YAHOO_ASSETS.map(async (asset) => {
    try {
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(asset.yahoo)}?interval=1d&range=1d`;
      const res = await fetch(url, {
        headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
        cache: "no-store",
      });
      if (!res.ok) return;
      const json = await res.json();
      const meta = json.chart?.result?.[0]?.meta;
      if (!meta || !meta.regularMarketPrice) return;

      const price = meta.regularMarketPrice;
      const prevClose = meta.previousClose || meta.chartPreviousClose || price;
      const change = price - prevClose;
      const changePercent = prevClose > 0 ? (change / prevClose) * 100 : 0;

      results.push({
        symbol: asset.symbol,
        name: asset.name,
        nameAr: asset.nameAr,
        price: Math.round(price * 10000) / 10000,
        change24h: Math.round(change * 10000) / 10000,
        changePercent24h: Math.round(changePercent * 100) / 100,
        high24h: meta.regularMarketDayHigh ? Math.round(meta.regularMarketDayHigh * 10000) / 10000 : price * 1.005,
        low24h: meta.regularMarketDayLow ? Math.round(meta.regularMarketDayLow * 10000) / 10000 : price * 0.995,
        volume24h: meta.regularMarketVolume || 0,
        lastUpdated: new Date().toISOString(),
        source: "yahoo",
      });
    } catch (err) {
      console.error(`Yahoo fetch error for ${asset.symbol}:`, err);
    }
  });

  await Promise.allSettled(promises);
  return results;
}

export async function GET() {
  try {
    const [cryptoPrices, yahooPrices] = await Promise.allSettled([
      fetchCryptoPrices(),
      fetchYahooPrices(),
    ]);

    const allPrices: PriceResult[] = [
      ...(cryptoPrices.status === "fulfilled" ? cryptoPrices.value : []),
      ...(yahooPrices.status === "fulfilled" ? yahooPrices.value : []),
    ];

    const uniquePrices = allPrices.filter((p, idx, arr) =>
      arr.findIndex((x) => x.symbol === p.symbol) === idx
    );

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      count: uniquePrices.length,
      prices: uniquePrices,
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to fetch prices", prices: [] },
      { status: 500 }
    );
  }
}

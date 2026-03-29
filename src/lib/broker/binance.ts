export interface BrokerConfig {
  id: string;
  name: string;
  nameAr: string;
  type: "demo" | "live";
  apiKey: string;
  apiSecret: string;
  baseUrl: string;
  status: "connected" | "disconnected" | "error";
}

export interface BrokerOrder {
  id: string;
  brokerId: string;
  symbol: string;
  side: "buy" | "sell";
  type: "market" | "limit" | "stop";
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: "new" | "filled" | "partially_filled" | "cancelled" | "rejected";
  filledQty: number;
  filledPrice: number;
  timestamp: string;
  source: "manual" | "auto" | "war-room";
}

export interface BrokerPosition {
  symbol: string;
  side: "long" | "short";
  quantity: number;
  entryPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  margin: number;
}

export interface BrokerBalance {
  asset: string;
  free: number;
  locked: number;
  total: number;
}

export async function connectBinance(config: { apiKey: string; apiSecret: string; testnet: boolean }): Promise<{ success: boolean; balances?: BrokerBalance[]; error?: string }> {
  try {
    const baseUrl = config.testnet
      ? "https://testnet.binancefuture.com"
      : "https://fapi.binance.com";

    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const crypto = await import("crypto");
    const signature = crypto.createHmac("sha256", config.apiSecret).update(queryString).digest("hex");

    const res = await fetch(`${baseUrl}/fapi/v2/account?${queryString}&signature=${signature}`, {
      headers: { "X-MBX-APIKEY": config.apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: `Binance error: ${res.status} - ${err}` };
    }

    const data = await res.json();
    const balances = (data.assets || [])
      .filter((a: { balance: string }) => parseFloat(a.balance) > 0)
      .map((a: { asset: string; availableBalance: string; balance: string }) => ({
        asset: a.asset,
        free: parseFloat(a.availableBalance),
        locked: parseFloat(a.balance) - parseFloat(a.availableBalance),
        total: parseFloat(a.balance),
      }));

    return { success: true, balances };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function placeBinanceOrder(
  config: { apiKey: string; apiSecret: string; testnet: boolean },
  order: { symbol: string; side: "BUY" | "SELL"; type: "MARKET" | "LIMIT"; quantity: number; price?: number }
): Promise<{ success: boolean; orderId?: string; error?: string }> {
  try {
    const baseUrl = config.testnet
      ? "https://testnet.binancefuture.com"
      : "https://fapi.binance.com";

    const timestamp = Date.now();
    let queryString = `symbol=${order.symbol}&side=${order.side}&type=${order.type}&quantity=${order.quantity}&timestamp=${timestamp}`;
    if (order.type === "LIMIT" && order.price) {
      queryString += `&price=${order.price}&timeInForce=GTC`;
    }

    const crypto = await import("crypto");
    const signature = crypto.createHmac("sha256", config.apiSecret).update(queryString).digest("hex");

    const res = await fetch(`${baseUrl}/fapi/v1/order?${queryString}&signature=${signature}`, {
      method: "POST",
      headers: { "X-MBX-APIKEY": config.apiKey },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      const err = await res.text();
      return { success: false, error: err };
    }

    const data = await res.json();
    return { success: true, orderId: String(data.orderId) };
  } catch (err) {
    return { success: false, error: String(err) };
  }
}

export async function fetchBinancePrices(symbols: string[]): Promise<Record<string, number>> {
  try {
    const res = await fetch("https://fapi.binance.com/fapi/v1/ticker/price", {
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return {};
    const data = await res.json();
    const prices: Record<string, number> = {};
    for (const t of data) {
      if (symbols.includes(t.symbol)) {
        prices[t.symbol] = parseFloat(t.price);
      }
    }
    return prices;
  } catch {
    return {};
  }
}

export async function fetchBinanceKlines(symbol: string, interval: string, limit: number): Promise<number[][]> {
  try {
    const res = await fetch(
      `https://fapi.binance.com/fapi/v1/klines?symbol=${symbol}&interval=${interval}&limit=${limit}`,
      { signal: AbortSignal.timeout(10000) }
    );
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

export const BINANCE_DEMO_CONFIG: BrokerConfig = {
  id: "binance-demo",
  name: "Binance Demo",
  nameAr: "بينانس تجريبي",
  type: "demo",
  apiKey: "",
  apiSecret: "",
  baseUrl: "https://testnet.binancefuture.com",
  status: "disconnected",
};

export const IB_DEMO_CONFIG: BrokerConfig = {
  id: "ib-demo",
  name: "Interactive Brokers Demo",
  nameAr: "إنتراكتيف بروكرز تجريبي",
  type: "demo",
  apiKey: "",
  apiSecret: "",
  baseUrl: "https://localhost:5000/v1/api",
  status: "disconnected",
};

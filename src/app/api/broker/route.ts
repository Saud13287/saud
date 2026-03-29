import { NextResponse } from "next/server";
import { connectBinance, placeBinanceOrder, fetchBinancePrices } from "@/lib/broker/binance";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, broker, config, order, symbols } = body;

    if (broker === "binance") {
      if (action === "connect") {
        const result = await connectBinance({
          apiKey: config.apiKey,
          apiSecret: config.apiSecret,
          testnet: config.testnet ?? true,
        });
        return NextResponse.json(result);
      }

      if (action === "order") {
        const result = await placeBinanceOrder(
          { apiKey: config.apiKey, apiSecret: config.apiSecret, testnet: config.testnet ?? true },
          order
        );
        return NextResponse.json(result);
      }

      if (action === "prices") {
        const prices = await fetchBinancePrices(symbols || ["BTCUSDT", "ETHUSDT"]);
        return NextResponse.json({ success: true, prices });
      }
    }

    return NextResponse.json({ success: false, error: "Unknown action or broker" }, { status: 400 });
  } catch (err) {
    return NextResponse.json({ success: false, error: String(err) }, { status: 500 });
  }
}

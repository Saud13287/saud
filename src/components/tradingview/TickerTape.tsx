"use client";
import { useEffect, useRef } from "react";

export default function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: [
        { proName: "COMEX:GC1!", title: "ذهب" },
        { proName: "COMEX:SI1!", title: "فضة" },
        { proName: "NYMEX:CL1!", title: "نفط" },
        { proName: "OANDA:EURUSD", title: "EUR/USD" },
        { proName: "OANDA:GBPUSD", title: "GBP/USD" },
        { proName: "OANDA:USDJPY", title: "USD/JPY" },
        { proName: "BITSTAMP:BTCUSD", title: "BTC" },
        { proName: "BITSTAMP:ETHUSD", title: "ETH" },
        { proName: "BINANCE:SOLUSDT", title: "SOL" },
        { proName: "SP:SPX", title: "S&P 500" },
        { proName: "TVC:DXY", title: "DXY" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: false,
      displayMode: "adaptive",
      locale: "ar",
    });

    containerRef.current.appendChild(script);
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container" style={{ height: "44px" }} />;
}

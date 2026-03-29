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
        { proName: "FX:EURUSD", title: "EUR/USD" },
        { proName: "FX:GBPUSD", title: "GBP/USD" },
        { proName: "FX:USDJPY", title: "USD/JPY" },
        { proName: "COMEX:GC1!", title: "ذهب" },
        { proName: "NYMEX:CL1!", title: "نفط WTI" },
        { proName: "BITSTAMP:BTCUSD", title: "بيتكوين" },
        { proName: "BITSTAMP:ETHUSD", title: "إيثريوم" },
        { proName: "SP:SPX", title: "S&P 500" },
        { proName: "NASDAQ:NDX", title: "纳斯达克 100" },
        { proName: "TVC:DXY", title: "دولار" },
        { proName: "COMEX:SI1!", title: "فضة" },
        { proName: "NYMEX:NG1!", title: "غاز" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "ar",
    });

    containerRef.current.appendChild(script);
  }, []);

  return (
    <div ref={containerRef} className="tradingview-widget-container" />
  );
}

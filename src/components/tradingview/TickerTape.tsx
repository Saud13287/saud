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
        { proName: "FX_IDC:XAUUSD", title: "ذهب" },
        { proName: "FX_IDC:XAGUSD", title: "فضة" },
        { proName: "TVC:USOIL", title: "نفط WTI" },
        { proName: "FX_IDC:EURUSD", title: "EUR/USD" },
        { proName: "FX_IDC:GBPUSD", title: "GBP/USD" },
        { proName: "FX_IDC:USDJPY", title: "USD/JPY" },
        { proName: "FX_IDC:AUDUSD", title: "AUD/USD" },
        { proName: "BITSTAMP:BTCUSD", title: "بيتكوين" },
        { proName: "BITSTAMP:ETHUSD", title: "إيثريوم" },
        { proName: "BINANCE:SOLUSDT", title: "سولانا" },
        { proName: "SP:SPX", title: "S&P 500" },
        { proName: "BLACKBULL:US30", title: "US30" },
        { proName: "BLACKBULL:NAS100", title: "NAS100" },
        { proName: "TVC:DXY", title: "دولار" },
      ],
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "ar",
    });

    containerRef.current.appendChild(script);
  }, []);

  return <div ref={containerRef} className="tradingview-widget-container" />;
}

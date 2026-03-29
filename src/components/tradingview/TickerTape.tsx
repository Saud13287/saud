"use client";
import { useEffect, useRef, useState } from "react";
import { getMarketStatus } from "@/lib/utils/market-hours";

const MARKET_SYMBOLS = [
  { proName: "COMEX:GC1!", title: "ذهب" },
  { proName: "COMEX:SI1!", title: "فضة" },
  { proName: "NYMEX:CL1!", title: "نفط WTI" },
  { proName: "NYMEX:NG1!", title: "غاز" },
  { proName: "FX:EURUSD", title: "EUR/USD" },
  { proName: "FX:GBPUSD", title: "GBP/USD" },
  { proName: "FX:USDJPY", title: "USD/JPY" },
  { proName: "FX:AUDUSD", title: "AUD/USD" },
  { proName: "BITSTAMP:BTCUSD", title: "بيتكوين" },
  { proName: "BITSTAMP:ETHUSD", title: "إيثريوم" },
  { proName: "SP:SPX", title: "S&P 500" },
  { proName: "NASDAQ:NDX", title: "NAS100" },
  { proName: "DJ:DJI", title: "US30" },
  { proName: "TVC:DXY", title: "دولار" },
];

export default function TradingViewTickerTape() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [marketInfo, setMarketInfo] = useState({ forex: true, stocks: true, crypto: true });

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbols: MARKET_SYMBOLS,
      showSymbolLogo: true,
      colorTheme: "dark",
      isTransparent: true,
      displayMode: "adaptive",
      locale: "ar",
    });

    containerRef.current.appendChild(script);

    const updateStatus = () => {
      setMarketInfo({
        forex: getMarketStatus("EURUSD").isOpen,
        stocks: getMarketStatus("SPX500").isOpen,
        crypto: true,
      });
    };
    updateStatus();
    const interval = setInterval(updateStatus, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative">
      <div ref={containerRef} className="tradingview-widget-container" />
      <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3 z-10 bg-[var(--color-omega-surface)] px-2 py-1 rounded">
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${marketInfo.forex ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className="text-[9px] text-[var(--color-omega-muted)]">فوركس</span>
        </div>
        <div className="flex items-center gap-1">
          <div className={`w-2 h-2 rounded-full ${marketInfo.stocks ? "bg-emerald-400" : "bg-red-400"}`} />
          <span className="text-[9px] text-[var(--color-omega-muted)]">أسهم</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded-full bg-emerald-400" />
          <span className="text-[9px] text-[var(--color-omega-muted)]">كريبتو</span>
        </div>
      </div>
    </div>
  );
}

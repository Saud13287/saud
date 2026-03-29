"use client";
import { useEffect, useRef } from "react";

interface TradingViewWidgetProps {
  symbol?: string;
  theme?: "dark" | "light";
  interval?: string;
  height?: number;
  studies?: string[];
}

declare global {
  interface Window {
    TradingView?: {
      widget: new (config: Record<string, unknown>) => unknown;
    };
  }
}

export default function TradingViewWidget({
  symbol = "FX:EURUSD",
  theme = "dark",
  interval = "D",
  height = 500,
  studies = ["RSI@tv-basicstudies", "MASimple@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies"],
}: TradingViewWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/tv.js";
    script.async = true;
    script.onload = () => {
      if (window.TradingView && containerRef.current) {
        new window.TradingView.widget({
          autosize: true,
          symbol,
          interval,
          timezone: "Asia/Riyadh",
          theme,
          style: "1",
          locale: "ar",
          toolbar_bg: "#0a0e17",
          enable_publishing: false,
          allow_symbol_change: true,
          hide_side_toolbar: false,
          hide_top_toolbar: false,
          hide_legend: false,
          save_image: true,
          studies,
          container_id: "tradingview_chart",
          show_popup_button: true,
          popup_width: "1000",
          popup_height: "650",
          withdateranges: true,
          hide_volume: false,
          support_host: "https://www.tradingview.com",
        });
      }
    };

    scriptRef.current = script;
    document.head.appendChild(script);

    return () => {
      if (scriptRef.current && document.head.contains(scriptRef.current)) {
        document.head.removeChild(scriptRef.current);
      }
    };
  }, [symbol, theme, interval, studies]);

  return (
    <div
      id="tradingview_chart"
      ref={containerRef}
      style={{ height: `${height}px`, width: "100%" }}
      className="rounded-xl overflow-hidden"
    />
  );
}

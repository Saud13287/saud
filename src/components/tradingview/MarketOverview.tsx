"use client";
import { useEffect, useRef } from "react";

interface Props {
  symbols?: string[][];
  colorTheme?: "dark" | "light";
  isTransparent?: boolean;
  showSymbolLogo?: boolean;
  width?: string;
  height?: number;
}

export default function TradingViewTicker({
  symbols = [
    ["FX:EURUSD", "EUR/USD"],
    ["FX:GBPUSD", "GBP/USD"],
    ["FX:USDJPY", "USD/JPY"],
    ["COMEX:GC1!", "ذهب"],
    ["NYMEX:CL1!", "نفط"],
    ["BITSTAMP:BTCUSD", "BTC"],
    ["BITSTAMP:ETHUSD", "ETH"],
    ["SP:SPX", "S&P 500"],
    ["NASDAQ:NDX", "纳斯达克"],
    ["TVC:DXY", "DXY"],
  ],
  colorTheme = "dark",
  isTransparent = true,
  showSymbolLogo = true,
  width = "100%",
  height = 400,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    containerRef.current.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-market-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      colorTheme,
      dateRange: "12M",
      showChart: true,
      locale: "ar",
      width,
      height,
      isTransparent,
      showSymbolLogo,
      showFloatingTooltip: false,
      plotLineColorGrowing: "rgba(16, 185, 129, 1)",
      plotLineColorFalling: "rgba(239, 68, 68, 1)",
      gridLineColor: "rgba(30, 41, 59, 0.5)",
      scaleFontColor: "rgba(148, 163, 184, 1)",
      belowLineFillColorGrowing: "rgba(16, 185, 129, 0.12)",
      belowLineFillColorFalling: "rgba(239, 68, 68, 0.12)",
      belowLineFillColorGrowingBottom: "rgba(16, 185, 129, 0)",
      belowLineFillColorFallingBottom: "rgba(239, 68, 68, 0)",
      symbolActiveColor: "rgba(59, 130, 246, 0.12)",
      tabs: [
        {
          title: "الفوركس",
          symbols: symbols.filter((s) => s[0].startsWith("FX:") || s[0] === "TVC:DXY"),
          originalTitle: "Forex",
        },
        {
          title: "السلع",
          symbols: symbols.filter((s) => s[0].startsWith("COMEX:") || s[0].startsWith("NYMEX:")),
          originalTitle: "Commodities",
        },
        {
          title: "الكريبتو",
          symbols: symbols.filter((s) => s[0].startsWith("BITSTAMP:")),
          originalTitle: "Crypto",
        },
        {
          title: "المؤشرات",
          symbols: symbols.filter((s) => s[0].startsWith("SP:") || s[0].startsWith("NASDAQ:")),
          originalTitle: "Indices",
        },
      ],
    });

    containerRef.current.appendChild(script);
  }, [symbols, colorTheme, isTransparent, showSymbolLogo, width, height]);

  return (
    <div
      ref={containerRef}
      className="tradingview-widget-container rounded-xl overflow-hidden"
    />
  );
}

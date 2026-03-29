"use client";
import { useState, useEffect, useMemo } from "react";
import TickerTape from "@/components/tradingview/TickerTape";
import NotificationCenter from "@/components/notifications/NotificationCenter";
import { getMarketStatus } from "@/lib/utils/market-hours";

function MarketStatusBar() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const markets = useMemo(() => [
    { key: "forex", symbol: "EURUSD", icon: "💱", nameAr: "فوركس" },
    { key: "stocks", symbol: "AAPL", icon: "📊", nameAr: "أسهم" },
    { key: "crypto", symbol: "BTCUSD", icon: "₿", nameAr: "كريبتو" },
    { key: "commodities", symbol: "XAUUSD", icon: "🥇", nameAr: "سلع" },
    { key: "indices", symbol: "SPX500", icon: "📈", nameAr: "مؤشرات" },
  ], []);

  return (
    <div className="flex items-center gap-1 px-4 py-1.5 border-t border-[var(--color-omega-border)]">
      <span className="text-[9px] text-[var(--color-omega-muted)] ml-2 whitespace-nowrap">حالة الأسواق:</span>
      {markets.map((m) => {
        const status = getMarketStatus(m.symbol);
        return (
          <div
            key={m.key}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium whitespace-nowrap ${
              status.isOpen
                ? "bg-emerald-900/30 text-emerald-400 border border-emerald-800/30"
                : "bg-red-900/20 text-red-400 border border-red-800/20"
            }`}
            title={`${m.nameAr}: ${status.label} (${status.labelEn})`}
          >
            <span>{m.icon}</span>
            <span>{m.nameAr}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
          </div>
        );
      })}
    </div>
  );
}

export default function Header() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ar-SA"));
      setDate(now.toLocaleDateString("ar-SA", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[var(--color-omega-surface)] border-b border-[var(--color-omega-border)]">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">مرحباً بك في نظام سعود</h2>
          <p className="text-[10px] text-[var(--color-omega-muted)]">{date || "..."}</p>
        </div>
        <div className="flex items-center gap-3">
          <p className="text-lg font-mono text-emerald-400">{time || "--:--:--"}</p>
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg">
            <div className="status-dot status-completed" />
            <span className="text-xs">59 خبير</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/30">
            <span className="text-xs text-emerald-400 font-bold">96%</span>
            <span className="text-[10px] text-emerald-500">دقة</span>
          </div>
          <NotificationCenter />
        </div>
      </div>
      <MarketStatusBar />
      <div className="border-t border-[var(--color-omega-border)] overflow-hidden">
        <TickerTape />
      </div>
    </header>
  );
}

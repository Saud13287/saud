"use client";
import { useState, useEffect } from "react";
import { agentRegistry } from "@/lib/agents/registry";
import ExpertBoard from "@/components/dashboard/ExpertBoard";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";
import TradingViewWidget from "@/components/tradingview/TradingViewWidget";
import { fetchAllRealPrices, RealtimePrice } from "@/lib/market/realtime";

function QuickPrices() {
  const [prices, setPrices] = useState<RealtimePrice[]>([]);

  useEffect(() => {
    fetchAllRealPrices().then((data) => {
      if (data.length > 0) setPrices(data.slice(0, 8));
    }).catch(() => {});
  }, []);

  if (prices.length === 0) return null;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {prices.map((p) => (
        <div key={p.symbol} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">{p.nameAr}</span>
            <span className={`text-[10px] font-bold ${p.changePercent24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
              {p.changePercent24h >= 0 ? "▲" : "▼"} {Math.abs(p.changePercent24h).toFixed(2)}%
            </span>
          </div>
          <p className="text-sm font-bold font-mono">
            {p.price > 1000 ? p.price.toLocaleString(undefined, { maximumFractionDigits: 0 }) : p.price > 1 ? p.price.toFixed(2) : p.price.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">
            نظام سعود - {agentRegistry.length + agentRegistry.reduce((s, e) => s + e.assistants.length, 0)} خبير ذكي
          </p>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-omega-border)]">
          <h3 className="text-xs font-bold">الرسم البياني - الذهب (XAU/USD)</h3>
          <span className="text-[10px] text-[var(--color-omega-muted)]">TradingView</span>
        </div>
        <TradingViewWidget
          symbol="COMEX:GC1!"
          interval="D"
          height={380}
          studies={["RSI@tv-basicstudies", "MACD@tv-basicstudies", "BB@tv-basicstudies"]}
        />
      </div>

      <QuickPrices />

      <PortfolioSummary />
      <SystemHealthPanel />
      <ExpertBoard experts={agentRegistry} />
    </div>
  );
}

"use client";
import { useState, useEffect } from "react";
import { agentRegistry } from "@/lib/agents/registry";
import ExpertBoard from "@/components/dashboard/ExpertBoard";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";

interface MarketAsset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  trend: string;
  rsi: number;
}

function MarketOverview() {
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [summary, setSummary] = useState<{ fearGreedIndex: number; sp500Change: number; vixLevel: number; usdIndex: number } | null>(null);

  useEffect(() => {
    fetch("/api/market")
      .then((r) => r.json())
      .then((data) => {
        setAssets(data.assets || []);
        setSummary(data.marketSummary || null);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span>🌐</span>
          نظرة على السوق
        </h3>
        {summary && (
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-[var(--color-omega-muted)]">خوف/طمع:</span>
              <span className={`font-bold ${summary.fearGreedIndex > 55 ? "text-green-400" : summary.fearGreedIndex < 45 ? "text-red-400" : "text-yellow-400"}`}>
                {summary.fearGreedIndex}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--color-omega-muted)]">VIX:</span>
              <span className={`font-bold ${summary.vixLevel > 25 ? "text-red-400" : "text-green-400"}`}>
                {summary.vixLevel}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[var(--color-omega-muted)]">USD:</span>
              <span className="font-bold">{summary.usdIndex}</span>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {assets.slice(0, 8).map((asset) => (
          <div key={asset.symbol} className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">{asset.name}</span>
              <span className={`text-xs ${asset.changePercent > 0 ? "text-green-400" : asset.changePercent < 0 ? "text-red-400" : "text-[var(--color-omega-muted)]"}`}>
                {asset.changePercent > 0 ? "▲" : asset.changePercent < 0 ? "▼" : "─"} {Math.abs(asset.changePercent).toFixed(2)}%
              </span>
            </div>
            <p className="text-sm font-bold">{asset.price.toLocaleString()}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-[var(--color-omega-muted)]">RSI: {asset.rsi}</span>
              <div className="flex-1 h-1 bg-[var(--color-omega-border)] rounded-full">
                <div
                  className="h-1 rounded-full"
                  style={{
                    width: `${asset.rsi}%`,
                    backgroundColor: asset.rsi > 70 ? "var(--color-omega-red)" : asset.rsi < 30 ? "var(--color-omega-green)" : "var(--color-omega-gold)",
                  }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">لوحة التحكم الرئيسية</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          نظرة عامة على أداء النظام وجميع الخبراء - إجمالي: {agentRegistry.length + agentRegistry.reduce((s, e) => s + e.assistants.length, 0)} خبير
        </p>
      </div>

      <MarketOverview />
      <SystemHealthPanel />
      <PortfolioSummary />
      <ExpertBoard experts={agentRegistry} />
    </div>
  );
}

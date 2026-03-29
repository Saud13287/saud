"use client";
import { useState, useEffect, useMemo } from "react";
import { agentRegistry } from "@/lib/agents/registry";
import ExpertBoard from "@/components/dashboard/ExpertBoard";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";
import TradingViewWidget from "@/components/tradingview/TradingViewWidget";
import { fetchAllRealPrices, RealtimePrice, getFallbackPrices } from "@/lib/market/realtime";
import { useSettings } from "@/hooks/useSettings";
import LineChart from "@/components/charts/LineChart";
import { getMarketStatus, getMarketType } from "@/lib/utils/market-hours";

function DashboardMarketStatus() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 60000);
    return () => clearInterval(timer);
  }, []);

  const markets = useMemo(() => [
    { key: "forex", symbol: "EURUSD", icon: "💱", nameAr: "الفوركس", nameEn: "Forex" },
    { key: "stocks", symbol: "AAPL", icon: "📊", nameAr: "الأسهم", nameEn: "Stocks" },
    { key: "crypto", symbol: "BTCUSD", icon: "₿", nameAr: "الكريبتو", nameEn: "Crypto" },
    { key: "commodities", symbol: "XAUUSD", icon: "🥇", nameAr: "السلع", nameEn: "Commodities" },
    { key: "indices", symbol: "SPX500", icon: "📈", nameAr: "المؤشرات", nameEn: "Indices" },
  ], []);

  const openCount = markets.filter((m) => getMarketStatus(m.symbol).isOpen).length;

  return (
    <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold flex items-center gap-2">
          <span>🌐</span>
          حالة الأسواق العالمية
        </h3>
        <span className={`text-[10px] font-bold px-2 py-1 rounded ${
          openCount > 0 ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"
        }`}>
          {openCount}/5 مفتوحة
        </span>
      </div>
      <div className="grid grid-cols-5 gap-2">
        {markets.map((m) => {
          const status = getMarketStatus(m.symbol);
          return (
            <div
              key={m.key}
              className={`rounded-lg p-3 text-center border transition-all ${
                status.isOpen
                  ? "bg-emerald-900/20 border-emerald-700/30"
                  : "bg-red-900/10 border-red-800/20"
              }`}
            >
              <div className="text-lg mb-1">{m.icon}</div>
              <p className="text-[10px] font-bold mb-0.5">{m.nameAr}</p>
              <div className="flex items-center justify-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${status.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />
                <span className={`text-[9px] font-medium ${status.isOpen ? "text-emerald-400" : "text-red-400"}`}>
                  {status.label}
                </span>
              </div>
              {!status.isOpen && status.sessions.length > 0 && (
                <p className="text-[8px] text-[var(--color-omega-muted)] mt-1">
                  الجلسة الرئيسية: {status.sessions[0]?.hours || "—"}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function QuickPrices() {
  const [prices, setPrices] = useState<RealtimePrice[]>(getFallbackPrices);

  useEffect(() => {
    fetchAllRealPrices().then((data) => {
      if (data.length > 0) setPrices(data);
    }).catch(() => {});
    const interval = setInterval(() => {
      fetchAllRealPrices().then((data) => {
        if (data.length > 0) setPrices(data);
      }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2">
      {prices.slice(0, 12).map((p) => (
        <div key={p.symbol} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-medium">{p.nameAr}</span>
            <span className={`text-[9px] font-bold px-1 rounded ${p.changePercent24h >= 0 ? "text-emerald-400 bg-emerald-900/30" : "text-red-400 bg-red-900/30"}`}>
              {p.changePercent24h >= 0 ? "▲" : "▼"}{Math.abs(p.changePercent24h).toFixed(2)}%
            </span>
          </div>
          <p className="text-sm font-bold font-mono">
            {p.price >= 1000 ? p.price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : p.price >= 1 ? p.price.toFixed(2) : p.price.toFixed(4)}
          </p>
        </div>
      ))}
    </div>
  );
}

function PortfolioSummary() {
  const { settings } = useSettings();
  const balance = settings.accountBalance;
  const equity = balance;
  const usedMargin = 0;
  const freeMargin = balance;
  const totalPnL = 0;
  const openTrades = 0;
  const maxTrades = settings.maxOpenPositions;

  const metrics = [
    { label: "الرصيد", value: `$${balance.toLocaleString()}`, icon: "💰", positive: true },
    { label: "الحقوق", value: `$${Math.round(equity).toLocaleString()}`, icon: "📊", positive: true },
    { label: "الهامش المستخدم", value: `$${Math.round(usedMargin)}`, icon: "🔒", positive: true },
    { label: "الهامش الحر", value: `$${Math.round(freeMargin).toLocaleString()}`, icon: "🔓", positive: true },
    { label: "إجمالي P&L", value: `$${Math.round(totalPnL)}`, icon: totalPnL >= 0 ? "📈" : "📉", positive: totalPnL >= 0 },
    { label: "الصفقات المفتوحة", value: `${openTrades}/${maxTrades}`, icon: "📊", positive: true },
    { label: "المخاطرة/صفقة", value: `${settings.riskLimit}%`, icon: "🛡️", positive: true },
    { label: "الحالة", value: settings.brokerType === "demo" ? "تجريبي" : "حقيقي", icon: "⚙️", positive: true },
  ];

  const equityData = [];
  let eq = balance;
  for (let i = 0; i < 30; i++) {
    eq += (Math.sin(i * 0.5) * balance * 0.008) + (balance * 0.001);
    equityData.push({ label: `${i + 1}`, value: Math.round(eq) });
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>💰</span>
            ملخص المحفظة
          </h3>
          <div className="flex items-center gap-2">
            <div className="status-dot status-completed" />
            <span className="text-xs text-emerald-400">نشط</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
                <span className="text-xs">{m.icon}</span>
              </div>
              <p className={`text-base font-bold ${m.positive ? "text-emerald-400" : "text-red-400"}`}>
                {m.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📈</span>
            منحنى الأموال (30 يوم)
          </h3>
          <LineChart data={equityData} height={200} color="#10b981" prefix="$" />
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📊</span>
            إحصائيات الأداء
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Win Rate", value: "68.5%", b: ">55%" },
              { label: "Profit Factor", value: "2.34", b: ">1.5" },
              { label: "Sharpe Ratio", value: "1.85", b: ">1.0" },
              { label: "Max Drawdown", value: "-8.2%", b: "<15%" },
              { label: "Avg Win/Loss", value: "1.8:1", b: ">1.5:1" },
              { label: "Best Trade", value: "+$4,250", b: "" },
              { label: "Worst Trade", value: "-$1,800", b: "" },
              { label: "Total Trades", value: "156", b: "" },
            ].map((m) => (
              <div key={m.label} className="bg-[var(--color-omega-surface)] p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
                  <p className="text-sm font-bold text-emerald-400">{m.value}</p>
                </div>
                {m.b && <span className="text-[10px] text-[var(--color-omega-muted)]">{m.b}</span>}
              </div>
            ))}
          </div>
        </div>
      </div>
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

      <DashboardMarketStatus />

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--color-omega-border)]">
          <h3 className="text-xs font-bold">الرسم البياني - الذهب (XAU/USD)</h3>
          <span className="text-[10px] text-[var(--color-omega-muted)]">TradingView</span>
        </div>
        <TradingViewWidget symbol="COMEX:GC1!" interval="D" height={380} />
      </div>

      <QuickPrices />
      <PortfolioSummary />
      <SystemHealthPanel />
      <ExpertBoard experts={agentRegistry} />
    </div>
  );
}

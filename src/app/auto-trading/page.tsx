"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSettings } from "@/hooks/useSettings";

interface SimulatedTrade {
  id: string;
  time: string;
  asset: string;
  direction: "buy" | "sell";
  entryPrice: number;
  currentPrice: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  pnl: number;
  pnlPercent: number;
  status: "open" | "closed";
  expert: string;
  confidence: number;
  closeTime?: string;
}

function generateNewTrade(): SimulatedTrade {
  const assets = ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "SOLUSD", "ETHUSD"];
  const experts = ["الخبير الفني", "خبير SMC", "خبير إيشيموكو", "خبير إليوت", "Ensemble"];
  const asset = assets[Math.floor(Math.random() * assets.length)];
  const dir = Math.random() > 0.5 ? "buy" : "sell";
  const basePrice = asset === "XAUUSD" ? 2655 : asset === "EURUSD" ? 1.0845 : asset === "BTCUSD" ? 97500 : asset === "SOLUSD" ? 195 : asset === "ETHUSD" ? 3450 : 1.2715;
  const entry = basePrice + (Math.random() - 0.5) * basePrice * 0.005;
  const sl = dir === "buy" ? entry * 0.99 : entry * 1.01;
  const tp = dir === "buy" ? entry * 1.02 : entry * 0.98;
  return {
    id: `T-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: new Date().toLocaleTimeString("ar-SA"),
    asset, direction: dir,
    entryPrice: Math.round(entry * 10000) / 10000,
    currentPrice: Math.round(entry * 10000) / 10000,
    quantity: Math.round(10 + Math.random() * 90),
    stopLoss: Math.round(sl * 10000) / 10000,
    takeProfit: Math.round(tp * 10000) / 10000,
    pnl: 0, pnlPercent: 0, status: "open",
    expert: experts[Math.floor(Math.random() * experts.length)],
    confidence: Math.round(70 + Math.random() * 25),
  };
}

export default function AutoTradingPage() {
  const { settings } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [trades, setTrades] = useState<SimulatedTrade[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<"trades" | "logs" | "stats">("trades");
  const logsRef = useRef<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);

  const pushLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString("ar-SA");
    logsRef.current = [...logsRef.current.slice(-100), `[${time}] ${msg}`];
    setLogs([...logsRef.current]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleActive = useCallback(() => {
    setIsActive((prev) => {
      if (!prev) pushLog("🟢 تم تفعيل التداول الآلي");
      else pushLog("🔴 تم إيقاف التداول الآلي");
      return !prev;
    });
  }, [pushLog]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      setTrades((prev) => {
        let updated = [...prev];
        const openCount = updated.filter((t) => t.status === "open").length;
        if (Math.random() > 0.6 && openCount < settings.maxOpenPositions) {
          const nt = generateNewTrade();
          updated = [nt, ...updated.slice(0, 49)];
          pushLog(`📊 صفقة: ${nt.direction === "buy" ? "شراء" : "بيع"} ${nt.asset} @ ${nt.entryPrice} | ${nt.expert}`);
        }
        updated = updated.map((trade) => {
          if (trade.status !== "open") return trade;
          const vol = trade.asset.includes("BTC") ? 0.003 : trade.asset.includes("XAU") ? 0.001 : 0.0005;
          const change = (Math.random() - 0.48) * trade.entryPrice * vol;
          const np = trade.currentPrice + change;
          const pnl = trade.direction === "buy" ? (np - trade.entryPrice) * trade.quantity : (trade.entryPrice - np) * trade.quantity;
          const pnlPct = (pnl / (trade.entryPrice * trade.quantity)) * 100;
          if (np <= trade.stopLoss || np >= trade.takeProfit) {
            pushLog(`${pnl > 0 ? "✅ ربح" : "❌ خسارة"}: ${trade.asset} $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`);
            return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct, status: "closed" as const, closeTime: new Date().toLocaleTimeString("ar-SA") };
          }
          return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct };
        });
        return updated;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, [isActive, settings.maxOpenPositions, pushLog]);

  const accountInfo = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const wins = closed.filter((t) => t.pnl > 0);
    const totalPnL = closed.reduce((s, t) => s + t.pnl, 0);
    const openPnL = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.pnl, 0);
    const margin = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.entryPrice * t.quantity * 0.01, 0);
    return {
      balance: 100000, equity: 100000 + totalPnL + openPnL, margin,
      freeMargin: 100000 + totalPnL - margin, totalPnL, dailyPnL: totalPnL,
      winRate: closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0,
      totalTrades: closed.length, openTrades: trades.filter((t) => t.status === "open").length,
    };
  }, [trades]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">التداول الآلي</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">نظام سعود - مراقبة التداول الآلي المباشر</p>
        </div>
        <button onClick={toggleActive} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all ${isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
          {isActive ? "⏸ إيقاف" : "▶️ تفعيل"}
        </button>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4 flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${isActive ? "bg-emerald-400 animate-pulse" : "bg-red-500"}`} />
        <div>
          <p className="text-sm font-medium">{isActive ? "التداول الآلي نشط" : "التداول الآلي متوقف"}</p>
          <p className="text-xs text-[var(--color-omega-muted)]">الحساب: {settings.brokerType === "demo" ? "تجريبي" : "حقيقي"} | المخاطرة: {settings.riskLimit}%</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "الرصيد", value: `$${accountInfo.balance.toLocaleString()}`, c: "text-white" },
          { label: "الحقوق", value: `$${Math.round(accountInfo.equity).toLocaleString()}`, c: "text-emerald-400" },
          { label: "الهامش", value: `$${Math.round(accountInfo.margin).toLocaleString()}`, c: "text-amber-400" },
          { label: "هامش حر", value: `$${Math.round(accountInfo.freeMargin).toLocaleString()}`, c: "text-blue-400" },
          { label: "P&L", value: `$${Math.round(accountInfo.totalPnL)}`, c: accountInfo.totalPnL >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Win Rate", value: `${accountInfo.winRate}%`, c: "text-emerald-400" },
          { label: "مفتوحة", value: `${accountInfo.openTrades}`, c: "text-amber-400" },
        ].map((m) => (
          <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
            <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
            <p className={`text-sm font-bold font-mono ${m.c}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[var(--color-omega-border)]">
        {(["trades", "logs", "stats"] as const).map((tab) => (
          <button key={tab} onClick={() => setSelectedTab(tab)} className={`px-4 py-2 text-xs font-medium border-b-2 ${selectedTab === tab ? "border-emerald-500 text-emerald-400" : "border-transparent text-[var(--color-omega-muted)]"}`}>
            {tab === "trades" ? "📊 الصفقات" : tab === "logs" ? "📝 السجل" : "📈 الإحصائيات"}
          </button>
        ))}
      </div>

      {selectedTab === "trades" && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-[var(--color-omega-surface)]">
              {["الوقت","الأصل","الاتجاه","الدخول","الحالي","وقف/هدف","P&L","الخبير","الحالة"].map(h => (
                <th key={h} className="text-right px-3 py-2 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {trades.length === 0 && <tr><td colSpan={9} className="text-center py-8 text-[var(--color-omega-muted)]">{isActive ? "في انتظار الإشارات..." : "فعّل التداول الآلي"}</td></tr>}
              {trades.map((t) => (
                <tr key={t.id} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                  <td className="px-3 py-2 font-mono">{t.time}</td>
                  <td className="px-3 py-2 font-medium">{t.asset}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.direction === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{t.direction === "buy" ? "شراء" : "بيع"}</span></td>
                  <td className="px-3 py-2 font-mono">{t.entryPrice > 100 ? t.entryPrice.toFixed(0) : t.entryPrice.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono">{t.currentPrice > 100 ? t.currentPrice.toFixed(0) : t.currentPrice.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono text-[10px]"><span className="text-red-400">{t.stopLoss > 100 ? t.stopLoss.toFixed(0) : t.stopLoss.toFixed(4)}</span> / <span className="text-emerald-400">{t.takeProfit > 100 ? t.takeProfit.toFixed(0) : t.takeProfit.toFixed(4)}</span></td>
                  <td className={`px-3 py-2 font-bold font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.pnl.toFixed(2)}<span className="text-[10px] block">{t.pnlPercent.toFixed(2)}%</span></td>
                  <td className="px-3 py-2 text-[10px]">{t.expert}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.status === "open" ? "bg-blue-900/40 text-blue-400" : "bg-gray-900/40 text-gray-400"}`}>{t.status === "open" ? "مفتوحة" : "مغلقة"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === "logs" && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-xs">
          {logs.length === 0 && <p className="text-[var(--color-omega-muted)]">السجل فارغ</p>}
          {logs.map((log, i) => (
            <p key={i} className={`py-0.5 ${log.includes("ربح") ? "text-emerald-400" : log.includes("خسارة") ? "text-red-400" : log.includes("تفعيل") ? "text-emerald-400 font-bold" : log.includes("إيقاف") ? "text-red-400 font-bold" : "text-[var(--color-omega-muted)]"}`}>{log}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الصفقات", value: accountInfo.totalTrades },
            { label: "الرابحة", value: trades.filter((t) => t.status === "closed" && t.pnl > 0).length },
            { label: "الخاسرة", value: trades.filter((t) => t.status === "closed" && t.pnl <= 0).length },
            { label: "Win Rate", value: `${accountInfo.winRate}%` },
            { label: "أفضل صفقة", value: `$${trades.length > 0 ? Math.max(...trades.map(t => t.pnl)).toFixed(0) : 0}` },
            { label: "أسوأ صفقة", value: `$${trades.length > 0 ? Math.min(...trades.map(t => t.pnl)).toFixed(0) : 0}` },
            { label: "إجمالي P&L", value: `$${Math.round(accountInfo.totalPnL)}` },
            { label: "مفتوحة", value: accountInfo.openTrades },
          ].map((s) => (
            <div key={s.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
              <p className="text-xs text-[var(--color-omega-muted)]">{s.label}</p>
              <p className="text-lg font-bold font-mono">{s.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

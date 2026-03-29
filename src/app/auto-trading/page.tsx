"use client";
import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useSettings } from "@/hooks/useSettings";
import { isMarketOpenForSymbol, getMarketStatus, getMarketType } from "@/lib/utils/market-hours";

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

const ASSET_CONFIG: Record<string, { base: number; vol: number; tv: string }> = {
  XAUUSD: { base: 2655, vol: 0.002, tv: "COMEX:GC1!" },
  EURUSD: { base: 1.0845, vol: 0.0005, tv: "FX:EURUSD" },
  GBPUSD: { base: 1.2715, vol: 0.0006, tv: "FX:GBPUSD" },
  USDJPY: { base: 149.3, vol: 0.0008, tv: "FX:USDJPY" },
  BTCUSD: { base: 97500, vol: 0.003, tv: "BITSTAMP:BTCUSD" },
  ETHUSD: { base: 3450, vol: 0.004, tv: "BITSTAMP:ETHUSD" },
  SOLUSD: { base: 195, vol: 0.005, tv: "BINANCE:SOLUSDT" },
  SPX500: { base: 5940, vol: 0.001, tv: "SP:SPX" },
  USOIL: { base: 72.1, vol: 0.003, tv: "NYMEX:CL1!" },
  XAGUSD: { base: 30.8, vol: 0.003, tv: "COMEX:SI1!" },
  NAS100: { base: 20450, vol: 0.001, tv: "NASDAQ:NDX" },
  US30: { base: 43250, vol: 0.001, tv: "DJ:DJI" },
};

function generateTradeForAsset(asset: string): SimulatedTrade {
  const config = ASSET_CONFIG[asset] || { base: 100, vol: 0.01, tv: "" };
  const dir = Math.random() > 0.5 ? "buy" : "sell";
  const entry = config.base + (Math.random() - 0.5) * config.base * config.vol;
  const slDist = config.base * config.vol * 2;
  const sl = dir === "buy" ? entry - slDist : entry + slDist;
  const tp = dir === "buy" ? entry + slDist * 2 : entry - slDist * 2;
  const experts = ["Ensemble", "إيشيموكو", "SMC", "فيبوناتشي", "إليوت", "RSI+MACD"];

  return {
    id: `T-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: new Date().toLocaleTimeString("ar-SA"),
    asset,
    direction: dir,
    entryPrice: Math.round(entry * 10000) / 10000,
    currentPrice: Math.round(entry * 10000) / 10000,
    quantity: Math.round(10 + Math.random() * 90),
    stopLoss: Math.round(sl * 10000) / 10000,
    takeProfit: Math.round(tp * 10000) / 10000,
    pnl: 0,
    pnlPercent: 0,
    status: "open",
    expert: experts[Math.floor(Math.random() * experts.length)],
    confidence: Math.round(75 + Math.random() * 20),
  };
}

function pickTradeableAsset(selectedStrategies: string[]): string | null {
  const tradableAssets = Object.keys(ASSET_CONFIG);
  const openAssets = tradableAssets.filter((a) => {
    const type = getMarketType(a);
    if (type === "crypto") return true;
    return isMarketOpenForSymbol(a);
  });

  if (openAssets.length === 0) return null;
  return openAssets[Math.floor(Math.random() * openAssets.length)];
}

export default function AutoTradingPage() {
  const { settings, updateSettings } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [trades, setTrades] = useState<SimulatedTrade[]>([]);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedTab, setSelectedTab] = useState<"trades" | "logs" | "stats">("trades");
  const [cooldownActive, setCooldownActive] = useState(false);
  const logsRef = useRef<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const consecutiveLossesRef = useRef(0);

  const pushLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString("ar-SA");
    logsRef.current = [...logsRef.current.slice(-100), `[${time}] ${msg}`];
    setLogs([...logsRef.current]);
  }, []);

  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const toggleActive = useCallback(() => {
    if (cooldownActive) {
      pushLog("⚠️ فترة الهدوء نشطة - لا يمكن التفعيل");
      return;
    }
    setIsActive((prev) => {
      if (!prev) pushLog("🟢 تم تفعيل التداول الآلي");
      else pushLog("🔴 تم إيقاف التداول الآلي");
      return !prev;
    });
  }, [pushLog, cooldownActive]);

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      if (cooldownActive) return;

      setTrades((prev) => {
        let updated = [...prev];
        const openCount = updated.filter((t) => t.status === "open").length;

        if (Math.random() > 0.65 && openCount < settings.maxOpenPositions) {
          const asset = pickTradeableAsset(settings.selectedStrategies);
          if (asset) {
            const nt = generateTradeForAsset(asset);
            updated = [nt, ...updated.slice(0, 49)];
            pushLog(`📊 صفقة: ${nt.direction === "buy" ? "شراء" : "بيع"} ${nt.asset} @ ${nt.entryPrice > 100 ? nt.entryPrice.toFixed(0) : nt.entryPrice.toFixed(4)} | ${nt.expert} (${nt.confidence}%)`);
          } else {
            pushLog("⚠️ جميع الأسواق مغلقة - لا توجد صفقات");
          }
        }

        updated = updated.map((trade) => {
          if (trade.status !== "open") return trade;
          const config = ASSET_CONFIG[trade.asset] || { vol: 0.001 };
          const change = (Math.random() - 0.48) * trade.entryPrice * config.vol;
          const np = trade.currentPrice + change;
          const pnl = trade.direction === "buy" ? (np - trade.entryPrice) * trade.quantity : (trade.entryPrice - np) * trade.quantity;
          const pnlPct = (pnl / (trade.entryPrice * trade.quantity)) * 100;

          if (np <= trade.stopLoss || np >= trade.takeProfit) {
            if (pnl <= 0) {
              consecutiveLossesRef.current++;
              if (consecutiveLossesRef.current >= settings.maxConsecutiveLosses && settings.cooldownAfterLoss > 0) {
                pushLog(`⚠️ ${settings.maxConsecutiveLosses} خسائر متتالية - فترة هدوء ${settings.cooldownAfterLoss} ساعة`);
                setCooldownActive(true);
                setIsActive(false);
                setTimeout(() => {
                  setCooldownActive(false);
                  consecutiveLossesRef.current = 0;
                  pushLog("✅ انتهت فترة الهدوء");
                }, settings.cooldownAfterLoss * 60 * 60 * 1000);
              }
            } else {
              consecutiveLossesRef.current = 0;
            }
            pushLog(`${pnl > 0 ? "✅ ربح" : "❌ خسارة"}: ${trade.asset} $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%)`);
            return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct, status: "closed" as const, closeTime: new Date().toLocaleTimeString("ar-SA") };
          }
          return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct };
        });

        return updated;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, [isActive, settings.maxOpenPositions, settings.maxConsecutiveLosses, settings.cooldownAfterLoss, settings.selectedStrategies, cooldownActive, pushLog]);

  const accountInfo = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const wins = closed.filter((t) => t.pnl > 0);
    const totalPnL = closed.reduce((s, t) => s + t.pnl, 0);
    const openPnL = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.pnl, 0);
    const margin = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.entryPrice * t.quantity * 0.01, 0);
    return {
      balance: settings.accountBalance,
      equity: settings.accountBalance + totalPnL + openPnL,
      margin, freeMargin: settings.accountBalance + totalPnL - margin,
      totalPnL, dailyPnL: totalPnL,
      winRate: closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0,
      totalTrades: closed.length, openTrades: trades.filter((t) => t.status === "open").length,
    };
  }, [trades, settings.accountBalance]);

  const marketStatuses = useMemo(() => ({
    forex: getMarketStatus("EURUSD"),
    crypto: getMarketStatus("BTCUSD"),
    stocks: getMarketStatus("SPX500"),
    gold: getMarketStatus("XAUUSD"),
  }), []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">التداول الآلي</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">الحساب: {settings.brokerType === "demo" ? "تجريبي" : settings.brokerType === "live" ? "حقيقي" : "ورقي"}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg text-xs">
            <div className={`w-2 h-2 rounded-full ${marketStatuses.forex.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />فوركس
            <div className={`w-2 h-2 rounded-full ${marketStatuses.stocks.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />أسهم
            <div className="w-2 h-2 rounded-full bg-emerald-400" />كريبتو
          </div>
          <button onClick={toggleActive} disabled={cooldownActive} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
            {cooldownActive ? "⏳ هدوء" : isActive ? "⏸ إيقاف" : "▶️ تفعيل"}
          </button>
        </div>
      </div>

      {cooldownActive && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 flex items-center gap-2">
          <span className="text-amber-400">⏳</span>
          <p className="text-xs text-amber-300">فترة هدوء نشطة بسبب {settings.maxConsecutiveLosses} خسائر متتالية. استمرار بعد {settings.cooldownAfterLoss} ساعة.</p>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "الرصيد", value: `$${accountInfo.balance.toLocaleString()}`, c: "text-white" },
          { label: "الحقوق", value: `$${Math.round(accountInfo.equity).toLocaleString()}`, c: "text-emerald-400" },
          { label: "الهامش", value: `$${Math.round(accountInfo.margin)}`, c: "text-amber-400" },
          { label: "حر", value: `$${Math.round(accountInfo.freeMargin)}`, c: "text-blue-400" },
          { label: "P&L", value: `$${Math.round(accountInfo.totalPnL)}`, c: accountInfo.totalPnL >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Win Rate", value: `${accountInfo.winRate}%`, c: "text-emerald-400" },
          { label: "مفتوحة", value: `${accountInfo.openTrades}/${settings.maxOpenPositions}`, c: "text-amber-400" },
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
              {["الوقت","الأصل","السوق","الاتجاه","الدخول","الحالي","وقف/هدف","P&L","الخبير","الحالة"].map(h => (
                <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {trades.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-[var(--color-omega-muted)]">{isActive ? "في انتظار الإشارات..." : "فعّل التداول الآلي"}</td></tr>}
              {trades.map((t) => {
                const mkt = getMarketStatus(t.asset);
                return (
                  <tr key={t.id} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                    <td className="px-3 py-2 font-mono whitespace-nowrap">{t.time}</td>
                    <td className="px-3 py-2 font-medium">{t.asset}</td>
                    <td className="px-3 py-2"><span className={`px-1 py-0.5 rounded text-[9px] ${mkt.isOpen ? "bg-emerald-900/40 text-emerald-400" : "bg-red-900/40 text-red-400"}`}>{mkt.isOpen ? "مفتوح" : "مغلق"}</span></td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.direction === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{t.direction === "buy" ? "شراء" : "بيع"}</span></td>
                    <td className="px-3 py-2 font-mono">{t.entryPrice > 100 ? t.entryPrice.toFixed(0) : t.entryPrice.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono">{t.currentPrice > 100 ? t.currentPrice.toFixed(0) : t.currentPrice.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono text-[10px]"><span className="text-red-400">{t.stopLoss > 100 ? t.stopLoss.toFixed(0) : t.stopLoss.toFixed(4)}</span>/<span className="text-emerald-400">{t.takeProfit > 100 ? t.takeProfit.toFixed(0) : t.takeProfit.toFixed(4)}</span></td>
                    <td className={`px-3 py-2 font-bold font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.pnl.toFixed(2)}</td>
                    <td className="px-3 py-2 text-[10px]">{t.expert}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.status === "open" ? "bg-blue-900/40 text-blue-400" : "bg-gray-900/40 text-gray-400"}`}>{t.status === "open" ? "مفتوحة" : "مغلقة"}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === "logs" && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-xs">
          {logs.length === 0 && <p className="text-[var(--color-omega-muted)]">السجل فارغ</p>}
          {logs.map((log, i) => (
            <p key={i} className={`py-0.5 ${log.includes("ربح") ? "text-emerald-400" : log.includes("خسارة") ? "text-red-400" : log.includes("تفعيل") ? "text-emerald-400 font-bold" : log.includes("إيقاف") ? "text-red-400 font-bold" : log.includes("هدوء") ? "text-amber-400" : "text-[var(--color-omega-muted)]"}`}>{log}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي", value: accountInfo.totalTrades },
            { label: "رابحة", value: trades.filter((t) => t.status === "closed" && t.pnl > 0).length },
            { label: "خاسرة", value: trades.filter((t) => t.status === "closed" && t.pnl <= 0).length },
            { label: "Win Rate", value: `${accountInfo.winRate}%` },
            { label: "أفضل", value: `$${trades.length > 0 ? Math.max(...trades.map(t => t.pnl)).toFixed(0) : 0}` },
            { label: "أسوأ", value: `$${trades.length > 0 ? Math.min(...trades.map(t => t.pnl)).toFixed(0) : 0}` },
            { label: "إجمالي P&L", value: `$${Math.round(accountInfo.totalPnL)}` },
            { label: "خسائر متتالية", value: "-" },
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

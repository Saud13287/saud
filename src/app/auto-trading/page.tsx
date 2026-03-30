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
  strategy: string;
  confidence: number;
  closeTime?: string;
  broker?: string;
}

interface ConnectedBroker {
  id: string;
  name: string;
  nameAr: string;
  broker: string;
  status: string;
  type: string;
}

const ASSET_CONFIG: Record<string, { base: number; vol: number; tv: string; name: string }> = {
  XAUUSD: { base: 2655, vol: 0.002, tv: "COMEX:GC1!", name: "ذهب" },
  EURUSD: { base: 1.0845, vol: 0.0005, tv: "FX:EURUSD", name: "يورو" },
  GBPUSD: { base: 1.2715, vol: 0.0006, tv: "FX:GBPUSD", name: "جنيه" },
  USDJPY: { base: 149.3, vol: 0.0008, tv: "FX:USDJPY", name: "ين" },
  BTCUSD: { base: 97500, vol: 0.003, tv: "BITSTAMP:BTCUSD", name: "بيتكوين" },
  ETHUSD: { base: 3450, vol: 0.004, tv: "BITSTAMP:ETHUSD", name: "إيثريوم" },
  SOLUSD: { base: 195, vol: 0.005, tv: "BINANCE:SOLUSDT", name: "سولانا" },
  SPX500: { base: 5940, vol: 0.001, tv: "SP:SPX", name: "S&P 500" },
  USOIL: { base: 72.1, vol: 0.003, tv: "NYMEX:CL1!", name: "نفط" },
  XAGUSD: { base: 30.8, vol: 0.003, tv: "COMEX:SI1!", name: "فضة" },
  NAS100: { base: 20450, vol: 0.001, tv: "NASDAQ:NDX", name: "ناسداك" },
  US30: { base: 43250, vol: 0.001, tv: "DJ:DJI", name: "داو جونز" },
};

const EXPERTS = ["Ensemble", "إيشيموكو", "SMC Order Block", "ICT FVG", "فيبوناتشي", "RSI+MACD", "CRT", "Liquidity Sweep", "ICT OTE", "BOS"];

function generateTradeForAsset(asset: string, slPct: number, tpPct: number, sizePct: number, strategies: string[]): SimulatedTrade {
  const config = ASSET_CONFIG[asset] || { base: 100, vol: 0.01, tv: "", name: asset };
  const dir = Math.random() > 0.5 ? "buy" : "sell";
  const entry = config.base + (Math.random() - 0.5) * config.base * config.vol;
  const slDist = entry * (slPct / 100);
  const tpDist = entry * (tpPct / 100);
  const sl = dir === "buy" ? entry - slDist : entry + slDist;
  const tp = dir === "buy" ? entry + tpDist : entry - tpDist;
  const expert = EXPERTS[Math.floor(Math.random() * EXPERTS.length)];
  const strat = strategies.length > 0 ? strategies[Math.floor(Math.random() * strategies.length)] : "Ensemble";

  return {
    id: `T-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    time: new Date().toLocaleTimeString("ar-SA"),
    asset,
    direction: dir,
    entryPrice: Math.round(entry * 10000) / 10000,
    currentPrice: Math.round(entry * 10000) / 10000,
    quantity: Math.round(10 + sizePct * 4),
    stopLoss: Math.round(sl * 10000) / 10000,
    takeProfit: Math.round(tp * 10000) / 10000,
    pnl: 0,
    pnlPercent: 0,
    status: "open",
    expert,
    strategy: strat,
    confidence: Math.round(82 + Math.random() * 15),
  };
}

function playNotificationSound(type: "open" | "close" | "profit" | "loss") {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    if (type === "profit") { osc.frequency.value = 880; }
    else if (type === "loss") { osc.frequency.value = 220; }
    else { osc.frequency.value = 440; }
    gain.gain.value = 0.1;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {}
}

function pickTradeableAsset(allowedAssets: string[]): string | null {
  const openAssets = allowedAssets.filter((a) => {
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
  const [selectedTab, setSelectedTab] = useState<"trades" | "logs" | "stats" | "settings">("trades");
  const [cooldownActive, setCooldownActive] = useState(false);
  const [brokers, setBrokers] = useState<ConnectedBroker[]>(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("saud-broker-accounts");
        if (stored) {
          const accounts = JSON.parse(stored);
          return accounts.filter((a: ConnectedBroker) => a.status === "connected");
        }
      } catch {}
    }
    return [];
  });
  const [selectedBroker, setSelectedBroker] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [localSlPct, setLocalSlPct] = useState(settings.stopLossPercent || 2);
  const [localTpPct, setLocalTpPct] = useState(settings.takeProfitPercent || 4);
  const [localSizePct, setLocalSizePct] = useState(settings.tradeSizePercent || 2);
  const [allowedAssets, setAllowedAssets] = useState<string[]>(settings.allowedAssets || Object.keys(ASSET_CONFIG));
  const [requireConfirm, setRequireConfirm] = useState(settings.requireConfirmation ?? true);
  const logsRef = useRef<string[]>([]);
  const logEndRef = useRef<HTMLDivElement>(null);
  const consecutiveLossesRef = useRef(0);

  const pushLog = useCallback((msg: string) => {
    const time = new Date().toLocaleTimeString("ar-SA");
    logsRef.current = [...logsRef.current.slice(-100), `[${time}] ${msg}`];
    setLogs([...logsRef.current]);
  }, []);

  useEffect(() => { logEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [logs]);

  const toggleActive = useCallback(() => {
    if (cooldownActive) { pushLog("⚠️ فترة الهدوء نشطة - لا يمكن التفعيل"); return; }
    setIsActive((prev) => {
      if (!prev) pushLog("🟢 تم تفعيل التداول الآلي" + (selectedBroker ? ` | الوسيط: ${brokers.find(b => b.id === selectedBroker)?.nameAr || "غير محدد"}` : ""));
      else pushLog("🔴 تم إيقاف التداول الآلي");
      return !prev;
    });
  }, [pushLog, cooldownActive, selectedBroker, brokers]);

  const closeTrade = useCallback((tradeId: string) => {
    setTrades((prev) => prev.map((t) => {
      if (t.id !== tradeId || t.status !== "open") return t;
      const pnl = t.direction === "buy" ? (t.currentPrice - t.entryPrice) * t.quantity : (t.entryPrice - t.currentPrice) * t.quantity;
      const pnlPct = (pnl / (t.entryPrice * t.quantity)) * 100;
      pushLog(`🔒 إغلاق يدوي: ${t.asset} ${pnl >= 0 ? "ربح" : "خسارة"} $${pnl.toFixed(2)}`);
      if (settings.soundEnabled) playNotificationSound(pnl >= 0 ? "profit" : "loss");
      return { ...t, pnl, pnlPercent: pnlPct, status: "closed" as const, closeTime: new Date().toLocaleTimeString("ar-SA") };
    }));
  }, [pushLog, settings.soundEnabled]);

  const closeAllTrades = useCallback(() => {
    setTrades((prev) => prev.map((t) => {
      if (t.status !== "open") return t;
      const pnl = t.direction === "buy" ? (t.currentPrice - t.entryPrice) * t.quantity : (t.entryPrice - t.currentPrice) * t.quantity;
      const pnlPct = (pnl / (t.entryPrice * t.quantity)) * 100;
      return { ...t, pnl, pnlPercent: pnlPct, status: "closed" as const, closeTime: new Date().toLocaleTimeString("ar-SA") };
    }));
    pushLog("🔒 تم إغلاق جميع الصفقات يدوياً");
    setIsActive(false);
  }, [pushLog]);

  useEffect(() => {
    if (!isActive) return;
    const interval = setInterval(() => {
      if (cooldownActive) return;
      setTrades((prev) => {
        let updated = [...prev];
        const openCount = updated.filter((t) => t.status === "open").length;
        if (Math.random() > 0.65 && openCount < settings.maxOpenPositions) {
          const asset = pickTradeableAsset(allowedAssets);
          if (asset) {
            const nt = generateTradeForAsset(asset, localSlPct, localTpPct, localSizePct, settings.selectedStrategies);
            if (selectedBroker) nt.broker = selectedBroker;
            updated = [nt, ...updated.slice(0, 49)];
            pushLog(`📊 صفقة: ${nt.direction === "buy" ? "شراء" : "بيع"} ${nt.asset} @ ${nt.entryPrice > 100 ? nt.entryPrice.toFixed(0) : nt.entryPrice.toFixed(4)} | ${nt.expert} (${nt.confidence}%) [${nt.strategy}]`);
            if (settings.soundEnabled) playNotificationSound("open");
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
                setTimeout(() => { setCooldownActive(false); consecutiveLossesRef.current = 0; pushLog("✅ انتهت فترة الهدوء"); }, settings.cooldownAfterLoss * 60 * 60 * 1000);
              }
            } else { consecutiveLossesRef.current = 0; }
            pushLog(`${pnl > 0 ? "✅ ربح" : "❌ خسارة"}: ${trade.asset} $${pnl.toFixed(2)} (${pnlPct.toFixed(2)}%) [${trade.strategy}]`);
            if (settings.soundEnabled) playNotificationSound(pnl > 0 ? "profit" : "loss");
            return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct, status: "closed" as const, closeTime: new Date().toLocaleTimeString("ar-SA") };
          }
          return { ...trade, currentPrice: np, pnl, pnlPercent: pnlPct };
        });
        return updated;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, [isActive, settings.maxOpenPositions, settings.maxConsecutiveLosses, settings.cooldownAfterLoss, settings.selectedStrategies, cooldownActive, pushLog, selectedBroker, localSlPct, localTpPct, localSizePct, allowedAssets, settings.soundEnabled]);

  const accountInfo = useMemo(() => {
    const closed = trades.filter((t) => t.status === "closed");
    const wins = closed.filter((t) => t.pnl > 0);
    const losses = closed.filter((t) => t.pnl <= 0);
    const totalPnL = closed.reduce((s, t) => s + t.pnl, 0);
    const openPnL = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.pnl, 0);
    const margin = trades.filter((t) => t.status === "open").reduce((s, t) => s + t.entryPrice * t.quantity * 0.01, 0);
    const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
    const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
    const avgWin = wins.length > 0 ? grossProfit / wins.length : 0;
    const avgLoss = losses.length > 0 ? grossLoss / losses.length : 0;
    return {
      balance: settings.accountBalance, equity: settings.accountBalance + totalPnL + openPnL,
      margin, freeMargin: settings.accountBalance + totalPnL - margin,
      totalPnL, winRate: closed.length > 0 ? Math.round((wins.length / closed.length) * 100) : 0,
      totalTrades: closed.length, openTrades: trades.filter((t) => t.status === "open").length,
      profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : 0,
      avgWin: Math.round(avgWin * 100) / 100, avgLoss: Math.round(avgLoss * 100) / 100,
      bestTrade: closed.length > 0 ? Math.max(...closed.map(t => t.pnl)) : 0,
      worstTrade: closed.length > 0 ? Math.min(...closed.map(t => t.pnl)) : 0,
    };
  }, [trades, settings.accountBalance]);

  const marketStatuses = useMemo(() => ({
    forex: getMarketStatus("EURUSD"), crypto: getMarketStatus("BTCUSD"),
    stocks: getMarketStatus("SPX500"), gold: getMarketStatus("XAUUSD"), indices: getMarketStatus("SPX500"),
  }), []);

  const allTraditionalClosed = !marketStatuses.forex.isOpen && !marketStatuses.stocks.isOpen && !marketStatuses.gold.isOpen;
  const connectedBrokerData = brokers.find(b => b.id === selectedBroker);
  const openTrades = trades.filter(t => t.status === "open");

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">التداول الآلي المتقدم</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">
            {connectedBrokerData ? `الوسيط: ${connectedBrokerData.nameAr} (${connectedBrokerData.type === "demo" ? "تجريبي" : "حقيقي"})` : "لم يتم اختيار وسيط"}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg text-xs">
            <div className={`w-2 h-2 rounded-full ${marketStatuses.forex.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />فوركس
            <div className={`w-2 h-2 rounded-full ${marketStatuses.stocks.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />أسهم
            <div className="w-2 h-2 rounded-full bg-emerald-400" />كريبتو
            <div className={`w-2 h-2 rounded-full ${marketStatuses.gold.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />ذهب
            <div className={`w-2 h-2 rounded-full ${marketStatuses.indices.isOpen ? "bg-emerald-400" : "bg-red-400"}`} />مؤشرات
          </div>
          {brokers.length > 0 && (
            <select value={selectedBroker} onChange={(e) => setSelectedBroker(e.target.value)} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg px-2 py-1.5 text-xs">
              <option value="">اختر وسيط</option>
              {brokers.map(b => <option key={b.id} value={b.id}>{b.nameAr} ({b.type === "demo" ? "تجريبي" : "حقيقي"})</option>)}
            </select>
          )}
          <button onClick={() => setShowSettings(!showSettings)} className="bg-[var(--color-omega-card)] hover:bg-[var(--color-omega-surface)] px-3 py-2 rounded-lg text-xs">⚙️</button>
        </div>
      </div>

      {showSettings && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4 space-y-3">
          <h3 className="text-sm font-bold">⚙️ إعدادات الصفقات</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="text-[10px] text-[var(--color-omega-muted)] block mb-1">وقف الخسارة %</label>
              <input type="number" value={localSlPct} onChange={(e) => setLocalSlPct(Number(e.target.value))} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-omega-muted)] block mb-1">جني الأرباح %</label>
              <input type="number" value={localTpPct} onChange={(e) => setLocalTpPct(Number(e.target.value))} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-xs font-mono" />
            </div>
            <div>
              <label className="text-[10px] text-[var(--color-omega-muted)] block mb-1">حجم الصفقة %</label>
              <input type="number" value={localSizePct} onChange={(e) => setLocalSizePct(Number(e.target.value))} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-xs font-mono" />
            </div>
            <div className="flex items-end gap-2">
              <label className="text-[10px] text-[var(--color-omega-muted)]">تأكيد يدوي</label>
              <button onClick={() => setRequireConfirm(!requireConfirm)} className={`w-8 h-4 rounded-full ${requireConfirm ? "bg-emerald-500" : "bg-gray-600"}`}>
                <div className={`w-3 h-3 rounded-full bg-white ${requireConfirm ? "translate-x-4" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>
          <div>
            <label className="text-[10px] text-[var(--color-omega-muted)] block mb-1">الأصول المسموحة</label>
            <div className="flex gap-1 flex-wrap">
              {Object.entries(ASSET_CONFIG).map(([key, val]) => (
                <button key={key} onClick={() => setAllowedAssets(prev => prev.includes(key) ? prev.filter(a => a !== key) : [...prev, key])}
                  className={`text-[9px] px-2 py-1 rounded ${allowedAssets.includes(key) ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-surface)] text-[var(--color-omega-muted)]"}`}>
                  {val.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {cooldownActive && (
        <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-3 flex items-center gap-2">
          <span className="text-amber-400">⏳</span>
          <p className="text-xs text-amber-300">فترة هدوء نشطة. استمرار بعد {settings.cooldownAfterLoss} ساعة.</p>
        </div>
      )}

      {allTraditionalClosed && !cooldownActive && (
        <div className="bg-red-900/20 border border-red-700/30 rounded-xl p-3 flex items-center gap-2">
          <span className="text-red-400">🚫</span>
          <div><p className="text-xs text-red-300 font-bold">الأسواق التقليدية مغلقة</p></div>
        </div>
      )}

      <div className="flex items-center gap-2 flex-wrap">
        <button onClick={toggleActive} disabled={cooldownActive} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all disabled:opacity-50 ${isActive ? "bg-red-600 hover:bg-red-700 text-white" : "bg-emerald-600 hover:bg-emerald-700 text-white"}`}>
          {cooldownActive ? "⏳ هدوء" : isActive ? "⏸ إيقاف" : "▶️ تفعيل"}
        </button>
        {openTrades.length > 0 && (
          <button onClick={closeAllTrades} className="px-4 py-2.5 rounded-lg text-sm font-bold bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-800/30">
            🔒 إغلاق الكل ({openTrades.length})
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
        {[
          { label: "الرصيد", value: `$${accountInfo.balance.toLocaleString()}`, c: "text-white" },
          { label: "الحقوق", value: `$${Math.round(accountInfo.equity).toLocaleString()}`, c: "text-emerald-400" },
          { label: "الهامش", value: `$${Math.round(accountInfo.margin)}`, c: "text-amber-400" },
          { label: "P&L", value: `$${Math.round(accountInfo.totalPnL)}`, c: accountInfo.totalPnL >= 0 ? "text-emerald-400" : "text-red-400" },
          { label: "Win Rate", value: `${accountInfo.winRate}%`, c: "text-emerald-400" },
          { label: "Profit F.", value: accountInfo.profitFactor.toFixed(2), c: accountInfo.profitFactor > 1 ? "text-emerald-400" : "text-red-400" },
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
              {["الوقت","الأصل","الاتجاه","الدخول","الحالي","وقف/هدف","P&L","الخبير","الاستراتيجية","الإجراء"].map(h => (
                <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {trades.length === 0 && <tr><td colSpan={10} className="text-center py-8 text-[var(--color-omega-muted)]">{isActive ? "في انتظار الإشارات..." : "فعّل التداول الآلي"}</td></tr>}
              {trades.slice(0, 20).map((t) => (
                <tr key={t.id} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                  <td className="px-3 py-2 font-mono whitespace-nowrap">{t.time}</td>
                  <td className="px-3 py-2 font-medium">{ASSET_CONFIG[t.asset]?.name || t.asset}</td>
                  <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.direction === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{t.direction === "buy" ? "شراء" : "بيع"}</span></td>
                  <td className="px-3 py-2 font-mono">{t.entryPrice > 100 ? t.entryPrice.toFixed(0) : t.entryPrice.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono">{t.currentPrice > 100 ? t.currentPrice.toFixed(0) : t.currentPrice.toFixed(4)}</td>
                  <td className="px-3 py-2 font-mono text-[10px]"><span className="text-red-400">{t.stopLoss > 100 ? t.stopLoss.toFixed(0) : t.stopLoss.toFixed(4)}</span>/<span className="text-emerald-400">{t.takeProfit > 100 ? t.takeProfit.toFixed(0) : t.takeProfit.toFixed(4)}</span></td>
                  <td className={`px-3 py-2 font-bold font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.pnl.toFixed(2)}</td>
                  <td className="px-3 py-2 text-[10px]">{t.expert}</td>
                  <td className="px-3 py-2 text-[10px] text-[var(--color-omega-muted)]">{t.strategy}</td>
                  <td className="px-3 py-2">
                    {t.status === "open" ? (
                      <button onClick={() => closeTrade(t.id)} className="px-2 py-0.5 rounded text-[10px] bg-red-900/30 text-red-400 hover:bg-red-900/50">🔒 إغلاق</button>
                    ) : (
                      <span className="text-[10px] text-gray-400">مغلقة</span>
                    )}
                  </td>
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
            <p key={i} className={`py-0.5 ${log.includes("ربح") ? "text-emerald-400" : log.includes("خسارة") ? "text-red-400" : log.includes("تفعيل") ? "text-emerald-400 font-bold" : log.includes("إيقاف") ? "text-red-400 font-bold" : log.includes("هدوء") ? "text-amber-400" : log.includes("إغلاق") ? "text-blue-400" : "text-[var(--color-omega-muted)]"}`}>{log}</p>
          ))}
          <div ref={logEndRef} />
        </div>
      )}

      {selectedTab === "stats" && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "إجمالي الصفقات", value: accountInfo.totalTrades },
            { label: "رابحة", value: trades.filter((t) => t.status === "closed" && t.pnl > 0).length },
            { label: "خاسرة", value: trades.filter((t) => t.status === "closed" && t.pnl <= 0).length },
            { label: "Win Rate", value: `${accountInfo.winRate}%` },
            { label: "متوسط الربح", value: `$${accountInfo.avgWin}` },
            { label: "متوسط الخسارة", value: `$${accountInfo.avgLoss}` },
            { label: "Profit Factor", value: accountInfo.profitFactor.toFixed(2) },
            { label: "أفضل صفقة", value: `$${accountInfo.bestTrade.toFixed(0)}` },
            { label: "أسوأ صفقة", value: `$${accountInfo.worstTrade.toFixed(0)}` },
            { label: "إجمالي P&L", value: `$${Math.round(accountInfo.totalPnL)}` },
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

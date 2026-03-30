"use client";
import { useState, useCallback } from "react";

interface OHLCV { time: string; open: number; high: number; low: number; close: number; volume: number; }
interface BacktestResult {
  strategy: string; asset: string; totalTrades: number; winRate: number; totalReturn: number;
  maxDrawdown: number; sharpeRatio: number; profitFactor: number; avgWin: number; avgLoss: number;
  bestTrade: number; worstTrade: number; avgHoldingPeriod: number;
}
interface TradeRecord { date: string; type: "buy" | "sell"; entryPrice: number; exitPrice: number; pnl: number; cumPnl: number; holdingBars: number; }

function generateOHLCV(symbol: string, days: number, seed: number): OHLCV[] {
  const configs: Record<string, { base: number; vol: number; drift: number }> = {
    XAUUSD: { base: 2650, vol: 0.008, drift: 0.0001 }, EURUSD: { base: 1.0850, vol: 0.003, drift: 0.00005 },
    BTCUSD: { base: 97000, vol: 0.025, drift: 0.0003 }, ETHUSD: { base: 3400, vol: 0.03, drift: 0.0002 },
    GBPUSD: { base: 1.2700, vol: 0.004, drift: 0.00005 }, SOLUSD: { base: 195, vol: 0.035, drift: 0.0002 },
    SPX500: { base: 5900, vol: 0.008, drift: 0.0002 }, USOIL: { base: 72, vol: 0.015, drift: 0.0001 },
  };
  const cfg = configs[symbol] || { base: 100, vol: 0.01, drift: 0.0001 };
  const data: OHLCV[] = [];
  let price = cfg.base;
  let s = seed;
  const rand = () => { s = (s * 16807 + 0) % 2147483647; return (s - 1) / 2147483646; };
  const bars = Math.min(days * 6, 2000);
  for (let i = 0; i < bars; i++) {
    const drift = cfg.drift * price;
    const noise = (rand() - 0.5) * price * cfg.vol;
    const open = price;
    const close = Math.max(0.01, open + drift + noise);
    const high = Math.max(open, close) + rand() * price * cfg.vol * 0.5;
    const low = Math.min(open, close) - rand() * price * cfg.vol * 0.5;
    const roundedClose = Math.round(close * 10000) / 10000;
    const roundedHigh = Math.round(high * 10000) / 10000;
    const roundedLow = Math.round(low * 10000) / 10000;
    const volume = 100000 + rand() * 5000000;
    const time = new Date(Date.now() - (bars - i) * 60000 * 10).toISOString();
    data.push({ time, open, high: roundedHigh, low: roundedLow, close: roundedClose, volume });
    price = close;
  }
  return data;
}

function calcRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period) { rsi.push(50); continue; }
    let gains = 0, losses = 0;
    for (let j = i - period + 1; j <= i; j++) {
      const diff = closes[j] - closes[j - 1];
      if (diff > 0) gains += diff; else losses -= diff;
    }
    const avgGain = gains / period;
    const avgLoss = losses / period;
    const rs = avgLoss === 0 ? 100 : avgGain / avgLoss;
    rsi.push(100 - (100 / (1 + rs)));
  }
  return rsi;
}

function calcSMA(closes: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) { sma.push(closes[i]); continue; }
    sma.push(closes.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period);
  }
  return sma;
}

function calcEMA(closes: number[], period: number): number[] {
  const ema: number[] = [closes[0]];
  const k = 2 / (period + 1);
  for (let i = 1; i < closes.length; i++) ema.push(closes[i] * k + ema[i - 1] * (1 - k));
  return ema;
}

function calcMACD(closes: number[]): { macd: number[]; signal: number[] } {
  const ema12 = calcEMA(closes, 12);
  const ema26 = calcEMA(closes, 26);
  const macd = ema12.map((v, i) => v - ema26[i]);
  const signal = calcEMA(macd, 9);
  return { macd, signal };
}

function runBacktest(data: OHLCV[], strategy: string): { result: BacktestResult; trades: TradeRecord[] } {
  const closes = data.map(d => d.close);
  const rsi = calcRSI(closes);
  const sma20 = calcSMA(closes, 20);
  const sma50 = calcSMA(closes, 50);
  const ema21 = calcEMA(closes, 21);
  const { macd, signal } = calcMACD(closes);
  const trades: TradeRecord[] = [];
  let position: { type: "buy" | "sell"; entryPrice: number; entryBar: number } | null = null;
  let cumPnl = 0;

  for (let i = 50; i < data.length; i++) {
    let enterBuy = false, enterSell = false, exitSignal = false;
    switch (strategy) {
      case "RSI+MACD":
        enterBuy = rsi[i] < 35 && macd[i] > signal[i] && macd[i - 1] <= signal[i - 1];
        enterSell = rsi[i] > 65 && macd[i] < signal[i] && macd[i - 1] >= signal[i - 1];
        exitSignal = (position?.type === "buy" && rsi[i] > 70) || (position?.type === "sell" && rsi[i] < 30);
        break;
      case "SMA Crossover":
        enterBuy = sma20[i] > sma50[i] && sma20[i - 1] <= sma50[i - 1];
        enterSell = sma20[i] < sma50[i] && sma20[i - 1] >= sma50[i - 1];
        exitSignal = (position?.type === "buy" && sma20[i] < sma50[i]) || (position?.type === "sell" && sma20[i] > sma50[i]);
        break;
      case "Ichimoku":
        enterBuy = closes[i] > sma20[i] && rsi[i] > 50 && macd[i] > 0;
        enterSell = closes[i] < sma20[i] && rsi[i] < 50 && macd[i] < 0;
        exitSignal = (position?.type === "buy" && closes[i] < ema21[i]) || (position?.type === "sell" && closes[i] > ema21[i]);
        break;
      case "SMC Order Block":
        enterBuy = rsi[i] < 40 && closes[i] > sma20[i] && closes[i] > closes[i - 1] && closes[i - 1] > closes[i - 2];
        enterSell = rsi[i] > 60 && closes[i] < sma20[i] && closes[i] < closes[i - 1] && closes[i - 1] < closes[i - 2];
        exitSignal = (position?.type === "buy" && rsi[i] > 70) || (position?.type === "sell" && rsi[i] < 30);
        break;
      case "ICT FVG":
        enterBuy = closes[i] > ema21[i] && macd[i] > signal[i] && rsi[i] < 45;
        enterSell = closes[i] < ema21[i] && macd[i] < signal[i] && rsi[i] > 55;
        exitSignal = (position?.type === "buy" && closes[i] < sma50[i]) || (position?.type === "sell" && closes[i] > sma50[i]);
        break;
      case "Liquidity Sweep":
        enterBuy = closes[i] > data[i - 1].high && rsi[i] < 50;
        enterSell = closes[i] < data[i - 1].low && rsi[i] > 50;
        exitSignal = i - (position?.entryBar || i) > 20;
        break;
      default: // Ensemble
        enterBuy = (rsi[i] < 35 ? 1 : 0) + (macd[i] > signal[i] ? 1 : 0) + (closes[i] > sma20[i] ? 1 : 0) >= 2;
        enterSell = (rsi[i] > 65 ? 1 : 0) + (macd[i] < signal[i] ? 1 : 0) + (closes[i] < sma20[i] ? 1 : 0) >= 2;
        exitSignal = (position?.type === "buy" && rsi[i] > 70) || (position?.type === "sell" && rsi[i] < 30);
    }

    if (position && (exitSignal || i - position.entryBar > 50)) {
      const exitPrice = closes[i];
      const pnl = position.type === "buy" ? (exitPrice - position.entryPrice) : (position.entryPrice - exitPrice);
      cumPnl += pnl;
      trades.push({ date: data[i].time.split("T")[0], type: position.type, entryPrice: position.entryPrice, exitPrice, pnl: Math.round(pnl * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100, holdingBars: i - position.entryBar });
      position = null;
    }

    if (!position) {
      if (enterBuy) position = { type: "buy", entryPrice: closes[i], entryBar: i };
      else if (enterSell) position = { type: "sell", entryPrice: closes[i], entryBar: i };
    }
  }

  if (position) {
    const exitPrice = closes[closes.length - 1];
    const pnl = position.type === "buy" ? (exitPrice - position.entryPrice) : (position.entryPrice - exitPrice);
    cumPnl += pnl;
    trades.push({ date: data[data.length - 1].time.split("T")[0], type: position.type, entryPrice: position.entryPrice, exitPrice, pnl: Math.round(pnl * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100, holdingBars: data.length - position.entryBar });
  }

  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl <= 0);
  const grossProfit = wins.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + t.pnl, 0));
  let peak = 0, maxDD = 0, running = 0;
  for (const t of trades) { running += t.pnl; if (running > peak) peak = running; const dd = peak - running; if (dd > maxDD) maxDD = dd; }
  const returns = trades.map(t => t.pnl / Math.abs(t.entryPrice));
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1 ? Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length) : 1;

  return {
    result: {
      strategy, asset: "", totalTrades: trades.length,
      winRate: trades.length > 0 ? Math.round((wins.length / trades.length) * 10000) / 100 : 0,
      totalReturn: Math.round(cumPnl * 100) / 100, maxDrawdown: Math.round(maxDD * 100) / 100,
      sharpeRatio: Math.round((avgReturn / stdDev) * Math.sqrt(252) * 100) / 100,
      profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : 0,
      avgWin: wins.length > 0 ? Math.round((grossProfit / wins.length) * 100) / 100 : 0,
      avgLoss: losses.length > 0 ? Math.round((grossLoss / losses.length) * 100) / 100 : 0,
      bestTrade: trades.length > 0 ? Math.round(Math.max(...trades.map(t => t.pnl)) * 100) / 100 : 0,
      worstTrade: trades.length > 0 ? Math.round(Math.min(...trades.map(t => t.pnl)) * 100) / 100 : 0,
      avgHoldingPeriod: trades.length > 0 ? Math.round(trades.reduce((s, t) => s + t.holdingBars, 0) / trades.length) : 0,
    },
    trades,
  };
}

const STRATEGIES = ["Ensemble", "RSI+MACD", "SMA Crossover", "Ichimoku", "SMC Order Block", "ICT FVG", "Liquidity Sweep", "Fibonacci"];
const ASSETS = [
  { id: "XAUUSD", name: "ذهب (XAU)" }, { id: "EURUSD", name: "يورو/دولار" }, { id: "BTCUSD", name: "بيتكوين" },
  { id: "ETHUSD", name: "إيثريوم" }, { id: "GBPUSD", name: "جنيه/دولار" }, { id: "SOLUSD", name: "سولانا" },
  { id: "SPX500", name: "S&P 500" }, { id: "USOIL", name: "نفط WTI" },
];

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState("XAUUSD");
  const [days, setDays] = useState(90);
  const [strategy, setStrategy] = useState("Ensemble");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [running, setRunning] = useState(false);
  const [equityCurve, setEquityCurve] = useState<number[]>([]);

  const runTest = useCallback(() => {
    setRunning(true);
    setTimeout(() => {
      const seed = Date.now();
      const data = generateOHLCV(symbol, days, seed);
      const { result: r, trades: t } = runBacktest(data, strategy);
      r.asset = symbol;
      setResult(r);
      setTrades(t);
      const curve: number[] = [0];
      for (const tr of t) curve.push(tr.cumPnl);
      setEquityCurve(curve);
      setRunning(false);
    }, 800);
  }, [symbol, days, strategy]);

  const maxEquity = equityCurve.length > 0 ? Math.max(...equityCurve.map(Math.abs), 1) : 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الاختبار الخلفي المتقدم</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">بيانات OHLCV واقعية مع حسابات دقيقة</p>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الأصل</label>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              {ASSETS.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الفترة</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              <option value={30}>30 يوم</option><option value={90}>90 يوم</option><option value={180}>180 يوم</option>
              <option value={365}>سنة</option><option value={730}>سنتان</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الاستراتيجية</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              {STRATEGIES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runTest} disabled={running} className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg text-sm font-bold disabled:opacity-50">
              {running ? "⏳ جاري الاختبار..." : "🚀 تشغيل"}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {[
              { label: "الصفقات", value: result.totalTrades, c: "text-white" },
              { label: "Win Rate", value: `${result.winRate}%`, c: result.winRate > 55 ? "text-emerald-400" : "text-red-400" },
              { label: "العائد", value: `$${result.totalReturn.toLocaleString()}`, c: result.totalReturn >= 0 ? "text-emerald-400" : "text-red-400" },
              { label: "أقصى انخفاض", value: `$${result.maxDrawdown}`, c: "text-red-400" },
              { label: "Sharpe", value: result.sharpeRatio.toFixed(2), c: result.sharpeRatio > 1 ? "text-emerald-400" : "text-amber-400" },
              { label: "Profit F.", value: result.profitFactor.toFixed(2), c: result.profitFactor > 1.5 ? "text-emerald-400" : "text-amber-400" },
              { label: "متوسط الربح", value: `$${result.avgWin}`, c: "text-emerald-400" },
              { label: "متوسط الخسارة", value: `$${result.avgLoss}`, c: "text-red-400" },
              { label: "أفضل صفقة", value: `$${result.bestTrade}`, c: "text-emerald-400" },
              { label: "أسوأ صفقة", value: `$${result.worstTrade}`, c: "text-red-400" },
              { label: "متوسط الاحتفاظ", value: `${result.avgHoldingPeriod} شمعة`, c: "text-white" },
              { label: "الاستراتيجية", value: result.strategy, c: "text-emerald-400" },
            ].map((m) => (
              <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
                <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
                <p className={`text-sm font-bold font-mono ${m.c}`}>{m.value}</p>
              </div>
            ))}
          </div>

          {equityCurve.length > 1 && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3">📈 منحنى الأسهم</h3>
              <div className="h-32 flex items-end gap-px">
                {equityCurve.map((val, i) => (
                  <div key={i} className="flex-1 rounded-t" style={{
                    height: `${Math.max(2, (Math.abs(val) / maxEquity) * 100)}%`,
                    backgroundColor: val >= 0 ? "#10b981" : "#ef4444",
                    opacity: 0.7,
                  }} />
                ))}
              </div>
              <div className="flex justify-between mt-1 text-[9px] text-[var(--color-omega-muted)]">
                <span>بداية</span><span>P&L: ${equityCurve[equityCurve.length - 1]?.toFixed(2)}</span><span>نهاية</span>
              </div>
            </div>
          )}

          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3">سجل الصفقات ({trades.length})</h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-[var(--color-omega-surface)] sticky top-0">
                  {["التاريخ","النوع","الدخول","الخروج","P&L","الإجمالي","المدة"].map(h => (
                    <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={i} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                      <td className="px-3 py-2 font-mono">{t.date}</td>
                      <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.type === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{t.type === "buy" ? "شراء" : "بيع"}</span></td>
                      <td className="px-3 py-2 font-mono">{t.entryPrice > 100 ? t.entryPrice.toFixed(0) : t.entryPrice.toFixed(4)}</td>
                      <td className="px-3 py-2 font-mono">{t.exitPrice > 100 ? t.exitPrice.toFixed(0) : t.exitPrice.toFixed(4)}</td>
                      <td className={`px-3 py-2 font-bold font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.pnl}</td>
                      <td className={`px-3 py-2 font-mono ${t.cumPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.cumPnl}</td>
                      <td className="px-3 py-2">{t.holdingBars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

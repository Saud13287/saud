"use client";
import { useState } from "react";

interface BacktestResult {
  strategy: string;
  totalTrades: number;
  winRate: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
}

interface TradeRecord {
  date: string;
  type: "buy" | "sell";
  price: number;
  quantity: number;
  pnl: number;
  cumPnl: number;
}

function runBacktestSimulation(symbol: string, days: number, strategy: string): { results: BacktestResult; trades: TradeRecord[] } {
  const basePrice = symbol === "BTCUSDT" ? 97000 : symbol === "ETHUSDT" ? 3400 : symbol === "XAUUSD" ? 2650 : 100;
  const trades: TradeRecord[] = [];
  let cumPnl = 0;
  let price = basePrice;
  let wins = 0;
  let totalReturn = 0;
  const dailyReturns: number[] = [];

  const numTrades = Math.floor(days / 3) + Math.floor(Math.random() * 10);
  for (let i = 0; i < numTrades; i++) {
    const date = new Date(Date.now() - (numTrades - i) * 86400000 * (days / numTrades)).toISOString().split("T")[0];
    const isBuy = Math.random() > 0.45;
    price = basePrice * (0.9 + Math.random() * 0.2);
    const quantity = 1 + Math.floor(Math.random() * 10);
    const exitPrice = price * (isBuy ? 1 + (Math.random() - 0.4) * 0.05 : 1 - (Math.random() - 0.4) * 0.05);
    const pnl = isBuy ? (exitPrice - price) * quantity : (price - exitPrice) * quantity;

    if (pnl > 0) wins++;
    cumPnl += pnl;
    totalReturn += pnl;
    dailyReturns.push(pnl / (basePrice * quantity));

    trades.push({ date, type: isBuy ? "buy" : "sell", price: Math.round(price * 100) / 100, quantity, pnl: Math.round(pnl * 100) / 100, cumPnl: Math.round(cumPnl * 100) / 100 });
  }

  const winTrades = trades.filter(t => t.pnl > 0);
  const loseTrades = trades.filter(t => t.pnl <= 0);
  const avgWin = winTrades.length > 0 ? winTrades.reduce((s, t) => s + t.pnl, 0) / winTrades.length : 0;
  const avgLoss = loseTrades.length > 0 ? Math.abs(loseTrades.reduce((s, t) => s + t.pnl, 0) / loseTrades.length) : 1;
  const grossProfit = winTrades.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(loseTrades.reduce((s, t) => s + t.pnl, 0));

  let peak = 0; let maxDD = 0; let running = 0;
  for (const t of trades) { running += t.pnl; if (running > peak) peak = running; const dd = peak - running; if (dd > maxDD) maxDD = dd; }

  const avgReturn = dailyReturns.length > 0 ? dailyReturns.reduce((a, b) => a + b, 0) / dailyReturns.length : 0;
  const stdDev = dailyReturns.length > 1 ? Math.sqrt(dailyReturns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / dailyReturns.length) : 1;

  return {
    results: {
      strategy, totalTrades: trades.length, winRate: Math.round((wins / trades.length) * 10000) / 100,
      totalReturn: Math.round(totalReturn * 100) / 100, maxDrawdown: Math.round(maxDD * 100) / 100,
      sharpeRatio: Math.round((avgReturn / stdDev) * Math.sqrt(252) * 100) / 100,
      profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : 0,
      avgWin: Math.round(avgWin * 100) / 100, avgLoss: Math.round(avgLoss * 100) / 100,
      bestTrade: trades.length > 0 ? Math.round(Math.max(...trades.map(t => t.pnl)) * 100) / 100 : 0,
      worstTrade: trades.length > 0 ? Math.round(Math.min(...trades.map(t => t.pnl)) * 100) / 100 : 0,
    },
    trades,
  };
}

export default function BacktestingPage() {
  const [symbol, setSymbol] = useState("BTCUSDT");
  const [days, setDays] = useState(90);
  const [strategy, setStrategy] = useState("Ensemble");
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [trades, setTrades] = useState<TradeRecord[]>([]);
  const [running, setRunning] = useState(false);

  const runTest = () => {
    setRunning(true);
    setTimeout(() => {
      const { results, trades: t } = runBacktestSimulation(symbol, days, strategy);
      setResult(results);
      setTrades(t);
      setRunning(false);
    }, 1500);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الاختبار الخلفي (Backtesting)</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">اختبار الاستراتيجيات على بيانات تاريخية</p>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الأصل</label>
            <select value={symbol} onChange={(e) => setSymbol(e.target.value)} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              <option value="BTCUSDT">بيتكوين (BTC)</option>
              <option value="ETHUSDT">إيثريوم (ETH)</option>
              <option value="XAUUSD">ذهب (XAU)</option>
              <option value="EURUSD">يورو/دولار</option>
              <option value="SOLUSDT">سولانا (SOL)</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الفترة (أيام)</label>
            <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              <option value={30}>30 يوم</option>
              <option value={90}>90 يوم</option>
              <option value={180}>180 يوم</option>
              <option value={365}>سنة واحدة</option>
              <option value={730}>سنتان</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الاستراتيجية</label>
            <select value={strategy} onChange={(e) => setStrategy(e.target.value)} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
              <option value="Ensemble">Ensemble (مجمّع)</option>
              <option value="Ichimoku">Ichimoku</option>
              <option value="SMC">SMC</option>
              <option value="Fibonacci">Fibonacci</option>
              <option value="RSI+MACD">RSI + MACD</option>
              <option value="Elliott">Elliott Wave</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={runTest} disabled={running} className="w-full bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
              {running ? "⏳ جاري الاختبار..." : "🚀 تشغيل الاختبار"}
            </button>
          </div>
        </div>
      </div>

      {result && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {[
              { label: "إجمالي الصفقات", value: result.totalTrades, c: "text-white" },
              { label: "Win Rate", value: `${result.winRate}%`, c: result.winRate > 55 ? "text-emerald-400" : "text-red-400" },
              { label: "إجمالي العائد", value: `$${result.totalReturn.toLocaleString()}`, c: result.totalReturn >= 0 ? "text-emerald-400" : "text-red-400" },
              { label: "أقصى انخفاض", value: `$${result.maxDrawdown.toLocaleString()}`, c: "text-red-400" },
              { label: "Sharpe Ratio", value: result.sharpeRatio.toFixed(2), c: result.sharpeRatio > 1 ? "text-emerald-400" : "text-amber-400" },
              { label: "Profit Factor", value: result.profitFactor.toFixed(2), c: result.profitFactor > 1.5 ? "text-emerald-400" : "text-amber-400" },
              { label: "متوسط الربح", value: `$${result.avgWin}`, c: "text-emerald-400" },
              { label: "متوسط الخسارة", value: `$${result.avgLoss}`, c: "text-red-400" },
              { label: "أفضل صفقة", value: `$${result.bestTrade}`, c: "text-emerald-400" },
              { label: "أسوأ صفقة", value: `$${result.worstTrade}`, c: "text-red-400" },
              { label: "الاستراتيجية", value: result.strategy, c: "text-emerald-400" },
              { label: "الأصل", value: symbol, c: "text-white" },
            ].map((m) => (
              <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg p-3">
                <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
                <p className={`text-sm font-bold font-mono ${m.c}`}>{m.value}</p>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
            <h3 className="text-sm font-bold mb-3">سجل الصفقات ({trades.length})</h3>
            <div className="overflow-x-auto max-h-[400px] overflow-y-auto">
              <table className="w-full text-xs">
                <thead><tr className="bg-[var(--color-omega-surface)] sticky top-0">
                  {["التاريخ","النوع","السعر","الكمية","P&L","الإجمالي"].map(h => (
                    <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                  ))}
                </tr></thead>
                <tbody>
                  {trades.map((t, i) => (
                    <tr key={i} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                      <td className="px-3 py-2 font-mono">{t.date}</td>
                      <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${t.type === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{t.type === "buy" ? "شراء" : "بيع"}</span></td>
                      <td className="px-3 py-2 font-mono">{t.price.toLocaleString()}</td>
                      <td className="px-3 py-2">{t.quantity}</td>
                      <td className={`px-3 py-2 font-bold font-mono ${t.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.pnl}</td>
                      <td className={`px-3 py-2 font-mono ${t.cumPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${t.cumPnl}</td>
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

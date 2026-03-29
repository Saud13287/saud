"use client";
import { useState, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import LineChart from "@/components/charts/LineChart";
import { CURRENCIES, formatCurrency, convertCurrency, getCurrencyByCode } from "@/lib/utils/currency";

function generateEquityCurve(balance: number): { label: string; value: number }[] {
  const data = [];
  let equity = balance;
  for (let i = 0; i < 30; i++) {
    equity += (Math.sin(i * 0.7) * equity * 0.008) + (equity * 0.001);
    data.push({ label: `${i + 1}`, value: Math.round(equity) });
  }
  return data;
}

export default function PortfolioPage() {
  const { settings, updateSettings } = useSettings();
  const [selectedCurrency, setSelectedCurrency] = useState("USD");
  const [equityCurve, setEquityCurve] = useState(() => generateEquityCurve(settings.accountBalance));

  const regenerate = useCallback(() => {
    setEquityCurve(generateEquityCurve(settings.accountBalance));
  }, [settings.accountBalance]);

  const currency = getCurrencyByCode(selectedCurrency);

  const positions = [
    { asset: "XAUUSD", type: "ذهب", direction: "buy" as const, size: 50, entry: 2648.5, current: 2655.2, pnl: 335, pnlPct: 1.27 },
    { asset: "EURUSD", type: "يورو", direction: "sell" as const, size: 100, entry: 1.0862, current: 1.0845, pnl: 170, pnlPct: 0.16 },
    { asset: "BTCUSD", type: "بيتكوين", direction: "buy" as const, size: 5, entry: 96800, current: 97500, pnl: 3500, pnlPct: 0.72 },
    { asset: "SOLUSD", type: "سولانا", direction: "buy" as const, size: 30, entry: 192.5, current: 195.0, pnl: 75, pnlPct: 1.30 },
  ];

  const totalPnL = positions.reduce((s, p) => s + p.pnl, 0);
  const usedMargin = positions.reduce((s, p) => s + p.entry * p.size * 0.01, 0);
  const freeMargin = settings.accountBalance + totalPnL - usedMargin;
  const equity = settings.accountBalance + totalPnL;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">المحفظة</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">إدارة رأس المال والمراكز المفتوحة</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-omega-muted)]">العملة:</label>
            <select value={selectedCurrency} onChange={(e) => setSelectedCurrency(e.target.value)}
              className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1.5 text-xs">
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.symbol} {c.code} - {c.nameAr}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-xs text-[var(--color-omega-muted)]">الرصيد (USD):</label>
            <input type="number" value={settings.accountBalance}
              onChange={(e) => updateSettings({ accountBalance: Math.max(1000, Number(e.target.value)) })}
              className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-3 py-1.5 text-sm w-32 text-right font-mono focus:outline-none focus:border-emerald-500" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "الرصيد", value: formatCurrency(settings.accountBalance, selectedCurrency), icon: "💰", c: "text-white" },
          { label: "الحقوق", value: formatCurrency(equity, selectedCurrency), icon: "📊", c: "text-emerald-400" },
          { label: "الهامش المستخدم", value: formatCurrency(usedMargin, selectedCurrency), icon: "🔒", c: "text-amber-400" },
          { label: "الهامش الحر", value: formatCurrency(freeMargin, selectedCurrency), icon: "🔓", c: "text-blue-400" },
          { label: "إجمالي P&L", value: formatCurrency(totalPnL, selectedCurrency), icon: totalPnL >= 0 ? "📈" : "📉", c: totalPnL >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map((m) => (
          <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-xs text-[var(--color-omega-muted)]">{m.label}</p>
              <span className="text-sm">{m.icon}</span>
            </div>
            <p className={`text-lg font-bold font-mono ${m.c}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {selectedCurrency !== "USD" && (
        <div className="bg-blue-900/20 border border-blue-800/30 rounded-lg p-3 flex items-center gap-2">
          <span className="text-blue-400 text-sm">💱</span>
          <p className="text-xs text-blue-300">
            عرض بـ {currency.nameAr} ({currency.code}) | سعر الصرف: 1 USD = {currency.rate} {currency.code}
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">📈 منحنى الأموال (30 يوم)</h3>
            <button onClick={regenerate} className="text-[10px] bg-[var(--color-omega-surface)] px-2 py-1 rounded hover:bg-[var(--color-omega-card)] transition-colors">🔄 تحديث</button>
          </div>
          <LineChart data={equityCurve} height={220} color="#10b981" prefix={currency.symbol} />
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">📊 توزيع المخاطر</h3>
          <div className="space-y-3">
            {positions.map((pos) => (
              <div key={pos.asset} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`px-1.5 py-0.5 rounded text-[9px] ${pos.direction === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>
                    {pos.direction === "buy" ? "شراء" : "بيع"}
                  </span>
                  <div>
                    <p className="text-xs font-medium">{pos.type}</p>
                    <p className="text-[10px] text-[var(--color-omega-muted)]">{pos.size} وحدة @ {pos.entry > 100 ? pos.entry.toFixed(0) : pos.entry.toFixed(4)}</p>
                  </div>
                </div>
                <div className="text-left">
                  <p className={`text-xs font-bold font-mono ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                    {formatCurrency(pos.pnl, selectedCurrency)}
                  </p>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">{pos.pnlPct.toFixed(2)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">📋 المراكز المفتوحة</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead><tr className="bg-[var(--color-omega-surface)]">
              {["الأصل","الاتجاه","الكمية","الدخول","الحالي","P&L","نسبة المخاطرة"].map(h => (
                <th key={h} className="text-right px-3 py-2 font-medium">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {positions.map((pos) => {
                const riskPct = ((pos.entry * pos.size * 0.02) / settings.accountBalance * 100);
                return (
                  <tr key={pos.asset} className="border-t border-[var(--color-omega-border)]">
                    <td className="px-3 py-2 font-medium">{pos.type} ({pos.asset})</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${pos.direction === "buy" ? "bg-green-900/40 text-green-400" : "bg-red-900/40 text-red-400"}`}>{pos.direction === "buy" ? "شراء" : "بيع"}</span></td>
                    <td className="px-3 py-2">{pos.size}</td>
                    <td className="px-3 py-2 font-mono">{pos.entry > 100 ? pos.entry.toFixed(0) : pos.entry.toFixed(4)}</td>
                    <td className="px-3 py-2 font-mono">{pos.current > 100 ? pos.current.toFixed(0) : pos.current.toFixed(4)}</td>
                    <td className={`px-3 py-2 font-bold font-mono ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>{formatCurrency(pos.pnl, selectedCurrency)}</td>
                    <td className="px-3 py-2"><span className={`px-1.5 py-0.5 rounded text-[10px] ${riskPct > settings.riskLimit ? "bg-red-900/40 text-red-400" : "bg-emerald-900/40 text-emerald-400"}`}>{riskPct.toFixed(2)}%</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

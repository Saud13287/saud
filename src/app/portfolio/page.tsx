"use client";
import { useState, useCallback } from "react";
import { useSettings } from "@/hooks/useSettings";
import LineChart from "@/components/charts/LineChart";

function generateEquityCurve(balance: number): { label: string; value: number }[] {
  const data = [];
  let equity = balance;
  for (let i = 0; i < 30; i++) {
    equity += (Math.random() - 0.45) * equity * 0.012;
    data.push({ label: `${i + 1}`, value: Math.round(equity) });
  }
  return data;
}

export default function PortfolioPage() {
  const { settings, updateSettings } = useSettings();
  const [equityCurve, setEquityCurve] = useState(() => generateEquityCurve(settings.accountBalance));

  const regenerate = useCallback(() => {
    setEquityCurve(generateEquityCurve(settings.accountBalance));
  }, [settings.accountBalance]);

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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">المحفظة</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">إدارة رأس المال والمراكز المفتوحة</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--color-omega-muted)]">الرصيد:</label>
          <input
            type="number"
            value={settings.accountBalance}
            onChange={(e) => updateSettings({ accountBalance: Math.max(1000, Number(e.target.value)) })}
            className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-3 py-1.5 text-sm w-32 text-right font-mono focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[
          { label: "الرصيد", value: `$${settings.accountBalance.toLocaleString()}`, icon: "💰", c: "text-white" },
          { label: "الحقوق", value: `$${Math.round(equity).toLocaleString()}`, icon: "📊", c: "text-emerald-400" },
          { label: "الهامش المستخدم", value: `$${Math.round(usedMargin).toLocaleString()}`, icon: "🔒", c: "text-amber-400" },
          { label: "الهامش الحر", value: `$${Math.round(freeMargin).toLocaleString()}`, icon: "🔓", c: "text-blue-400" },
          { label: "إجمالي P&L", value: `$${totalPnL.toLocaleString()}`, icon: totalPnL >= 0 ? "📈" : "📉", c: totalPnL >= 0 ? "text-emerald-400" : "text-red-400" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">📈 منحنى الأموال (30 يوم)</h3>
          <LineChart data={equityCurve} height={220} color="#10b981" prefix="$" />
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
                  <p className={`text-xs font-bold font-mono ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${pos.pnl}</p>
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
                    <td className={`px-3 py-2 font-bold font-mono ${pos.pnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${pos.pnl}</td>
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

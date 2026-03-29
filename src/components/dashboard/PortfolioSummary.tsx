"use client";
import { useState, useEffect } from "react";
import LineChart from "@/components/charts/LineChart";

export default function PortfolioSummary() {
  const [equityData] = useState(() => {
    const data = [];
    let equity = 100000;
    for (let i = 0; i < 30; i++) {
      equity += (Math.random() - 0.45) * equity * 0.015;
      data.push({
        label: `${i + 1}`,
        value: Math.round(equity),
      });
    }
    return data;
  });

  const metrics = [
    { label: "رأس المال الكلي", value: "$137,450", change: "+37.45%", positive: true, icon: "💎" },
    { label: "رأس المال المتاح", value: "$95,200", change: "69.3%", positive: true, icon: "💵" },
    { label: "الصفقات المفتوحة", value: "4/5", change: "", positive: true, icon: "📊" },
    { label: "ربح/خسارة يومي", value: "+$1,850", change: "+1.35%", positive: true, icon: "📈" },
    { label: "ربح/خسارة أسبوعي", value: "+$4,230", change: "+3.17%", positive: true, icon: "📅" },
    { label: "ربح/خسارة شهري", value: "+$12,500", change: "+10%", positive: true, icon: "📆" },
    { label: "إجمالي الربح/الخسارة", value: "+$37,450", change: "+37.45%", positive: true, icon: "🏆" },
    { label: "التعرض للمخاطر", value: "28%", change: "منخفض", positive: true, icon: "🛡️" },
  ];

  const riskMetrics = [
    { label: "Win Rate", value: "68.5%", benchmark: ">55%", status: "good" },
    { label: "Profit Factor", value: "2.34", benchmark: ">1.5", status: "excellent" },
    { label: "Sharpe Ratio", value: "1.85", benchmark: ">1.0", status: "good" },
    { label: "Max Drawdown", value: "-8.2%", benchmark: "<15%", status: "good" },
    { label: "Avg Win/Loss", value: "1.8:1", benchmark: ">1.5:1", status: "good" },
    { label: "Best Trade", value: "+$4,250", benchmark: "", status: "excellent" },
    { label: "Worst Trade", value: "-$1,800", benchmark: "", status: "good" },
    { label: "Consecutive Wins", value: "7", benchmark: "", status: "good" },
    { label: "Avg Hold Time", value: "4.2h", benchmark: "", status: "neutral" },
    { label: "Total Trades", value: "156", benchmark: "", status: "neutral" },
  ];

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
            <span className="text-xs text-[var(--color-omega-green)]">نشط</span>
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <p className="text-xs text-[var(--color-omega-muted)]">{m.label}</p>
                <span className="text-sm">{m.icon}</span>
              </div>
              <p className={`text-lg font-bold ${m.positive ? "text-[var(--color-omega-green)]" : "text-[var(--color-omega-gold)]"}`}>
                {m.value}
              </p>
              {m.change && (
                <p className={`text-xs ${m.positive ? "text-[var(--color-omega-green)]" : "text-[var(--color-omega-red)]"}`}>
                  {m.change}
                </p>
              )}
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
          <LineChart
            data={equityData}
            height={200}
            color="#10b981"
            showDots={false}
            prefix="$"
          />
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📊</span>
            مقاييس المخاطر والأداء
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {riskMetrics.map((m) => (
              <div key={m.label} className="bg-[var(--color-omega-surface)] p-2 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs text-[var(--color-omega-muted)]">{m.label}</p>
                  <p className={`text-sm font-bold ${
                    m.status === "excellent" ? "text-green-400" :
                    m.status === "good" ? "text-[var(--color-omega-green)]" :
                    "text-[var(--color-omega-text)]"
                  }`}>{m.value}</p>
                </div>
                {m.benchmark && (
                  <span className="text-xs text-[var(--color-omega-muted)]">{m.benchmark}</span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

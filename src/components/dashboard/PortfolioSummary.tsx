"use client";

const metrics = [
  { label: "رأس المال الكلي", value: "$125,000", change: "+2.3%", positive: true },
  { label: "رأس المال المتاح", value: "$87,500", change: "", positive: true },
  { label: "الصفقات المفتوحة", value: "7", change: "", positive: true },
  { label: "الربح/الخسارة اليومي", value: "+$1,250", change: "+1.0%", positive: true },
  { label: "إجمالي الربح/الخسارة", value: "+$12,500", change: "+10%", positive: true },
  { label: "التعرض للمخاطر", value: "35%", change: "", positive: false },
];

export default function PortfolioSummary() {
  return (
    <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <span>💰</span>
        ملخص المحفظة
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {metrics.map((m) => (
          <div
            key={m.label}
            className="bg-[var(--color-omega-surface)] p-3 rounded-lg"
          >
            <p className="text-xs text-[var(--color-omega-muted)] mb-1">
              {m.label}
            </p>
            <p
              className={`text-lg font-bold ${
                m.positive ? "text-[var(--color-omega-green)]" : "text-[var(--color-omega-gold)]"
              }`}
            >
              {m.value}
            </p>
            {m.change && (
              <p
                className={`text-xs ${
                  m.positive ? "text-[var(--color-omega-green)]" : "text-[var(--color-omega-red)]"
                }`}
              >
                {m.change}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

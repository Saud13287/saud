"use client";
import { useState, useEffect, useCallback } from "react";

interface PriceAlert {
  id: number;
  asset: string;
  targetPrice: number;
  condition: string;
  message: string;
  triggered: boolean;
  triggeredAt: string | null;
  createdAt: string;
}

const POPULAR_ASSETS = [
  { symbol: "XAUUSD", name: "الذهب", icon: "🥇" },
  { symbol: "EURUSD", name: "يورو/دولار", icon: "💱" },
  { symbol: "GBPUSD", name: "جنيه/دولار", icon: "💱" },
  { symbol: "BTCUSD", name: "بيتكوين", icon: "₿" },
  { symbol: "ETHUSD", name: "إيثريوم", icon: "Ξ" },
  { symbol: "SOLUSD", name: "سولانا", icon: "◎" },
  { symbol: "SPX500", name: "S&P 500", icon: "📈" },
  { symbol: "USOIL", name: "نفط خام", icon: "🛢️" },
];

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newAlert, setNewAlert] = useState({
    asset: "XAUUSD",
    targetPrice: 0,
    condition: "above" as "above" | "below",
    message: "",
  });

  const fetchAlerts = useCallback(async () => {
    try {
      const res = await fetch("/api/alerts");
      const data = await res.json();
      if (data.success) setAlerts(data.alerts);
    } catch {}
  }, []);

  useEffect(() => {
    const loadAlerts = async () => {
      try {
        const res = await fetch("/api/alerts");
        const data = await res.json();
        if (data.success) setAlerts(data.alerts);
      } catch {}
    };
    loadAlerts();
    const interval = setInterval(loadAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  const addAlert = async () => {
    if (!newAlert.targetPrice || newAlert.targetPrice <= 0) return;
    setLoading(true);
    try {
      await fetch("/api/alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newAlert),
      });
      setShowAdd(false);
      setNewAlert({ asset: "XAUUSD", targetPrice: 0, condition: "above", message: "" });
      fetchAlerts();
    } catch {}
    setLoading(false);
  };

  const deleteAlert = async (id: number) => {
    try {
      await fetch(`/api/alerts?id=${id}`, { method: "DELETE" });
      fetchAlerts();
    } catch {}
  };

  const triggeredCount = alerts.filter((a) => a.triggered).length;
  const activeCount = alerts.filter((a) => !a.triggered).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">التنبيهات السعرية</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">
            {activeCount} نشط | {triggeredCount} مُفعّل
          </p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + تنبيه جديد
        </button>
      </div>

      {showAdd && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold">إضافة تنبيه سعري</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الأصل</label>
              <select value={newAlert.asset} onChange={(e) => setNewAlert({ ...newAlert, asset: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                {POPULAR_ASSETS.map((a) => (
                  <option key={a.symbol} value={a.symbol}>{a.icon} {a.name} ({a.symbol})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الشرط</label>
              <select value={newAlert.condition} onChange={(e) => setNewAlert({ ...newAlert, condition: e.target.value as "above" | "below" })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                <option value="above">فوق (≥)</option>
                <option value="below">أقل من (≤)</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">السعر المستهدف</label>
              <input type="number" value={newAlert.targetPrice || ""} onChange={(e) => setNewAlert({ ...newAlert, targetPrice: parseFloat(e.target.value) })}
                placeholder="0.00" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">رسالة (اختياري)</label>
              <input type="text" value={newAlert.message} onChange={(e) => setNewAlert({ ...newAlert, message: e.target.value })}
                placeholder="تنبيه مخصص..." className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="rtl" />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={addAlert} disabled={loading} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
              {loading ? "جاري الإضافة..." : "حفظ التنبيه"}
            </button>
            <button onClick={() => setShowAdd(false)} className="bg-[var(--color-omega-surface)] px-4 py-2 rounded-lg text-xs transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      {alerts.length === 0 && !showAdd && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8 text-center">
          <p className="text-3xl mb-3">🔔</p>
          <p className="text-sm text-[var(--color-omega-muted)]">لا توجد تنبيهات سعرية</p>
          <p className="text-xs text-[var(--color-omega-muted)] mt-1">أضف تنبيه ليتم إشعارك عند وصول السعر للمستوى المحدد</p>
        </div>
      )}

      <div className="space-y-2">
        {alerts.map((alert) => (
          <div key={alert.id} className={`bg-[var(--color-omega-card)] border rounded-xl p-4 flex items-center justify-between ${
            alert.triggered ? "border-emerald-700/30 bg-emerald-900/10" : "border-[var(--color-omega-border)]"
          }`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg ${
                alert.triggered ? "bg-emerald-900/30" : "bg-amber-900/30"
              }`}>
                {alert.triggered ? "✅" : "🔔"}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold">{POPULAR_ASSETS.find((a) => a.symbol === alert.asset)?.name || alert.asset}</p>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    alert.triggered ? "bg-emerald-900/30 text-emerald-400" : "bg-amber-900/30 text-amber-400"
                  }`}>
                    {alert.triggered ? "مُفعّل" : "نشط"}
                  </span>
                </div>
                <p className="text-[10px] text-[var(--color-omega-muted)]">
                  {alert.condition === "above" ? "فوق" : "أقل من"} {alert.targetPrice.toLocaleString()}
                  {alert.message && ` - ${alert.message}`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <p className="text-xs font-mono">{alert.targetPrice.toLocaleString()}</p>
              <button onClick={() => deleteAlert(alert.id)} className="bg-red-900/30 hover:bg-red-900/50 px-2 py-1 rounded text-[10px] text-red-400 transition-colors">
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

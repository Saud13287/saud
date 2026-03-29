"use client";
import { useState, useCallback } from "react";
import { AVAILABLE_INDICATORS, AVAILABLE_CONDITIONS, AVAILABLE_TIMEFRAMES, PRESET_STRATEGIES, VisualStrategy, StrategyRule } from "@/lib/utils/strategies";

export default function StrategyBuilderPage() {
  const [strategies, setStrategies] = useState<VisualStrategy[]>(PRESET_STRATEGIES);
  const [editing, setEditing] = useState<VisualStrategy | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  const createNewStrategy = useCallback(() => {
    const newStrategy: VisualStrategy = {
      id: `strat-${Date.now()}`,
      name: "",
      nameAr: "",
      description: "",
      rules: [{ id: `r-${Date.now()}`, type: "indicator", indicator: "RSI", condition: "above", value: 70, period: 14, logic: "AND" }],
      action: "buy",
      timeframe: "1h",
      isActive: true,
    };
    setEditing(newStrategy);
    setShowBuilder(true);
  }, []);

  const addRule = useCallback(() => {
    if (!editing) return;
    const newRule: StrategyRule = {
      id: `r-${Date.now()}`,
      type: "indicator",
      indicator: "RSI",
      condition: "above",
      value: 70,
      period: 14,
      logic: "AND",
    };
    setEditing({ ...editing, rules: [...editing.rules, newRule] });
  }, [editing]);

  const removeRule = useCallback((ruleId: string) => {
    if (!editing || editing.rules.length <= 1) return;
    setEditing({ ...editing, rules: editing.rules.filter((r) => r.id !== ruleId) });
  }, [editing]);

  const updateRule = useCallback((ruleId: string, updates: Partial<StrategyRule>) => {
    if (!editing) return;
    setEditing({
      ...editing,
      rules: editing.rules.map((r) => (r.id === ruleId ? { ...r, ...updates } : r)),
    });
  }, [editing]);

  const saveStrategy = useCallback(() => {
    if (!editing || !editing.nameAr) return;
    setStrategies((prev) => {
      const exists = prev.find((s) => s.id === editing.id);
      if (exists) return prev.map((s) => (s.id === editing.id ? editing : s));
      return [...prev, editing];
    });
    setShowBuilder(false);
    setEditing(null);
  }, [editing]);

  const toggleStrategy = useCallback((id: string) => {
    setStrategies((prev) => prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s)));
  }, []);

  const deleteStrategy = useCallback((id: string) => {
    setStrategies((prev) => prev.filter((s) => s.id !== id));
  }, []);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">باني الاستراتيجيات</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">أنشئ استراتيجيات تداول مخصصة بدون كتابة كود</p>
        </div>
        <button onClick={createNewStrategy} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + استراتيجية جديدة
        </button>
      </div>

      {showBuilder && editing && (
        <div className="bg-[var(--color-omega-card)] border border-emerald-700/30 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold">باني الاستراتيجية البصري</h3>
            <span className="text-[10px] bg-emerald-900/30 text-emerald-400 px-2 py-1 rounded">Visual Builder</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اسم الاستراتيجية (عربي)</label>
              <input type="text" value={editing.nameAr} onChange={(e) => setEditing({ ...editing, nameAr: e.target.value })}
                placeholder="مثال: استراتيجية RSI متقدمة" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="rtl" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اسم الاستراتيجية (English)</label>
              <input type="text" value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                placeholder="Advanced RSI Strategy" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="ltr" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الإطار الزمني</label>
              <select value={editing.timeframe} onChange={(e) => setEditing({ ...editing, timeframe: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                {AVAILABLE_TIMEFRAMES.map((tf) => (
                  <option key={tf.id} value={tf.id}>{tf.nameAr}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الوصف</label>
            <input type="text" value={editing.description} onChange={(e) => setEditing({ ...editing, description: e.target.value })}
              placeholder="وصف الاستراتيجية..." className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="rtl" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold">الشروط ({editing.rules.length})</label>
              <button onClick={addRule} className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/50 transition-colors">
                + إضافة شرط
              </button>
            </div>
            <div className="space-y-2">
              {editing.rules.map((rule, idx) => (
                <div key={rule.id} className="bg-[var(--color-omega-surface)] rounded-lg p-3 flex items-center gap-2 flex-wrap">
                  {idx > 0 && (
                    <select value={rule.logic} onChange={(e) => updateRule(rule.id, { logic: e.target.value as "AND" | "OR" })}
                      className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-[10px] font-bold">
                      <option value="AND">AND</option>
                      <option value="OR">OR</option>
                    </select>
                  )}
                  <select value={rule.indicator} onChange={(e) => updateRule(rule.id, { indicator: e.target.value })}
                    className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-[10px] flex-1 min-w-[150px]">
                    {AVAILABLE_INDICATORS.map((ind) => (
                      <option key={ind.id} value={ind.id}>{ind.nameAr}</option>
                    ))}
                  </select>
                  <select value={rule.condition} onChange={(e) => updateRule(rule.id, { condition: e.target.value as StrategyRule["condition"] })}
                    className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-[10px]">
                    {AVAILABLE_CONDITIONS.map((cond) => (
                      <option key={cond.id} value={cond.id}>{cond.nameAr}</option>
                    ))}
                  </select>
                  <input type="number" value={rule.value as number} onChange={(e) => updateRule(rule.id, { value: parseFloat(e.target.value) })}
                    className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-[10px] w-20 font-mono" />
                  {editing.rules.length > 1 && (
                    <button onClick={() => removeRule(rule.id)} className="text-red-400 hover:text-red-300 text-xs">✕</button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-xs text-[var(--color-omega-muted)]">الإجراء:</label>
            {(["buy", "sell", "both"] as const).map((a) => (
              <button key={a} onClick={() => setEditing({ ...editing, action: a })}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-colors ${
                  editing.action === a
                    ? a === "buy" ? "bg-emerald-600 text-white" : a === "sell" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                    : "bg-[var(--color-omega-surface)] text-[var(--color-omega-muted)]"
                }`}>
                {a === "buy" ? "شراء" : a === "sell" ? "بيع" : "كلاهما"}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <button onClick={saveStrategy} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
              حفظ الاستراتيجية
            </button>
            <button onClick={() => { setShowBuilder(false); setEditing(null); }} className="bg-[var(--color-omega-surface)] px-4 py-2 rounded-lg text-xs transition-colors">
              إلغاء
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {strategies.map((strat) => (
          <div key={strat.id} className={`bg-[var(--color-omega-card)] border rounded-xl p-4 ${
            strat.isActive ? "border-[var(--color-omega-border)]" : "border-[var(--color-omega-border)] opacity-60"
          }`}>
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-bold">{strat.nameAr}</h3>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded ${
                    strat.action === "buy" ? "bg-emerald-900/30 text-emerald-400" : strat.action === "sell" ? "bg-red-900/30 text-red-400" : "bg-blue-900/30 text-blue-400"
                  }`}>
                    {strat.action === "buy" ? "شراء" : strat.action === "sell" ? "بيع" : "كلاهما"}
                  </span>
                </div>
                {strat.name && <p className="text-[10px] text-[var(--color-omega-muted)]">{strat.name}</p>}
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => toggleStrategy(strat.id)}
                  className={`w-8 h-4 rounded-full transition-colors ${strat.isActive ? "bg-emerald-500" : "bg-gray-600"}`}>
                  <div className={`w-3 h-3 rounded-full bg-white transition-transform ${strat.isActive ? "translate-x-4" : "translate-x-0.5"}`} />
                </button>
              </div>
            </div>
            <p className="text-[10px] text-[var(--color-omega-muted)] mb-2">{strat.description}</p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-1 rounded">{strat.timeframe}</span>
              <span className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-1 rounded">{strat.rules.length} شروط</span>
              {strat.rules.map((r) => (
                <span key={r.id} className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-1 rounded">
                  {r.indicator} {r.condition === "above" ? ">" : r.condition === "below" ? "<" : "="} {r.value}
                </span>
              ))}
            </div>
            <div className="flex gap-2 mt-3">
              <button onClick={() => { setEditing(strat); setShowBuilder(true); }}
                className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded hover:bg-blue-900/50 transition-colors">
                ✏️ تعديل
              </button>
              <button onClick={() => deleteStrategy(strat.id)}
                className="text-[10px] bg-red-900/30 text-red-400 px-2 py-1 rounded hover:bg-red-900/50 transition-colors">
                🗑️ حذف
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

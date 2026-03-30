"use client";
import { useState, useMemo } from "react";
import { agentRegistry } from "@/lib/agents/registry";

interface ExpertRanking {
  id: string; nameAr: string; nameEn: string; icon: string; category: string;
  accuracy: number; weight: number; totalSignals: number; correctSignals: number;
  totalPnl: number; avgConfidence: number; trend: "up" | "down" | "stable"; bestAsset: string;
}

interface CopySetting { expertId: string; enabled: boolean; riskMultiplier: number; maxTrades: number; }

function buildExpertRankings(): ExpertRanking[] {
  const cats: Record<string, string> = { ceo: "الإدارة", fundamental: "مالية", news: "أخبار", technical: "فني", risk: "مخاطر", system: "برمجي", decision: "قرارات", audit: "تدقيق" };
  const assets = ["XAUUSD", "EURUSD", "BTCUSD", "SPX500", "GBPUSD", "ETHUSD"];
  return agentRegistry.map((expert) => {
    const s = expert.id.charCodeAt(0) + expert.id.length;
    return {
      id: expert.id, nameAr: expert.nameAr, nameEn: expert.nameEn, icon: expert.icon,
      category: cats[expert.category] || expert.category, accuracy: expert.accuracy, weight: expert.weight,
      totalSignals: 50 + (s * 3) % 200, correctSignals: Math.round((50 + (s * 3) % 200) * expert.accuracy / 100),
      totalPnl: Math.round(((s % 100) / 100 - 0.2) * 50000), avgConfidence: 80 + (s % 18),
      trend: (s % 3 === 0 ? "up" : s % 3 === 1 ? "stable" : "down") as "up" | "down" | "stable",
      bestAsset: assets[s % assets.length],
    };
  }).sort((a, b) => b.accuracy - a.accuracy);
}

const expertRankings = buildExpertRankings();

export default function CopyTradingPage() {
  const [copySettings, setCopySettings] = useState<CopySetting[]>(() =>
    expertRankings.map((e) => ({ expertId: e.id, enabled: false, riskMultiplier: 1.0, maxTrades: 3 }))
  );
  const [autoCopy, setAutoCopy] = useState(false);
  const [globalRisk, setGlobalRisk] = useState(1.0);

  const toggleCopyExpert = (expertId: string) => {
    setCopySettings((prev) => prev.map((s) => s.expertId === expertId ? { ...s, enabled: !s.enabled } : s));
  };

  const updateCopySetting = (expertId: string, updates: Partial<CopySetting>) => {
    setCopySettings((prev) => prev.map((s) => s.expertId === expertId ? { ...s, ...updates } : s));
  };

  const enabledCount = copySettings.filter((s) => s.enabled).length;
  const topExperts = expertRankings.slice(0, 3);
  const enabledPnl = expertRankings.filter(e => copySettings.find(s => s.expertId === e.id)?.enabled).reduce((s, e) => s + e.totalPnl, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">نسخ التداول الذكي</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">{enabledCount} خبير مُفعّل | {expertRankings.length} متاح | P&L: ${enabledPnl.toLocaleString()}</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg">
            <label className="text-xs">نسخ تلقائي</label>
            <button onClick={() => setAutoCopy(!autoCopy)} className={`w-8 h-4 rounded-full ${autoCopy ? "bg-emerald-500" : "bg-gray-600"}`}>
              <div className={`w-3 h-3 rounded-full bg-white ${autoCopy ? "translate-x-4" : "translate-x-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg">
            <label className="text-xs">المخاطرة:</label>
            <select value={globalRisk} onChange={(e) => setGlobalRisk(parseFloat(e.target.value))} className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-xs">
              <option value={0.5}>0.5x</option><option value={1.0}>1x</option><option value={1.5}>1.5x</option><option value={2.0}>2x</option>
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {topExperts.map((expert, idx) => (
          <div key={expert.id} className={`bg-[var(--color-omega-card)] border rounded-xl p-4 ${idx === 0 ? "border-amber-600/40" : idx === 1 ? "border-gray-400/30" : "border-amber-800/30"}`}>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">{idx === 0 ? "🥇" : idx === 1 ? "🥈" : "🥉"}</span>
              <div>
                <p className="text-sm font-bold">{expert.icon} {expert.nameAr}</p>
                <p className="text-[10px] text-[var(--color-omega-muted)]">{expert.category}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-[var(--color-omega-surface)] rounded-lg p-2">
                <p className="text-[9px] text-[var(--color-omega-muted)]">الدقة</p>
                <p className="text-sm font-bold text-emerald-400">{expert.accuracy}%</p>
              </div>
              <div className="bg-[var(--color-omega-surface)] rounded-lg p-2">
                <p className="text-[9px] text-[var(--color-omega-muted)]">P&L</p>
                <p className={`text-sm font-bold ${expert.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${expert.totalPnl.toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-x-auto">
        <table className="w-full text-xs">
          <thead><tr className="bg-[var(--color-omega-surface)]">
            {["الخبير","التصنيف","الدقة","الوزن","الإشارات","P&L","الثقة","الأصل","الاتجاه","النسخ","مضاعف"].map(h => (
              <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {expertRankings.map((expert) => {
              const setting = copySettings.find((s) => s.expertId === expert.id);
              return (
                <tr key={expert.id} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                  <td className="px-3 py-2"><div className="flex items-center gap-1"><span>{expert.icon}</span><div><p className="font-medium text-[11px]">{expert.nameAr}</p></div></div></td>
                  <td className="px-3 py-2"><span className="text-[9px] bg-[var(--color-omega-surface)] px-1.5 py-0.5 rounded">{expert.category}</span></td>
                  <td className="px-3 py-2"><span className="font-bold text-emerald-400">{expert.accuracy}%</span></td>
                  <td className="px-3 py-2">{Math.round(expert.weight * 100)}%</td>
                  <td className="px-3 py-2">{expert.totalSignals}</td>
                  <td className={`px-3 py-2 font-bold font-mono ${expert.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${expert.totalPnl.toLocaleString()}</td>
                  <td className="px-3 py-2">{expert.avgConfidence}%</td>
                  <td className="px-3 py-2">{expert.bestAsset}</td>
                  <td className="px-3 py-2"><span className={`text-[9px] ${expert.trend === "up" ? "text-emerald-400" : expert.trend === "down" ? "text-red-400" : "text-amber-400"}`}>{expert.trend === "up" ? "▲" : expert.trend === "down" ? "▼" : "—"}</span></td>
                  <td className="px-3 py-2">
                    <button onClick={() => toggleCopyExpert(expert.id)} className={`px-2 py-1 rounded text-[10px] font-bold ${setting?.enabled ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-surface)] text-[var(--color-omega-muted)]"}`}>
                      {setting?.enabled ? "مُفعّل" : "تفعيل"}
                    </button>
                  </td>
                  <td className="px-3 py-2">
                    {setting?.enabled && (
                      <select value={setting.riskMultiplier} onChange={(e) => updateCopySetting(expert.id, { riskMultiplier: parseFloat(e.target.value) })} className="bg-[var(--color-omega-surface)] border rounded px-1 py-0.5 text-[9px] w-14">
                        <option value={0.5}>0.5x</option><option value={1}>1x</option><option value={1.5}>1.5x</option><option value={2}>2x</option>
                      </select>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

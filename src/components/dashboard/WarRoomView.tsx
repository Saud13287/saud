"use client";
import { useState } from "react";
import { WarRoomSession } from "@/lib/agents/types";
import { agentRegistry } from "@/lib/agents/registry";

interface ExecutedTrade {
  id: string;
  time: string;
  query: string;
  decision: string;
  asset: string;
  status: "open" | "closed";
  entryPrice: number;
  currentPrice: number;
  pnl: number;
}

const recLabels: Record<string, string> = { buy: "شراء", sell: "بيع", hold: "إبقاء", wait: "انتظار", cancel: "إلغاء" };
const recColors: Record<string, string> = {
  buy: "bg-green-900/50 text-green-400 border-green-700",
  sell: "bg-red-900/50 text-red-400 border-red-700",
  hold: "bg-blue-900/50 text-blue-400 border-blue-700",
  wait: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  cancel: "bg-red-900/50 text-red-400 border-red-700",
};

const QUICK_QUERIES = [
  "هل أشتري ذهب الآن؟", "تحليل بيتكوين", "هل أبيع يورو؟",
  "فرصة في سولانا", "تحليل نفط WTI", "هل السوق صاعد؟",
];

export default function WarRoomView() {
  const [session, setSession] = useState<WarRoomSession | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "gathering" | "analyzing" | "debating" | "decided">("idle");
  const [executedTrades, setExecutedTrades] = useState<ExecutedTrade[]>([]);

  const startConsultation = async (q?: string) => {
    const input = q || query;
    if (!input.trim()) return;
    setLoading(true);
    setPhase("gathering");
    setSession(null);
    setExpandedExpert(null);

    setTimeout(() => setPhase("analyzing"), 600);
    setTimeout(() => setPhase("debating"), 1500);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: input }),
      });
      const data = await res.json();
      setSession(data);
      setPhase("decided");
    } catch {
      setPhase("decided");
    }
    setLoading(false);
  };

  const executeTrade = () => {
    if (!session?.ceoDecision || session.ceoDecision.decision === "wait" || session.ceoDecision.decision === "cancel") return;
    const asset = session.asset || session.query.match(/[a-zA-Z]{3,}/)?.[0] || "XAUUSD";
    const price = 2650 + Math.random() * 20;
    const trade: ExecutedTrade = {
      id: `EX-${Date.now()}`,
      time: new Date().toLocaleTimeString("ar-SA"),
      query: session.query,
      decision: session.ceoDecision.decision,
      asset,
      status: "open",
      entryPrice: Math.round(price * 100) / 100,
      currentPrice: Math.round(price * 100) / 100,
      pnl: 0,
    };
    setExecutedTrades((prev) => [trade, ...prev]);
  };

  const closeTrade = (id: string) => {
    setExecutedTrades((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const change = (Math.random() - 0.45) * t.entryPrice * 0.01;
        const pnl = t.decision === "buy" ? change * 10 : -change * 10;
        return { ...t, status: "closed" as const, pnl: Math.round(pnl * 100) / 100, currentPrice: t.entryPrice + change };
      })
    );
  };

  const getVoteDistribution = () => {
    if (!session) return {};
    const dist: Record<string, number> = { buy: 0, sell: 0, hold: 0, wait: 0, cancel: 0 };
    for (const a of session.expertAnalyses) dist[a.recommendation] = (dist[a.recommendation] || 0) + 1;
    return dist;
  };

  return (
    <div className="space-y-4">
      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h2 className="text-lg font-bold mb-3 flex items-center gap-2"><span>⚔️</span> غرفة الحرب</h2>
        <div className="flex gap-3 mb-3">
          <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} onKeyDown={(e) => e.key === "Enter" && startConsultation()}
            placeholder="اسأل: 'هل أشتري ذهب الآن؟' أو 'تحليل بيتكوين'" className="flex-1 bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-emerald-500" dir="rtl" />
          <button onClick={() => startConsultation()} disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 px-5 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
            {loading ? "جاري..." : "🔍 تحليل"}
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          {QUICK_QUERIES.map((q) => (
            <button key={q} onClick={() => { setQuery(q); startConsultation(q); }}
              className="text-[10px] bg-[var(--color-omega-surface)] hover:bg-emerald-900/30 px-2 py-1 rounded transition-colors">
              {q}
            </button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
            <p className="text-sm font-medium">
              {phase === "gathering" ? "📡 جمع البيانات..." : phase === "analyzing" ? "🧠 التحليل..." : "⚔️ النقاش..."}
            </p>
            <div className="flex gap-2 flex-wrap justify-center">
              {agentRegistry.filter(a => a.category !== "ceo").map((e) => (
                <div key={e.id} className="flex items-center gap-1 bg-[var(--color-omega-surface)] px-2 py-1 rounded text-xs">
                  <span>{e.icon}</span>
                  <div className={`status-dot ${phase === "gathering" ? "status-analyzing" : "status-debating"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {session && !loading && (
        <>
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
            <h3 className="font-bold mb-3 flex items-center gap-2"><span>👑</span> قرار المدير العام</h3>
            <div className="bg-[var(--color-omega-surface)] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className={`px-4 py-1.5 rounded-lg text-sm font-bold border ${recColors[session.ceoDecision?.decision ?? "wait"]}`}>
                  {recLabels[session.ceoDecision?.decision ?? "wait"]}
                </span>
                <div className="text-left">
                  <p className="text-2xl font-bold text-emerald-400">{session.ceoDecision?.confidence}%</p>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">ثقة النظام</p>
                </div>
              </div>
              <div className="w-full bg-[var(--color-omega-border)] rounded-full h-2">
                <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${session.ceoDecision?.confidence}%` }} />
              </div>
              <p className="text-sm">{session.ceoDecision?.summary}</p>
              <p className="text-xs text-[var(--color-omega-muted)] whitespace-pre-line">{session.ceoDecision?.reasoning}</p>

              {session.ceoDecision?.risks && session.ceoDecision.risks.length > 0 && (
                <div className="bg-red-900/20 border border-red-800/30 rounded p-2">
                  <p className="text-[10px] font-semibold text-red-400 mb-1">⚠️ المخاطر:</p>
                  {session.ceoDecision.risks.map((r, i) => <p key={i} className="text-[10px] text-red-300/80">• {r}</p>)}
                </div>
              )}

              <div className="flex gap-2 pt-2 border-t border-[var(--color-omega-border)]">
                <button onClick={executeTrade} disabled={session.ceoDecision?.decision === "wait" || session.ceoDecision?.decision === "cancel"}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed">
                  ✅ تنفيذ الصفقة
                </button>
                <button onClick={() => { setSession(null); setPhase("idle"); }}
                  className="flex-1 bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] hover:border-emerald-600 py-2.5 rounded-lg text-sm transition-colors">
                  🔄 تحليل جديد
                </button>
              </div>
            </div>
          </div>

          {executedTrades.length > 0 && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
              <h3 className="font-bold mb-3 text-sm">📋 الصفقات المنفذة ({executedTrades.length})</h3>
              <div className="space-y-2">
                {executedTrades.map((t) => (
                  <div key={t.id} className="bg-[var(--color-omega-surface)] rounded-lg p-3 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium">{t.query}</p>
                      <p className="text-[10px] text-[var(--color-omega-muted)]">{t.time} | {t.decision === "buy" ? "شراء" : "بيع"} @ {t.entryPrice}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {t.status === "open" ? (
                        <>
                          <span className="text-[10px] text-blue-400 bg-blue-900/30 px-2 py-0.5 rounded">مفتوحة</span>
                          <button onClick={() => closeTrade(t.id)} className="text-[10px] bg-red-900/30 text-red-400 px-2 py-0.5 rounded hover:bg-red-900/50">إغلاق</button>
                        </>
                      ) : (
                        <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${t.pnl >= 0 ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                          {t.pnl >= 0 ? "+" : ""}{t.pnl}$
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {session.expertAnalyses.length > 0 && (() => {
            const dist = getVoteDistribution();
            return (
              <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
                <h3 className="font-bold mb-3 text-sm">🗳️ أصوات الخبراء</h3>
                <div className="grid grid-cols-5 gap-2 mb-4">
                  {Object.entries(dist).map(([rec, count]) => count > 0 && (
                    <div key={rec} className={`text-center p-2 rounded-lg border ${recColors[rec]}`}>
                      <p className="text-lg font-bold">{count}</p>
                      <p className="text-[10px]">{recLabels[rec]}</p>
                    </div>
                  ))}
                </div>
                <div className="space-y-2">
                  {session.expertAnalyses.map((a) => {
                    const expert = agentRegistry.find((e) => e.id === a.agentId);
                    const expanded = expandedExpert === a.agentId;
                    return (
                      <div key={a.agentId} className="bg-[var(--color-omega-surface)] rounded-lg overflow-hidden">
                        <button onClick={() => setExpandedExpert(expanded ? null : a.agentId)} className="w-full p-3 flex items-center justify-between hover:bg-[var(--color-omega-card)]">
                          <div className="flex items-center gap-2">
                            <span>{expert?.icon}</span>
                            <span className="text-xs font-medium">{expert?.nameAr}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] border ${recColors[a.recommendation]}`}>{recLabels[a.recommendation]}</span>
                            <span className="text-xs text-emerald-400">{a.confidence}%</span>
                            <span className="text-[10px] text-[var(--color-omega-muted)]">{expanded ? "▲" : "▼"}</span>
                          </div>
                        </button>
                        {expanded && (
                          <div className="px-3 pb-3 space-y-2 border-t border-[var(--color-omega-border)] pt-2">
                            <p className="text-xs text-[var(--color-omega-muted)]">{a.reasoning}</p>
                            {a.evidence?.map((e, i) => <p key={i} className="text-[10px] text-[var(--color-omega-muted)]">• {e}</p>)}
                            {a.vetoActive && <p className="text-xs text-red-400 font-bold">🚫 فيتو نشط</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })()}

          {session.auditReport && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
              <h3 className="font-bold mb-2 text-sm">🔍 التدقيق الداخلي</h3>
              <div className="bg-[var(--color-omega-surface)] rounded-lg p-3 space-y-2">
                {session.auditReport.contradictions.length > 0 && session.auditReport.contradictions.map((c, i) => <p key={i} className="text-xs text-yellow-400">⚠️ {c}</p>)}
                {session.auditReport.complianceViolations.length > 0 && session.auditReport.complianceViolations.map((v, i) => <p key={i} className="text-xs text-red-400">🚫 {v}</p>)}
                {session.auditReport.contradictions.length === 0 && session.auditReport.complianceViolations.length === 0 && <p className="text-xs text-emerald-400">✅ لا توجد مشاكل</p>}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { WarRoomSession } from "@/lib/agents/types";
import { agentRegistry } from "@/lib/agents/registry";

const recLabels: Record<string, string> = {
  buy: "شراء",
  sell: "بيع",
  hold: "إبقاء",
  wait: "انتظار",
  cancel: "إلغاء",
};

const recColors: Record<string, string> = {
  buy: "bg-green-900/50 text-green-400 border-green-700",
  sell: "bg-red-900/50 text-red-400 border-red-700",
  hold: "bg-blue-900/50 text-blue-400 border-blue-700",
  wait: "bg-yellow-900/50 text-yellow-400 border-yellow-700",
  cancel: "bg-red-900/50 text-red-400 border-red-700",
};

export default function WarRoomView() {
  const [session, setSession] = useState<WarRoomSession | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [expandedExpert, setExpandedExpert] = useState<string | null>(null);
  const [phase, setPhase] = useState<"idle" | "gathering" | "analyzing" | "decided">("idle");

  const startConsultation = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setPhase("gathering");
    setSession(null);

    setTimeout(() => setPhase("analyzing"), 800);

    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSession(data);
      setPhase("decided");
    } catch {
      setSession({
        id: `sim-${Date.now()}`,
        timestamp: new Date().toISOString(),
        query,
        status: "decided",
        expertAnalyses: [],
        ceoDecision: {
          decision: "wait",
          confidence: 75,
          summary: "قرار محاكاة - في انتظار بيانات حقيقية",
          reasoning: "النظام في وضع المحاكاة",
          risks: ["لا توجد بيانات حقيقية"],
          alternatives: ["الاتصال بمصادر البيانات"],
        },
      });
      setPhase("decided");
    }
    setLoading(false);
  };

  const getVoteDistribution = () => {
    if (!session) return {};
    const dist: Record<string, number> = { buy: 0, sell: 0, hold: 0, wait: 0, cancel: 0 };
    for (const a of session.expertAnalyses) {
      dist[a.recommendation] = (dist[a.recommendation] || 0) + 1;
    }
    return dist;
  };

  return (
    <div className="space-y-6">
      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <span>⚔️</span>
          غرفة الحرب - اجتماع مجلس الخبراء
        </h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && startConsultation()}
            placeholder="اسأل النظام: مثلاً 'هل أشتري ذهب الآن؟' أو 'تحليل أسهم Apple'"
            className="flex-1 bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-omega-accent)] transition-colors"
            dir="rtl"
          />
          <button
            onClick={startConsultation}
            disabled={loading}
            className="bg-[var(--color-omega-accent)] hover:bg-blue-700 px-6 py-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
          >
            {loading ? "جاري التحليل..." : "ابدأ الاستشارة"}
          </button>
        </div>
      </div>

      {loading && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin w-10 h-10 border-2 border-[var(--color-omega-accent)] border-t-transparent rounded-full" />
            <div className="text-center">
              <p className="text-sm font-medium">
                {phase === "gathering" ? "📡 جاري جمع البيانات من المصادر..." : "🧠 مجلس الخبراء يحلل البيانات..."}
              </p>
              <p className="text-xs text-[var(--color-omega-muted)] mt-1">
                {phase === "gathering"
                  ? "الأخبار، الأسعار، القوائم المالية"
                  : "تحليل فني، مالي، إدارة مخاطر، مشاعر السوق"}
              </p>
            </div>
            <div className="flex gap-2 flex-wrap justify-center">
              {agentRegistry.filter(a => a.category !== "ceo").map((expert) => (
                <div
                  key={expert.id}
                  className="flex items-center gap-1 bg-[var(--color-omega-surface)] px-2 py-1 rounded text-xs"
                >
                  <span>{expert.icon}</span>
                  <div className={`status-dot ${phase === "gathering" ? "status-analyzing" : "status-debating"}`} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {session && !loading && (
        <>
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <span>👑</span>
              قرار المدير العام - {session.query}
            </h3>
            <div className="bg-[var(--color-omega-surface)] rounded-lg p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className={`px-4 py-2 rounded-lg text-sm font-bold border ${recColors[session.ceoDecision?.decision ?? "wait"]}`}>
                    {recLabels[session.ceoDecision?.decision ?? "wait"]}
                  </span>
                  {session.ceoDecision?.decision === "cancel" && (
                    <span className="text-xs text-red-400 flex items-center gap-1">
                      ⚠️ فيتو نشط
                    </span>
                  )}
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-[var(--color-omega-gold)]">
                    {session.ceoDecision?.confidence}%
                  </p>
                  <p className="text-xs text-[var(--color-omega-muted)]">ثقة النظام</p>
                </div>
              </div>

              <div className="w-full bg-[var(--color-omega-border)] rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-500"
                  style={{
                    width: `${session.ceoDecision?.confidence}%`,
                    backgroundColor:
                      (session.ceoDecision?.confidence ?? 0) > 75
                        ? "var(--color-omega-green)"
                        : (session.ceoDecision?.confidence ?? 0) > 50
                        ? "var(--color-omega-gold)"
                        : "var(--color-omega-red)",
                  }}
                />
              </div>

              <p className="text-sm font-medium">{session.ceoDecision?.summary}</p>
              <p className="text-xs text-[var(--color-omega-muted)] whitespace-pre-line leading-relaxed">
                {session.ceoDecision?.reasoning}
              </p>

              {session.ceoDecision?.risks && session.ceoDecision.risks.length > 0 && (
                <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-3">
                  <p className="text-xs font-semibold text-red-400 mb-2">⚠️ المخاطر:</p>
                  <ul className="text-xs text-red-300/80 space-y-1">
                    {session.ceoDecision.risks.map((r, i) => (
                      <li key={i}>• {r}</li>
                    ))}
                  </ul>
                </div>
              )}

              {session.ceoDecision?.alternatives && session.ceoDecision.alternatives.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--color-omega-accent)] mb-2">البدائل:</p>
                  <ul className="text-xs text-[var(--color-omega-muted)] space-y-1">
                    {session.ceoDecision.alternatives.map((a, i) => (
                      <li key={i}>• {a}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex gap-3 pt-3 border-t border-[var(--color-omega-border)]">
                <button className="flex-1 bg-[var(--color-omega-green)] hover:bg-green-700 py-3 rounded-lg text-sm font-medium transition-colors">
                  ✅ تنفيذ الصفقة
                </button>
                <button className="flex-1 bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] hover:border-[var(--color-omega-accent)] py-3 rounded-lg text-sm font-medium transition-colors">
                  ❌ رفض
                </button>
                <button
                  onClick={() => { setSession(null); setPhase("idle"); }}
                  className="flex-1 bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] hover:border-yellow-600 py-3 rounded-lg text-sm font-medium transition-colors"
                >
                  🔄 إعادة التحليل
                </button>
              </div>
            </div>
          </div>

          {session.expertAnalyses.length > 0 && (() => {
            const dist = getVoteDistribution();
            return (
              <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
                <h3 className="font-bold mb-4 flex items-center gap-2">
                  <span>🗳️</span>
                  توزيع أصوات الخبراء
                </h3>
                <div className="grid grid-cols-5 gap-2 mb-6">
                  {Object.entries(dist).map(([rec, count]) => (
                    count > 0 && (
                      <div key={rec} className={`text-center p-3 rounded-lg border ${recColors[rec]}`}>
                        <p className="text-xl font-bold">{count}</p>
                        <p className="text-xs">{recLabels[rec]}</p>
                      </div>
                    )
                  ))}
                </div>

                <h4 className="font-bold mb-3">تحليلات الخبراء التفصيلية</h4>
                <div className="space-y-3">
                  {session.expertAnalyses.map((analysis) => {
                    const expert = agentRegistry.find((e) => e.id === analysis.agentId);
                    const isExpanded = expandedExpert === analysis.agentId;
                    return (
                      <div
                        key={analysis.agentId}
                        className="bg-[var(--color-omega-surface)] rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => setExpandedExpert(isExpanded ? null : analysis.agentId)}
                          className="w-full p-4 flex items-center justify-between hover:bg-[var(--color-omega-card)] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{expert?.icon}</span>
                            <div className="text-right">
                              <p className="text-sm font-medium">{expert?.nameAr}</p>
                              <p className="text-xs text-[var(--color-omega-muted)]">{expert?.nameEn}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-left">
                              <span className={`px-2 py-0.5 rounded text-xs border ${recColors[analysis.recommendation]}`}>
                                {recLabels[analysis.recommendation]}
                              </span>
                              <p className="text-xs text-[var(--color-omega-muted)] mt-1">
                                {analysis.confidence}%
                              </p>
                            </div>
                            <span className="text-[var(--color-omega-muted)] text-xs">
                              {isExpanded ? "▲" : "▼"}
                            </span>
                          </div>
                        </button>

                        {isExpanded && (
                          <div className="px-4 pb-4 space-y-3 border-t border-[var(--color-omega-border)] pt-3">
                            <div>
                              <p className="text-xs font-semibold text-[var(--color-omega-gold)] mb-1">التحليل:</p>
                              <p className="text-xs text-[var(--color-omega-muted)] leading-relaxed">
                                {analysis.reasoning}
                              </p>
                            </div>

                            {analysis.evidence && analysis.evidence.length > 0 && (
                              <div>
                                <p className="text-xs font-semibold text-[var(--color-omega-accent)] mb-1">الأدلة:</p>
                                <ul className="text-xs text-[var(--color-omega-muted)] space-y-1">
                                  {analysis.evidence.map((e, i) => (
                                    <li key={i} className="flex items-start gap-2">
                                      <span className="text-[var(--color-omega-accent)] mt-0.5">•</span>
                                      <span>{e}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}

                            {analysis.riskAssessment && (
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[var(--color-omega-muted)]">تقييم المخاطر:</span>
                                <span className={`text-xs px-2 py-0.5 rounded ${
                                  analysis.riskAssessment === "low" ? "bg-green-900/30 text-green-400" :
                                  analysis.riskAssessment === "medium" ? "bg-yellow-900/30 text-yellow-400" :
                                  analysis.riskAssessment === "extreme" ? "bg-red-900/50 text-red-300" :
                                  "bg-red-900/30 text-red-400"
                                }`}>
                                  {analysis.riskAssessment === "low" ? "منخفضة" :
                                   analysis.riskAssessment === "medium" ? "متوسطة" :
                                   analysis.riskAssessment === "extreme" ? "قصوى" : "عالية"}
                                </span>
                              </div>
                            )}

                            {analysis.vetoActive && (
                              <div className="bg-red-900/30 border border-red-700/50 rounded-lg p-2">
                                <p className="text-xs text-red-400 font-bold">🚫 فيتو نشط - تم رفض الصفقة</p>
                              </div>
                            )}
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
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
              <h3 className="font-bold mb-3 flex items-center gap-2">
                <span>🔍</span>
                تقرير التدقيق الداخلي
              </h3>
              <div className="bg-[var(--color-omega-surface)] rounded-lg p-4 space-y-3">
                {session.auditReport.contradictions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-yellow-400 mb-1">⚠️ تناقضات:</p>
                    <ul className="text-xs text-[var(--color-omega-muted)] space-y-1">
                      {session.auditReport.contradictions.map((c, i) => (
                        <li key={i}>• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.auditReport.complianceViolations.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-red-400 mb-1">🚫 انتهاكات:</p>
                    <ul className="text-xs text-[var(--color-omega-muted)] space-y-1">
                      {session.auditReport.complianceViolations.map((v, i) => (
                        <li key={i}>• {v}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.auditReport.anomalies.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-orange-400 mb-1">📊 انحرافات:</p>
                    <ul className="text-xs text-[var(--color-omega-muted)] space-y-1">
                      {session.auditReport.anomalies.map((a, i) => (
                        <li key={i}>• {a}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {session.auditReport.contradictions.length === 0 &&
                  session.auditReport.complianceViolations.length === 0 &&
                  session.auditReport.anomalies.length === 0 && (
                  <p className="text-xs text-[var(--color-omega-green)]">✅ لا توجد مشاكل في التدقيق</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

"use client";
import { useState } from "react";
import { WarRoomSession } from "@/lib/agents/types";
import { agentRegistry } from "@/lib/agents/registry";

export default function WarRoomView() {
  const [session, setSession] = useState<WarRoomSession | null>(null);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);

  const startConsultation = async () => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/agents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      setSession(data);
    } catch {
      // Fallback simulation
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
    }
    setLoading(false);
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
            placeholder="اسأل النظام: مثلاً 'هل أشتري ذهب الآن؟'"
            className="flex-1 bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-[var(--color-omega-accent)]"
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
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8 text-center">
          <div className="animate-spin w-10 h-10 border-2 border-[var(--color-omega-accent)] border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-sm text-[var(--color-omega-muted)]">
            مجلس الخبراء في اجتماع... يحلل {agentRegistry.length} خبير البيانات
          </p>
        </div>
      )}

      {session && !loading && (
        <>
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              <span>👑</span>
              قرار المدير العام
            </h3>
            <div className="bg-[var(--color-omega-surface)] rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-bold ${
                    session.ceoDecision?.decision === "buy"
                      ? "bg-green-900/50 text-green-400"
                      : session.ceoDecision?.decision === "sell"
                      ? "bg-red-900/50 text-red-400"
                      : session.ceoDecision?.decision === "cancel"
                      ? "bg-red-900/50 text-red-400"
                      : "bg-yellow-900/50 text-yellow-400"
                  }`}
                >
                  {session.ceoDecision?.decision === "buy"
                    ? "شراء"
                    : session.ceoDecision?.decision === "sell"
                    ? "بيع"
                    : session.ceoDecision?.decision === "cancel"
                    ? "ملغي"
                    : "انتظار"}
                </span>
                <span className="text-sm text-[var(--color-omega-muted)]">
                  ثقة النظام: {session.ceoDecision?.confidence}%
                </span>
              </div>
              <p className="text-sm">{session.ceoDecision?.summary}</p>
              <p className="text-xs text-[var(--color-omega-muted)] whitespace-pre-line">
                {session.ceoDecision?.reasoning}
              </p>
              {session.ceoDecision?.risks && session.ceoDecision.risks.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-[var(--color-omega-red)] mb-1">
                    المخاطر:
                  </p>
                  <ul className="text-xs text-[var(--color-omega-muted)] list-disc list-inside">
                    {session.ceoDecision.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}
              <div className="flex gap-2 pt-2">
                <button className="bg-[var(--color-omega-green)] hover:bg-green-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                  تنفيذ
                </button>
                <button className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] hover:border-[var(--color-omega-accent)] px-4 py-2 rounded-lg text-xs font-medium transition-colors">
                  رفض
                </button>
              </div>
            </div>
          </div>

          {session.expertAnalyses.length > 0 && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
              <h3 className="font-bold mb-3">تحليلات الخبراء</h3>
              <div className="space-y-3">
                {session.expertAnalyses.map((analysis) => {
                  const expert = agentRegistry.find(
                    (e) => e.id === analysis.agentId
                  );
                  return (
                    <div
                      key={analysis.agentId}
                      className="bg-[var(--color-omega-surface)] rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span>{expert?.icon}</span>
                          <span className="text-sm font-medium">
                            {expert?.nameAr}
                          </span>
                        </div>
                        <span
                          className={`px-2 py-0.5 rounded text-xs ${
                            analysis.recommendation === "buy"
                              ? "bg-green-900/50 text-green-400"
                              : analysis.recommendation === "sell"
                              ? "bg-red-900/50 text-red-400"
                              : "bg-yellow-900/50 text-yellow-400"
                          }`}
                        >
                          {analysis.recommendation === "buy"
                            ? "شراء"
                            : analysis.recommendation === "sell"
                            ? "بيع"
                            : "انتظار"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--color-omega-muted)]">
                        {analysis.reasoning}
                      </p>
                      <p className="text-xs text-[var(--color-omega-muted)] mt-1">
                        الثقة: {analysis.confidence}%
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

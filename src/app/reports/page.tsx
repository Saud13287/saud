"use client";
import { useMemo } from "react";
import { agentRegistry } from "@/lib/agents/registry";

interface ReportData {
  expertId: string;
  expertName: string;
  accuracy: number;
  weight: number;
  assistantCount: number;
  avgAssistantAccuracy: number;
  status: string;
}

export default function ReportsPage() {
  const reports = useMemo<ReportData[]>(() =>
    agentRegistry.map((expert) => ({
      expertId: expert.id,
      expertName: expert.nameAr,
      accuracy: expert.accuracy,
      weight: expert.weight,
      assistantCount: expert.assistants.length,
      avgAssistantAccuracy:
        expert.assistants.reduce((s, a) => s + a.accuracy, 0) /
        expert.assistants.length,
      status: expert.status,
    })), []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">التقارير</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          تقارير أداء جميع الخبراء والمساعدين
        </p>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-[var(--color-omega-surface)] text-sm">
              <th className="text-right px-4 py-3 font-medium">الخبير</th>
              <th className="text-right px-4 py-3 font-medium">الدقة</th>
              <th className="text-right px-4 py-3 font-medium">الوزن</th>
              <th className="text-right px-4 py-3 font-medium">المساعدين</th>
              <th className="text-right px-4 py-3 font-medium">دقة المساعدين</th>
              <th className="text-right px-4 py-3 font-medium">الحالة</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr
                key={r.expertId}
                className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)] transition-colors"
              >
                <td className="px-4 py-3 text-sm font-medium">
                  {r.expertName}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-[var(--color-omega-border)] rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${r.accuracy}%`,
                          backgroundColor:
                            r.accuracy > 80
                              ? "var(--color-omega-green)"
                              : r.accuracy > 60
                              ? "var(--color-omega-gold)"
                              : "var(--color-omega-red)",
                        }}
                      />
                    </div>
                    <span className="text-sm">{Math.round(r.accuracy)}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm">
                  {Math.round(r.weight * 100)}%
                </td>
                <td className="px-4 py-3 text-sm">{r.assistantCount}</td>
                <td className="px-4 py-3 text-sm">
                  {Math.round(r.avgAssistantAccuracy)}%
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <div className={`status-dot status-${r.status}`} />
                    <span className="text-xs">{r.status}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>📈</span>
            توزيع الأوزان
          </h3>
          <div className="space-y-2">
            {reports.map((r) => (
              <div key={r.expertId} className="flex items-center gap-3">
                <span className="text-xs w-32 truncate">{r.expertName}</span>
                <div className="flex-1 h-3 bg-[var(--color-omega-surface)] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-omega-accent)]"
                    style={{ width: `${r.weight * 100}%` }}
                  />
                </div>
                <span className="text-xs w-10 text-left">
                  {Math.round(r.weight * 100)}%
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
            <span>🎯</span>
            أفضل الدقة
          </h3>
          <div className="space-y-2">
            {[...reports]
              .sort((a, b) => b.accuracy - a.accuracy)
              .map((r, i) => (
                <div
                  key={r.expertId}
                  className="flex items-center justify-between bg-[var(--color-omega-surface)] px-3 py-2 rounded-lg"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--color-omega-gold)] font-bold">
                      #{i + 1}
                    </span>
                    <span className="text-sm">{r.expertName}</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-omega-green)]">
                    {Math.round(r.accuracy)}%
                  </span>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}

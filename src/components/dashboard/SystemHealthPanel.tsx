"use client";
import { agentRegistry } from "@/lib/agents/registry";

export default function SystemHealthPanel() {
  const experts = agentRegistry;
  const expertCount = experts.length;
  const totalAssistants = experts.reduce((s, e) => s + e.assistants.length, 0);
  const avgAccuracy =
    experts.reduce((s, e) => s + e.accuracy, 0) / experts.length;

  return (
    <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
      <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
        <span>⚙️</span>
        حالة النظام
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
          <p className="text-xs text-[var(--color-omega-muted)]">إجمالي الخبراء</p>
          <p className="text-xl font-bold text-[var(--color-omega-accent)]">
            {expertCount + totalAssistants}
          </p>
          <p className="text-xs text-[var(--color-omega-muted)]">
            {expertCount} رئيسي + {totalAssistants} مساعد
          </p>
        </div>
        <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
          <p className="text-xs text-[var(--color-omega-muted)]">متوسط الدقة</p>
          <p className="text-xl font-bold text-[var(--color-omega-green)]">
            {Math.round(avgAccuracy)}%
          </p>
        </div>
        <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
          <p className="text-xs text-[var(--color-omega-muted)]">مزود البيانات</p>
          <p className="text-xl font-bold text-[var(--color-omega-green)]">متصل</p>
        </div>
        <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
          <p className="text-xs text-[var(--color-omega-muted)]">آخر تحديث</p>
          <p className="text-sm font-bold text-[var(--color-omega-text)]">
            {new Date().toLocaleTimeString("ar-SA")}
          </p>
        </div>
      </div>
    </div>
  );
}

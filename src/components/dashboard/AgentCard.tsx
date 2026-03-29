"use client";
import { ExpertAgent } from "@/lib/agents/types";

interface Props {
  agent: ExpertAgent;
  onClick?: () => void;
}

const statusLabels: Record<string, string> = {
  idle: "في الانتظار",
  analyzing: "يحلل",
  debating: "يناقش",
  completed: "مكتمل",
  error: "خطأ",
  vetoed: "فيتو",
};

export default function AgentCard({ agent, onClick }: Props) {
  return (
    <div
      onClick={onClick}
      className="card-hover bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 cursor-pointer"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
            style={{ backgroundColor: `${agent.color}20` }}
          >
            {agent.icon}
          </div>
          <div>
            <h3 className="font-semibold text-sm">{agent.nameAr}</h3>
            <p className="text-xs text-[var(--color-omega-muted)]">
              {agent.nameEn}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <div className={`status-dot status-${agent.status}`} />
          <span className="text-xs text-[var(--color-omega-muted)]">
            {statusLabels[agent.status]}
          </span>
        </div>
      </div>

      <p className="text-xs text-[var(--color-omega-muted)] mb-3 leading-relaxed">
        {agent.role}
      </p>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-[var(--color-omega-muted)]">الدقة:</span>
          <div className="flex items-center gap-1">
            <div className="w-16 h-1.5 bg-[var(--color-omega-border)] rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${agent.accuracy}%`,
                  backgroundColor:
                    agent.accuracy > 80
                      ? "var(--color-omega-green)"
                      : agent.accuracy > 60
                      ? "var(--color-omega-gold)"
                      : "var(--color-omega-red)",
                }}
              />
            </div>
            <span>{Math.round(agent.accuracy)}%</span>
          </div>
        </div>
        <span className="text-[var(--color-omega-muted)]">
          {agent.assistants.length} مساعد
        </span>
      </div>
    </div>
  );
}

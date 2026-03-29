"use client";
import { useState } from "react";
import { ExpertAgent } from "@/lib/agents/types";
import AgentCard from "./AgentCard";

interface Props {
  experts: ExpertAgent[];
}

export default function ExpertBoard({ experts }: Props) {
  const [selectedExpert, setSelectedExpert] = useState<ExpertAgent | null>(null);

  return (
    <div>
      <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
        <span>🏛️</span>
        مجلس الخبراء
        <span className="text-xs text-[var(--color-omega-muted)] font-normal">
          ({experts.length} خبير رئيسي)
        </span>
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {experts.map((expert) => (
          <AgentCard
            key={expert.id}
            agent={expert}
            onClick={() => setSelectedExpert(expert)}
          />
        ))}
      </div>

      {selectedExpert && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6 border-b border-[var(--color-omega-border)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${selectedExpert.color}20` }}
                >
                  {selectedExpert.icon}
                </div>
                <div>
                  <h3 className="text-lg font-bold">{selectedExpert.nameAr}</h3>
                  <p className="text-sm text-[var(--color-omega-muted)]">
                    {selectedExpert.nameEn}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedExpert(null)}
                className="text-[var(--color-omega-muted)] hover:text-white text-xl"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <h4 className="text-sm font-semibold mb-1 text-[var(--color-omega-gold)]">
                  الوصف
                </h4>
                <p className="text-sm text-[var(--color-omega-muted)]">
                  {selectedExpert.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="bg-[var(--color-omega-card)] p-3 rounded-lg text-center">
                  <p className="text-xs text-[var(--color-omega-muted)]">الدقة</p>
                  <p className="text-lg font-bold text-[var(--color-omega-green)]">
                    {Math.round(selectedExpert.accuracy)}%
                  </p>
                </div>
                <div className="bg-[var(--color-omega-card)] p-3 rounded-lg text-center">
                  <p className="text-xs text-[var(--color-omega-muted)]">الوزن</p>
                  <p className="text-lg font-bold text-[var(--color-omega-accent)]">
                    {Math.round(selectedExpert.weight * 100)}%
                  </p>
                </div>
                <div className="bg-[var(--color-omega-card)] p-3 rounded-lg text-center">
                  <p className="text-xs text-[var(--color-omega-muted)]">المساعدين</p>
                  <p className="text-lg font-bold text-[var(--color-omega-purple)]">
                    {selectedExpert.assistants.length}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold mb-2 text-[var(--color-omega-gold)]">
                  الخبراء المساعدين
                </h4>
                <div className="space-y-2">
                  {selectedExpert.assistants.map((assistant) => (
                    <div
                      key={assistant.id}
                      className="bg-[var(--color-omega-card)] p-3 rounded-lg flex items-center justify-between"
                    >
                      <div>
                        <p className="text-sm font-medium">
                          {assistant.nameAr}
                        </p>
                        <p className="text-xs text-[var(--color-omega-muted)]">
                          {assistant.role}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className={`status-dot status-${assistant.status}`} />
                        <span className="text-xs">
                          {Math.round(assistant.accuracy)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

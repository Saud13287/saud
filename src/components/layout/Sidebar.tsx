"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { totalAgents } from "@/lib/agents/registry";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: "📊", desc: "نظرة عامة" },
  { href: "/war-room", label: "غرفة الحرب", icon: "⚔️", desc: "الاستشارات" },
  { href: "/reports", label: "التقارير", icon: "📋", desc: "الأداء" },
  { href: "/settings", label: "الإعدادات", icon: "⚙️", desc: "التخصيص" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-[var(--color-omega-surface)] border-l border-[var(--color-omega-border)] flex flex-col h-screen sticky top-0">
      <div className="p-5 border-b border-[var(--color-omega-border)]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center">
            <span className="text-lg font-bold text-white">Ω</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-[var(--color-omega-gold)]">OmegaFin</h1>
            <p className="text-[10px] text-[var(--color-omega-muted)]">الذكاء المالي المستقل v3.0</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3">
        <p className="text-[10px] text-[var(--color-omega-muted)] uppercase tracking-wider mb-2 px-3">القائمة الرئيسية</p>
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                    isActive
                      ? "bg-[var(--color-omega-accent)]/15 border border-[var(--color-omega-accent)]/30 text-[var(--color-omega-accent)]"
                      : "text-[var(--color-omega-text)] hover:bg-[var(--color-omega-card)]"
                  }`}
                >
                  <span className="text-lg w-6 text-center">{item.icon}</span>
                  <div>
                    <span className="text-sm font-medium block">{item.label}</span>
                    <span className="text-[10px] text-[var(--color-omega-muted)]">{item.desc}</span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-6">
          <p className="text-[10px] text-[var(--color-omega-muted)] uppercase tracking-wider mb-2 px-3">إحصائيات سريعة</p>
          <div className="space-y-2 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">الخبراء</span>
              <span className="text-xs font-bold text-[var(--color-omega-accent)]">{totalAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">الجلسات اليوم</span>
              <span className="text-xs font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">دقة النظام</span>
              <span className="text-xs font-bold text-[var(--color-omega-green)]">92.4%</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--color-omega-border)]">
        <div className="bg-[var(--color-omega-card)] rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="status-dot status-completed" />
            <span className="text-xs font-medium">النظام يعمل بكفاءة</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--color-omega-muted)]">
            <span>التحديث: الآن</span>
            <span>v3.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

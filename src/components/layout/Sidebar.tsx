"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { totalAgents } from "@/lib/agents/registry";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: "📊", desc: "الرئيسية" },
  { href: "/market", label: "السوق", icon: "📈", desc: "التداول" },
  { href: "/portfolio", label: "المحفظة", icon: "💰", desc: "رأس المال" },
  { href: "/auto-trading", label: "التداول الآلي", icon: "🤖", desc: "التشغيل" },
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-900/30">
            <span className="text-lg font-bold text-white">S</span>
          </div>
          <div>
            <h1 className="text-base font-bold text-emerald-400">سعود</h1>
            <p className="text-[10px] text-[var(--color-omega-muted)]">Saud Financial Intelligence</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 overflow-y-auto">
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
                      ? "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400"
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
          <p className="text-[10px] text-[var(--color-omega-muted)] uppercase tracking-wider mb-2 px-3">إحصائيات</p>
          <div className="space-y-2 px-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">الخبراء</span>
              <span className="text-xs font-bold text-emerald-400">{totalAgents}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">الجلسات اليوم</span>
              <span className="text-xs font-bold">12</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">دقة النظام</span>
              <span className="text-xs font-bold text-emerald-400">94.2%</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-[var(--color-omega-muted)]">Win Rate</span>
              <span className="text-xs font-bold text-emerald-400">68.5%</span>
            </div>
          </div>
        </div>
      </nav>

      <div className="p-4 border-t border-[var(--color-omega-border)]">
        <div className="bg-[var(--color-omega-card)] rounded-lg p-3 space-y-2">
          <div className="flex items-center gap-2">
            <div className="status-dot status-completed" />
            <span className="text-xs font-medium">النظام يعمل</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-[var(--color-omega-muted)]">
            <span>v4.0 | سعود</span>
            <span>السوق: نشط</span>
          </div>
        </div>
      </div>
    </aside>
  );
}

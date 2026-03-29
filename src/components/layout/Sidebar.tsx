import Link from "next/link";

const navItems = [
  { href: "/", label: "لوحة التحكم", icon: "📊" },
  { href: "/war-room", label: "غرفة الحرب", icon: "⚔️" },
  { href: "/reports", label: "التقارير", icon: "📋" },
  { href: "/settings", label: "الإعدادات", icon: "⚙️" },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-[var(--color-omega-surface)] border-l border-[var(--color-omega-border)] flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-[var(--color-omega-border)]">
        <h1 className="text-xl font-bold text-[var(--color-omega-gold)]">
          Ω OmegaFin
        </h1>
        <p className="text-xs text-[var(--color-omega-muted)] mt-1">
          نظام أوميغا للذكاء المالي المستقل
        </p>
      </div>
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-[var(--color-omega-text)] hover:bg-[var(--color-omega-card)] transition-colors"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm">{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-[var(--color-omega-border)]">
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="status-dot status-completed" />
          <span className="text-xs text-[var(--color-omega-muted)]">النظام يعمل</span>
        </div>
      </div>
    </aside>
  );
}

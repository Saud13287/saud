"use client";
import { useState, useEffect } from "react";

export default function Header() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[var(--color-omega-surface)] border-b border-[var(--color-omega-border)] px-6 py-4 flex items-center justify-between">
      <div>
        <h2 className="text-lg font-semibold">مرحباً بك في نظام أوميغا</h2>
        <p className="text-xs text-[var(--color-omega-muted)]">
          {time.toLocaleDateString("ar-SA", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-left">
          <p className="text-2xl font-mono text-[var(--color-omega-gold)]">
            {time.toLocaleTimeString("ar-SA")}
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-4 py-2 rounded-lg">
          <div className="status-dot status-completed" />
          <span className="text-sm">48 خبير نشط</span>
        </div>
      </div>
    </header>
  );
}

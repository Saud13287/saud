"use client";
import { useState, useEffect } from "react";
import TickerTape from "@/components/tradingview/TickerTape";

export default function Header() {
  const [time, setTime] = useState("");
  const [date, setDate] = useState("");

  useEffect(() => {
    const update = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString("ar-SA"));
      setDate(now.toLocaleDateString("ar-SA", {
        weekday: "long", year: "numeric", month: "long", day: "numeric",
      }));
    };
    update();
    const timer = setInterval(update, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-[var(--color-omega-surface)] border-b border-[var(--color-omega-border)]">
      <div className="px-4 py-3 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold">مرحباً بك في نظام سعود</h2>
          <p className="text-[10px] text-[var(--color-omega-muted)]">
            {date || "..."}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-left">
            <p className="text-lg font-mono text-emerald-400">
              {time || "--:--:--"}
            </p>
          </div>
          <div className="flex items-center gap-2 bg-[var(--color-omega-card)] px-3 py-1.5 rounded-lg">
            <div className="status-dot status-completed" />
            <span className="text-xs">59 خبير نشط</span>
          </div>
          <div className="flex items-center gap-2 bg-emerald-900/30 px-3 py-1.5 rounded-lg border border-emerald-800/30">
            <span className="text-xs text-emerald-400 font-bold">94.2%</span>
            <span className="text-[10px] text-emerald-500">دقة</span>
          </div>
        </div>
      </div>
      <div className="border-t border-[var(--color-omega-border)] overflow-hidden">
        <TickerTape />
      </div>
    </header>
  );
}

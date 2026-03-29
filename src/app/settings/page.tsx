"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [riskLimit, setRiskLimit] = useState(2);
  const [maxDailyTrades, setMaxDailyTrades] = useState(10);
  const [dailyKillSwitch, setDailyKillSwitch] = useState(5);
  const [weeklyKillSwitch, setWeeklyKillSwitch] = useState(10);
  const [autoExecute, setAutoExecute] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);
  const [trailingStop, setTrailingStop] = useState(true);
  const [minRR, setMinRR] = useState(1.5);
  const [maxOpenPositions, setMaxOpenPositions] = useState(5);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([
    "Ichimoku", "Fibonacci", "SMC", "VWAP", "Elliott Wave", "MACD", "RSI", "Bollinger",
  ]);
  const [tradingHours, setTradingHours] = useState("all");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [language, setLanguage] = useState("ar");
  const [brokerType, setBrokerType] = useState("demo");
  const [maxSlippage, setMaxSlippage] = useState(0.1);

  const allStrategies = [
    "Ichimoku", "Fibonacci", "SMC", "VWAP", "Elliott Wave",
    "MACD", "RSI", "Bollinger Bands", "Stochastic", "ATR",
    "Market Profile", "Volume Profile", "Pattern Recognition",
    "Multi-Timeframe", "Ensemble Voting",
  ];

  const toggleStrategy = (s: string) => {
    setSelectedStrategies((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">الإعدادات المتقدمة</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          تخصيص شامل لسلوك النظام وحدود المخاطرة والاستراتيجيات
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>🛡️</span>
            حدود المخاطرة والحماية
          </h3>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">المخاطرة لكل صفقة</label>
              <span className="text-sm font-bold text-[var(--color-omega-gold)]">{riskLimit}%</span>
            </div>
            <input type="range" min="0.5" max="10" step="0.5" value={riskLimit} onChange={(e) => setRiskLimit(Number(e.target.value))} className="w-full accent-amber-500" />
            <p className="text-xs text-[var(--color-omega-muted)] mt-1">الموصى: 1-2% للمحترفين، 0.5% للمبتدئين</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">أدنى نسبة مخاطرة/عائد (R/R)</label>
              <span className="text-sm font-bold text-[var(--color-omega-accent)]">{minRR}</span>
            </div>
            <input type="range" min="1" max="5" step="0.1" value={minRR} onChange={(e) => setMinRR(Number(e.target.value))} className="w-full accent-blue-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">الحد الأقصى للصفقات اليومية</label>
              <span className="text-sm font-bold">{maxDailyTrades}</span>
            </div>
            <input type="range" min="1" max="50" value={maxDailyTrades} onChange={(e) => setMaxDailyTrades(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">أقصى صفقات مفتوحة</label>
              <span className="text-sm font-bold">{maxOpenPositions}</span>
            </div>
            <input type="range" min="1" max="20" value={maxOpenPositions} onChange={(e) => setMaxOpenPositions(Number(e.target.value))} className="w-full" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">إيقاف طارئ - خسارة يومية قصوى</label>
              <span className="text-sm font-bold text-red-400">{dailyKillSwitch}%</span>
            </div>
            <input type="range" min="1" max="20" value={dailyKillSwitch} onChange={(e) => setDailyKillSwitch(Number(e.target.value))} className="w-full accent-red-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">إيقاف طارئ - خسارة أسبوعية قصوى</label>
              <span className="text-sm font-bold text-red-400">{weeklyKillSwitch}%</span>
            </div>
            <input type="range" min="2" max="30" value={weeklyKillSwitch} onChange={(e) => setWeeklyKillSwitch(Number(e.target.value))} className="w-full accent-red-500" />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-[var(--color-omega-muted)]">أقصى انزلاق (Slippage)</label>
              <span className="text-sm font-bold">{maxSlippage}%</span>
            </div>
            <input type="range" min="0.01" max="1" step="0.01" value={maxSlippage} onChange={(e) => setMaxSlippage(Number(e.target.value))} className="w-full" />
          </div>
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>⚙️</span>
            إعدادات النظام والتنفيذ
          </h3>

          {[
            { label: "التنفيذ الآلي", desc: "تنفيذ الصفقات تلقائياً", value: autoExecute, set: setAutoExecute, color: "green" },
            { label: "وضع الشبح", desc: "تداول تجريبي مخفي", value: ghostMode, set: setGhostMode, color: "purple" },
            { label: "وقف الخسارة المتحرك", desc: "تعديل وقف الخسارة تلقائياً", value: trailingStop, set: setTrailingStop, color: "blue" },
            { label: "الإشعارات", desc: "تنبيهات عند إشارات جديدة", value: notificationsEnabled, set: setNotificationsEnabled, color: "amber" },
            { label: "الوضع الداكن", desc: "مظهر النظام", value: darkMode, set: setDarkMode, color: "slate" },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{item.label}</p>
                <p className="text-xs text-[var(--color-omega-muted)]">{item.desc}</p>
              </div>
              <button
                onClick={() => item.set(!item.value)}
                className={`w-12 h-6 rounded-full transition-colors ${
                  item.value ? `bg-${item.color}-600` : "bg-[var(--color-omega-border)]"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full transition-transform ${item.value ? "translate-x-0.5" : "translate-x-6"}`} />
              </button>
            </div>
          ))}

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">ساعات التداول</label>
            <select
              value={tradingHours}
              onChange={(e) => setTradingHours(e.target.value)}
              className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-sm"
            >
              <option value="all">24 ساعة</option>
              <option value="london">جلسة لندن فقط</option>
              <option value="newyork">جلسة نيويورك فقط</option>
              <option value="overlap">ساعة التداخل (لندن + نيويورك)</option>
              <option value="asia">جلسة آسيا فقط</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">نوع الحساب</label>
            <select
              value={brokerType}
              onChange={(e) => setBrokerType(e.target.value)}
              className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-sm"
            >
              <option value="demo">حساب تجريبي (Demo)</option>
              <option value="live">حساب حقيقي (Live)</option>
              <option value="paper">تداول ورقي (Paper)</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">اللغة</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-sm"
            >
              <option value="ar">العربية</option>
              <option value="en">English</option>
            </select>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
        <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
          <span>📈</span>
          الاستراتيجيات النشطة ({selectedStrategies.length}/{allStrategies.length})
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
          {allStrategies.map((s) => (
            <button
              key={s}
              onClick={() => toggleStrategy(s)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                selectedStrategies.includes(s)
                  ? "bg-[var(--color-omega-accent)] border-[var(--color-omega-accent)] text-white"
                  : "bg-[var(--color-omega-surface)] border-[var(--color-omega-border)] text-[var(--color-omega-muted)] hover:border-[var(--color-omega-accent)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          ملخص الإعدادات
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {[
            { label: "المخاطرة/صفقة", value: `${riskLimit}%`, color: "gold" },
            { label: "R/R أدنى", value: `${minRR}`, color: "accent" },
            { label: "صفقات يومية", value: `${maxDailyTrades}`, color: "text" },
            { label: "إيقاف يومي", value: `${dailyKillSwitch}%`, color: "red" },
            { label: "تنفيذ آلي", value: autoExecute ? "نعم" : "لا", color: "green" },
            { label: "شبح", value: ghostMode ? "نعم" : "لا", color: "purple" },
            { label: "استراتيجيات", value: `${selectedStrategies.length}`, color: "accent" },
          ].map((m) => (
            <div key={m.label} className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
              <p className="text-xs text-[var(--color-omega-muted)]">{m.label}</p>
              <p className={`text-lg font-bold text-[var(--color-omega-${m.color})]`}>{m.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-red-950/30 border border-red-800/40 rounded-xl p-6">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2 text-red-400">
          <span>🚨</span>
          تحذيرات أمنية حرجة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            "لا تمنح النظام صلاحية السحب أبداً - فقط تداول",
            "استخدم حساب تجريبي أولاً لمدة أسبوع على الأقل",
            "لا تتجاوز 2% مخاطرة لكل صفقة في البداية",
            "احتفظ بنسخ احتياطية مشفرة لبياناتك",
            "راجع التقارير يومياً قبل اتخاذ قرارات",
            "لا تعتمد على النظام وحده - استشر مستشاراً مالياً",
          ].map((warning, i) => (
            <div key={i} className="flex items-start gap-2 bg-red-900/20 p-3 rounded-lg">
              <span className="text-red-400 mt-0.5">⚠</span>
              <p className="text-xs text-red-300/80">{warning}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useSettings } from "@/hooks/useSettings";

const ALL_STRATEGIES = [
  "Ichimoku", "Fibonacci", "SMC", "VWAP", "Elliott Wave",
  "MACD", "RSI", "Bollinger Bands", "Stochastic", "ATR",
  "Market Profile", "Volume Profile", "Pattern Recognition",
  "Multi-Timeframe", "Ensemble Voting",
  "ICT", "CRT", "Liquidity Sweep", "Order Block",
  "SMC BOS", "ICT FVG", "ICT OTE", "ICT Judas Swing",
  "Displacement", "Fractional Elliott", "Quantitative Mean Reversion",
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useSettings();

  const toggleStrategy = (s: string) => {
    const next = settings.selectedStrategies.includes(s)
      ? settings.selectedStrategies.filter((x) => x !== s)
      : [...settings.selectedStrategies, s];
    updateSettings({ selectedStrategies: next });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الإعدادات الشاملة</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">تخصيص كامل - يتم الحفظ تلقائياً</p>
        </div>
        <button onClick={resetSettings} className="px-3 py-1.5 rounded-lg text-xs bg-red-900/30 border border-red-800/30 text-red-400 hover:bg-red-900/50">إعادة تعيين</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Risk & Account */}
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><span>🛡️</span> حدود المخاطرة والحساب</h3>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[var(--color-omega-muted)]">رصيد الحساب</label>
              <span className="text-sm font-bold text-emerald-400">${settings.accountBalance.toLocaleString()}</span>
            </div>
            <input type="range" min="100" max="1000000" step="100" value={settings.accountBalance} onChange={(e) => updateSettings({ accountBalance: Number(e.target.value) })} className="w-full accent-emerald-500" />
            <div className="flex gap-2 mt-1">
              {[100, 1000, 5000, 10000, 50000, 100000].map((v) => (
                <button key={v} onClick={() => updateSettings({ accountBalance: v })} className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-0.5 rounded hover:bg-emerald-900/30">${v >= 1000 ? `${v / 1000}K` : v}</button>
              ))}
            </div>
          </div>
          {[
            { key: "riskLimit", label: "المخاطرة/صفقة (%)", min: 0.5, max: 10, step: 0.5, suffix: "%" },
            { key: "minRR", label: "أدنى R/R", min: 1, max: 5, step: 0.1, suffix: "" },
            { key: "maxDailyTrades", label: "أقصى صفقات يومية", min: 1, max: 50, step: 1, suffix: "" },
            { key: "maxOpenPositions", label: "أقصى صفقات مفتوحة", min: 1, max: 20, step: 1, suffix: "" },
            { key: "dailyKillSwitch", label: "إيقاف طارئ يومي (%)", min: 1, max: 20, step: 1, suffix: "%" },
            { key: "weeklyKillSwitch", label: "إيقاف طارئ أسبوعي (%)", min: 2, max: 30, step: 1, suffix: "%" },
            { key: "maxSlippage", label: "أقصى انزلاق", min: 0.01, max: 1, step: 0.01, suffix: "%" },
            { key: "maxConsecutiveLosses", label: "خسائر متتالية قبل الإيقاف", min: 1, max: 10, step: 1, suffix: "" },
            { key: "cooldownAfterLoss", label: "فترة الهدوء (ساعة)", min: 1, max: 72, step: 1, suffix: "س" },
          ].map((slider) => (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[var(--color-omega-muted)]">{slider.label}</label>
                <span className="text-sm font-bold text-emerald-400">{settings[slider.key as keyof typeof settings] as number}{slider.suffix}</span>
              </div>
              <input type="range" min={slider.min} max={slider.max} step={slider.step} value={settings[slider.key as keyof typeof settings] as number} onChange={(e) => updateSettings({ [slider.key]: Number(e.target.value) })} className="w-full accent-emerald-500" />
            </div>
          ))}
        </div>

        {/* Trade Customization & System */}
        <div className="space-y-4">
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><span>📊</span> تخصيص الصفقات</h3>
            {[
              { key: "stopLossPercent", label: "وقف الخسارة الافتراضي (%)", min: 0.5, max: 10, step: 0.5 },
              { key: "takeProfitPercent", label: "جني الأرباح الافتراضي (%)", min: 1, max: 20, step: 0.5 },
              { key: "tradeSizePercent", label: "حجم الصفقة (%)", min: 0.5, max: 10, step: 0.5 },
            ].map((s) => (
              <div key={s.key}>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-[var(--color-omega-muted)]">{s.label}</label>
                  <span className="text-sm font-bold text-blue-400">{settings[s.key as keyof typeof settings] as number}%</span>
                </div>
                <input type="range" min={s.min} max={s.max} step={s.step} value={settings[s.key as keyof typeof settings] as number} onChange={(e) => updateSettings({ [s.key]: Number(e.target.value) })} className="w-full accent-blue-500" />
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><span>⚙️</span> إعدادات النظام</h3>
            {[
              { key: "autoExecute", label: "التنفيذ الآلي", desc: "تنفيذ الصفقات تلقائياً" },
              { key: "trailingStop", label: "وقف الخسارة المتحرك", desc: "تعديل تلقائي" },
              { key: "notificationsEnabled", label: "الإشعارات", desc: "تنبيهات الإشارات" },
              { key: "soundEnabled", label: "الصوت", desc: "تنبيهات صوتية للصفقات" },
              { key: "alertSound", label: "صوت التنبيهات", desc: "صوت عند تفعيل التنبيهات السعرية" },
              { key: "enableCrisisDetection", label: "كشف الأزمات", desc: "تنبيه عند أنماط أزمات" },
              { key: "enableFOMODetection", label: "كشف FOMO", desc: "منع الشراء الانفعالي" },
              { key: "cooldownEnabled", label: "فترة الهدوء", desc: "إيقاف بعد خسائر متتالية" },
              { key: "manualCloseEnabled", label: "إغلاق يدوي", desc: "السماح بإغلاق الصفقات يدوياً" },
              { key: "requireConfirmation", label: "تأكيد مطلوب", desc: "تأكيد قبل كل صفقة" },
              { key: "ghostMode", label: "وضع الشبح", desc: "تداول تجريبي مخفي" },
              { key: "mobileMode", label: "وضع الجوال", desc: "واجهة محسنة للجوال" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{toggle.label}</p>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">{toggle.desc}</p>
                </div>
                <button onClick={() => updateSettings({ [toggle.key]: !settings[toggle.key as keyof typeof settings] })} className={`w-11 h-5 rounded-full relative ${settings[toggle.key as keyof typeof settings] ? "bg-emerald-600" : "bg-[var(--color-omega-border)]"}`}>
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 ${settings[toggle.key as keyof typeof settings] ? "left-0.5" : "left-6"}`} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><span>🕐</span> التداول والعرض</h3>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">ساعات التداول</label>
              <select value={settings.tradingHours} onChange={(e) => updateSettings({ tradingHours: e.target.value })} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                <option value="all">24 ساعة</option><option value="london">لندن</option><option value="newyork">نيويورك</option><option value="overlap">التداخل</option><option value="asia">آسيا</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">نوع الحساب</label>
              <select value={settings.brokerType} onChange={(e) => updateSettings({ brokerType: e.target.value })} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                <option value="demo">تجريبي</option><option value="live">حقيقي</option><option value="paper">ورقي</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اللغة</label>
              <select value={settings.language} onChange={(e) => updateSettings({ language: e.target.value })} className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                <option value="ar">العربية</option><option value="en">English</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><span>📈</span> الاستراتيجيات ({settings.selectedStrategies.length}/{ALL_STRATEGIES.length})</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {ALL_STRATEGIES.map((s) => (
            <button key={s} onClick={() => toggleStrategy(s)} className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${settings.selectedStrategies.includes(s) ? "bg-emerald-600 border-emerald-500 text-white" : "bg-[var(--color-omega-surface)] border-[var(--color-omega-border)] text-[var(--color-omega-muted)]"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

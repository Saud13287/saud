"use client";
import { useSettings } from "@/hooks/useSettings";

const ALL_STRATEGIES = [
  "Ichimoku", "Fibonacci", "SMC", "VWAP", "Elliott Wave",
  "MACD", "RSI", "Bollinger Bands", "Stochastic", "ATR",
  "Market Profile", "Volume Profile", "Pattern Recognition",
  "Multi-Timeframe", "Ensemble Voting",
];

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings, loaded } = useSettings();

  if (!loaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
      </div>
    );
  }

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
          <h1 className="text-xl font-bold">الإعدادات</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">تخصيص شامل - يتم الحفظ تلقائياً</p>
        </div>
        <button
          onClick={resetSettings}
          className="px-3 py-1.5 rounded-lg text-xs bg-red-900/30 border border-red-800/30 text-red-400 hover:bg-red-900/50 transition-colors"
        >
          إعادة تعيين
        </button>
      </div>

      <div className="bg-emerald-900/20 border border-emerald-800/30 rounded-lg p-3 flex items-center gap-2">
        <span className="text-emerald-400">✅</span>
        <p className="text-xs text-emerald-300">يتم حفظ الإعدادات تلقائياً في المتصفح. أي تعديل يُحفظ فوراً.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold flex items-center gap-2"><span>🛡️</span> حدود المخاطرة والحساب</h3>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs text-[var(--color-omega-muted)]">رصيد الحساب</label>
              <span className="text-sm font-bold text-emerald-400">${settings.accountBalance.toLocaleString()}</span>
            </div>
            <input
              type="range" min="100" max="1000000" step="100"
              value={settings.accountBalance}
              onChange={(e) => updateSettings({ accountBalance: Number(e.target.value) })}
              className="w-full accent-emerald-500"
            />
            <div className="flex gap-2 mt-1">
              {[100, 500, 1000, 5000, 10000, 50000, 100000, 500000].map((v) => (
                <button key={v} onClick={() => updateSettings({ accountBalance: v })} className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-0.5 rounded hover:bg-emerald-900/30">
                  ${v >= 1000 ? `${(v/1000)}K` : v}
                </button>
              ))}
            </div>
          </div>

          {[
            { key: "riskLimit", label: "المخاطرة لكل صفقة (%)", min: 0.5, max: 10, step: 0.5, suffix: "%", color: "text-amber-400" },
            { key: "minRR", label: "أدنى نسبة مخاطرة/عائد", min: 1, max: 5, step: 0.1, suffix: "", color: "text-blue-400" },
            { key: "maxDailyTrades", label: "أقصى صفقات يومية", min: 1, max: 50, step: 1, suffix: "", color: "text-white" },
            { key: "maxOpenPositions", label: "أقصى صفقات مفتوحة", min: 1, max: 20, step: 1, suffix: "", color: "text-white" },
            { key: "dailyKillSwitch", label: "إيقاف طارئ - خسارة يومية", min: 1, max: 20, step: 1, suffix: "%", color: "text-red-400" },
            { key: "weeklyKillSwitch", label: "إيقاف طارئ - خسارة أسبوعية", min: 2, max: 30, step: 1, suffix: "%", color: "text-red-400" },
            { key: "maxSlippage", label: "أقصى انزلاق (Slippage)", min: 0.01, max: 1, step: 0.01, suffix: "%", color: "text-white" },
            { key: "maxConsecutiveLosses", label: "أقصى خسائر متتالية قبل الإيقاف", min: 1, max: 10, step: 1, suffix: "", color: "text-red-400" },
            { key: "cooldownAfterLoss", label: "فترة الهدوء بعد الإيقاف (ساعة)", min: 1, max: 72, step: 1, suffix: "س", color: "text-amber-400" },
          ].map((slider) => (
            <div key={slider.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs text-[var(--color-omega-muted)]">{slider.label}</label>
                <span className={`text-sm font-bold ${slider.color}`}>
                  {settings[slider.key as keyof typeof settings]}{slider.suffix}
                </span>
              </div>
              <input
                type="range"
                min={slider.min}
                max={slider.max}
                step={slider.step}
                value={settings[slider.key as keyof typeof settings] as number}
                onChange={(e) => updateSettings({ [slider.key]: Number(e.target.value) })}
                className="w-full accent-emerald-500"
              />
            </div>
          ))}
        </div>

        <div className="space-y-4">
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
            <h3 className="text-sm font-bold flex items-center gap-2"><span>⚙️</span> إعدادات النظام</h3>

            {[
              { key: "autoExecute", label: "التنفيذ الآلي", desc: "تنفيذ الصفقات تلقائياً" },
              { key: "ghostMode", label: "وضع الشبح", desc: "تداول تجريبي مخفي" },
              { key: "trailingStop", label: "وقف الخسارة المتحرك", desc: "تعديل تلقائي لوقف الخسارة" },
              { key: "notificationsEnabled", label: "الإشعارات", desc: "تنبيهات الإشارات الجديدة" },
              { key: "enableCrisisDetection", label: "كشف الأزمات", desc: "تنبيه عند أنماط مشابهة للأزمات" },
              { key: "enableFOMODetection", label: "كشف FOMO", desc: "منع الشراء الانفعالي" },
              { key: "cooldownEnabled", label: "فترة الهدوء", desc: `إيقاف بعد ${settings.maxConsecutiveLosses} خسائر متتالية` },
              { key: "mobileMode", label: "وضع الجوال", desc: "واجهة محسنة للشاشات الصغيرة" },
              { key: "soundEnabled", label: "الصوت", desc: "تنبيهات صوتية عند الصفقات" },
            ].map((toggle) => (
              <div key={toggle.key} className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium">{toggle.label}</p>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">{toggle.desc}</p>
                </div>
                <button
                  onClick={() => updateSettings({ [toggle.key]: !settings[toggle.key as keyof typeof settings] })}
                  className={`w-11 h-5 rounded-full transition-colors relative ${
                    settings[toggle.key as keyof typeof settings] ? "bg-emerald-600" : "bg-[var(--color-omega-border)]"
                  }`}
                >
                  <div className={`w-4 h-4 bg-white rounded-full absolute top-0.5 transition-transform ${
                    settings[toggle.key as keyof typeof settings] ? "left-0.5" : "left-6"
                  }`} />
                </button>
              </div>
            ))}
          </div>

          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-3">
            <h3 className="text-sm font-bold flex items-center gap-2"><span>🕐</span> التداول والإعدادات</h3>

            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">ساعات التداول</label>
              <select
                value={settings.tradingHours}
                onChange={(e) => updateSettings({ tradingHours: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
              >
                <option value="all">24 ساعة</option>
                <option value="london">جلسة لندن</option>
                <option value="newyork">جلسة نيويورك</option>
                <option value="overlap">ساعة التداخل</option>
                <option value="asia">جلسة آسيا</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">نوع الحساب</label>
              <select
                value={settings.brokerType}
                onChange={(e) => updateSettings({ brokerType: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
              >
                <option value="demo">تجريبي (Demo)</option>
                <option value="live">حقيقي (Live)</option>
                <option value="paper">ورقي (Paper)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الرمز الافتراضي</label>
              <select
                value={settings.chartSymbol}
                onChange={(e) => updateSettings({ chartSymbol: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
              >
                <option value="COMEX:GC1!">ذهب (XAU/USD)</option>
                <option value="FX:EURUSD">يورو/دولار</option>
                <option value="FX:GBPUSD">جنيه/دولار</option>
                <option value="BITSTAMP:BTCUSD">بيتكوين</option>
                <option value="BITSTAMP:ETHUSD">إيثريوم</option>
                <option value="NYMEX:CL1!">نفط WTI</option>
                <option value="SP:SPX">S&P 500</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اللغة</label>
              <select
                value={settings.language}
                onChange={(e) => updateSettings({ language: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
              >
                <option value="ar">العربية</option>
                <option value="en">English</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">المظهر</label>
              <select
                value={settings.theme}
                onChange={(e) => updateSettings({ theme: e.target.value })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
              >
                <option value="dark">داكن</option>
                <option value="light">فاتح</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><span>📈</span> الاستراتيجيات ({settings.selectedStrategies.length}/{ALL_STRATEGIES.length})</h3>
        <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
          {ALL_STRATEGIES.map((s) => (
            <button
              key={s}
              onClick={() => toggleStrategy(s)}
              className={`px-2 py-2 rounded-lg text-xs font-medium transition-all border ${
                settings.selectedStrategies.includes(s)
                  ? "bg-emerald-600 border-emerald-500 text-white"
                  : "bg-[var(--color-omega-surface)] border-[var(--color-omega-border)] text-[var(--color-omega-muted)]"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

export default function SettingsPage() {
  const [riskLimit, setRiskLimit] = useState(2);
  const [maxDailyTrades, setMaxDailyTrades] = useState(10);
  const [dailyKillSwitch, setDailyKillSwitch] = useState(5);
  const [autoExecute, setAutoExecute] = useState(false);
  const [ghostMode, setGhostMode] = useState(false);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">الإعدادات</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          تخصيص سلوك النظام وحدود المخاطرة
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>🛡️</span>
            حدود المخاطرة
          </h3>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">
              الحد الأقصى للمخاطرة لكل صفقة (%)
            </label>
            <input
              type="range"
              min="0.5"
              max="10"
              step="0.5"
              value={riskLimit}
              onChange={(e) => setRiskLimit(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-[var(--color-omega-gold)]">{riskLimit}%</span>
          </div>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">
              أقصى عدد صفقات يومية
            </label>
            <input
              type="range"
              min="1"
              max="50"
              value={maxDailyTrades}
              onChange={(e) => setMaxDailyTrades(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-[var(--color-omega-gold)]">{maxDailyTrades}</span>
          </div>

          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-2">
              مفتاح الإيقاف الطارئ - الخسارة اليومية القصوى (%)
            </label>
            <input
              type="range"
              min="1"
              max="20"
              value={dailyKillSwitch}
              onChange={(e) => setDailyKillSwitch(Number(e.target.value))}
              className="w-full"
            />
            <span className="text-sm text-[var(--color-omega-red)]">{dailyKillSwitch}%</span>
          </div>
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 space-y-5">
          <h3 className="text-sm font-bold flex items-center gap-2">
            <span>⚙️</span>
            إعدادات النظام
          </h3>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">التنفيذ الآلي</p>
              <p className="text-xs text-[var(--color-omega-muted)]">
                تنفيذ الصفقات تلقائياً دون تأكيد
              </p>
            </div>
            <button
              onClick={() => setAutoExecute(!autoExecute)}
              className={`w-12 h-6 rounded-full transition-colors ${
                autoExecute ? "bg-[var(--color-omega-green)]" : "bg-[var(--color-omega-border)]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  autoExecute ? "translate-x-0.5" : "translate-x-6"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">وضع الشبح</p>
              <p className="text-xs text-[var(--color-omega-muted)]">
                تداول تجريبي مخفي لاختبار القرارات الجديدة
              </p>
            </div>
            <button
              onClick={() => setGhostMode(!ghostMode)}
              className={`w-12 h-6 rounded-full transition-colors ${
                ghostMode ? "bg-[var(--color-omega-purple)]" : "bg-[var(--color-omega-border)]"
              }`}
            >
              <div
                className={`w-5 h-5 bg-white rounded-full transition-transform ${
                  ghostMode ? "translate-x-0.5" : "translate-x-6"
                }`}
              />
            </button>
          </div>

          <div className="pt-3 border-t border-[var(--color-omega-border)]">
            <h4 className="text-xs font-bold mb-2 text-[var(--color-omega-red)]">
              تحذيرات أمنية
            </h4>
            <ul className="space-y-2 text-xs text-[var(--color-omega-muted)]">
              <li className="flex items-center gap-2">
                <span className="text-[var(--color-omega-red)]">⚠</span>
                لا تمنح النظام صلاحية السحب أبداً
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--color-omega-red)]">⚠</span>
                استخدم وضع المستشار قبل التفعيل الآلي
              </li>
              <li className="flex items-center gap-2">
                <span className="text-[var(--color-omega-red)]">⚠</span>
                احتفظ بنسخ احتياطية مشفرة لبياناتك
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6">
        <h3 className="text-sm font-bold mb-3 flex items-center gap-2">
          <span>📊</span>
          ملخص الإعدادات الحالية
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
            <p className="text-xs text-[var(--color-omega-muted)]">حد المخاطرة</p>
            <p className="text-lg font-bold text-[var(--color-omega-gold)]">{riskLimit}%</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
            <p className="text-xs text-[var(--color-omega-muted)]">صفقات يومية</p>
            <p className="text-lg font-bold text-[var(--color-omega-accent)]">{maxDailyTrades}</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
            <p className="text-xs text-[var(--color-omega-muted)]">إيقاف طارئ</p>
            <p className="text-lg font-bold text-[var(--color-omega-red)]">{dailyKillSwitch}%</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
            <p className="text-xs text-[var(--color-omega-muted)]">تنفيذ آلي</p>
            <p className="text-lg font-bold">{autoExecute ? "مفعل" : "معطل"}</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
            <p className="text-xs text-[var(--color-omega-muted)]">وضع الشبح</p>
            <p className="text-lg font-bold">{ghostMode ? "مفعل" : "معطل"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

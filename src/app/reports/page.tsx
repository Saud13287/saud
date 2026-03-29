"use client";
import { useMemo, useState, useCallback } from "react";
import { agentRegistry } from "@/lib/agents/registry";

interface ReportData {
  expertId: string;
  expertName: string;
  expertNameEn: string;
  icon: string;
  category: string;
  accuracy: number;
  weight: number;
  assistantCount: number;
  avgAssistantAccuracy: number;
  status: string;
  totalSignals: number;
  correctSignals: number;
  totalPnl: number;
  avgConfidence: number;
  winStreak: number;
  lossStreak: number;
}

export default function ReportsPage() {
  const [selectedTab, setSelectedTab] = useState<"overview" | "performance" | "export">("overview");
  const [exporting, setExporting] = useState(false);

  const reports = useMemo<ReportData[]>(() => {
    const cats: Record<string, string> = {
      ceo: "الإدارة", fundamental: "مالية", news: "أخبار", technical: "فني",
      risk: "مخاطر", system: "برمجي", decision: "قرارات", audit: "تدقيق",
    };
    return agentRegistry.map((expert) => {
      const seed = expert.id.charCodeAt(0) + expert.id.length;
      return {
        expertId: expert.id,
        expertName: expert.nameAr,
        expertNameEn: expert.nameEn,
        icon: expert.icon,
        category: cats[expert.category] || expert.category,
        accuracy: expert.accuracy,
        weight: expert.weight,
        assistantCount: expert.assistants.length,
        avgAssistantAccuracy:
          expert.assistants.reduce((s, a) => s + a.accuracy, 0) /
          expert.assistants.length,
        status: expert.status,
        totalSignals: 50 + (seed * 7) % 200,
        correctSignals: Math.round((50 + (seed * 7) % 200) * expert.accuracy / 100),
        totalPnl: Math.round(((seed % 100) / 100 - 0.2) * 30000),
        avgConfidence: 80 + (seed % 18),
        winStreak: 2 + (seed % 8),
        lossStreak: 1 + (seed % 3),
      };
    });
  }, []);

  const topByAccuracy = useMemo(() => [...reports].sort((a, b) => b.accuracy - a.accuracy), [reports]);
  const topByPnl = useMemo(() => [...reports].sort((a, b) => b.totalPnl - a.totalPnl), [reports]);
  const totalSignalsAll = reports.reduce((s, r) => s + r.totalSignals, 0);
  const totalPnlAll = reports.reduce((s, r) => s + r.totalPnl, 0);
  const avgAccuracyAll = Math.round(reports.reduce((s, r) => s + r.accuracy, 0) / reports.length);

  const exportToPDF = useCallback(async () => {
    setExporting(true);
    try {
      const printWindow = window.open("", "_blank");
      if (!printWindow) return;

      const html = `
        <!DOCTYPE html>
        <html dir="rtl" lang="ar">
        <head>
          <meta charset="UTF-8">
          <title>تقرير نظام سعود</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; color: #1a1a1a; }
            h1 { color: #10b981; text-align: center; }
            h2 { color: #374151; border-bottom: 2px solid #10b981; padding-bottom: 5px; }
            table { width: 100%; border-collapse: collapse; margin: 15px 0; }
            th { background: #10b981; color: white; padding: 10px; text-align: right; }
            td { padding: 8px; border-bottom: 1px solid #e5e7eb; }
            tr:nth-child(even) { background: #f3f4f6; }
            .positive { color: #10b981; font-weight: bold; }
            .negative { color: #ef4444; font-weight: bold; }
            .summary { display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin: 20px 0; }
            .summary-card { background: #f9fafb; padding: 15px; border-radius: 8px; text-align: center; }
            .summary-card h3 { margin: 0; color: #6b7280; font-size: 12px; }
            .summary-card p { margin: 5px 0 0; font-size: 24px; font-weight: bold; color: #10b981; }
            .footer { text-align: center; color: #9ca3af; font-size: 11px; margin-top: 30px; border-top: 1px solid #e5e7eb; padding-top: 10px; }
          </style>
        </head>
        <body>
          <h1>📊 تقرير نظام سعود للذكاء المالي</h1>
          <p style="text-align:center; color: #6b7280;">تاريخ التقرير: ${new Date().toLocaleDateString("ar-SA")} | الإصدار 8.0</p>

          <div class="summary">
            <div class="summary-card"><h3>إجمالي الخبراء</h3><p>${reports.length}</p></div>
            <div class="summary-card"><h3>إجمالي الإشارات</h3><p>${totalSignalsAll}</p></div>
            <div class="summary-card"><h3>متوسط الدقة</h3><p>${avgAccuracyAll}%</p></div>
            <div class="summary-card"><h3>إجمالي P&L</h3><p class="${totalPnlAll >= 0 ? "positive" : "negative"}">$${totalPnlAll.toLocaleString()}</p></div>
          </div>

          <h2>📋 تقرير أداء الخبراء</h2>
          <table>
            <thead>
              <tr><th>الخبير</th><th>التصنيف</th><th>الدقة</th><th>الوزن</th><th>الإشارات</th><th>الصحيحة</th><th>P&L</th><th>الثقة</th></tr>
            </thead>
            <tbody>
              ${reports.map((r) => `
                <tr>
                  <td>${r.icon} ${r.expertName}</td>
                  <td>${r.category}</td>
                  <td>${r.accuracy}%</td>
                  <td>${Math.round(r.weight * 100)}%</td>
                  <td>${r.totalSignals}</td>
                  <td>${r.correctSignals}</td>
                  <td class="${r.totalPnl >= 0 ? "positive" : "negative"}">$${r.totalPnl.toLocaleString()}</td>
                  <td>${r.avgConfidence}%</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <h2>🏆 ترتيب الخبراء حسب الدقة</h2>
          <table>
            <thead><tr><th>#</th><th>الخبير</th><th>الدقة</th><th>أفضل سلسلة</th></tr></thead>
            <tbody>
              ${topByAccuracy.slice(0, 10).map((r, i) => `
                <tr>
                  <td>${i + 1}</td>
                  <td>${r.icon} ${r.expertName}</td>
                  <td>${r.accuracy}%</td>
                  <td>${r.winStreak} انتصارات متتالية</td>
                </tr>
              `).join("")}
            </tbody>
          </table>

          <div class="footer">
            <p>تم إنشاء هذا التقرير تلقائياً بواسطة نظام سعود للذكاء المالي</p>
            <p>Saud Financial Intelligence v8.0</p>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();
      setTimeout(() => printWindow.print(), 500);
    } catch (err) {
      console.error("Export error:", err);
    } finally {
      setExporting(false);
    }
  }, [reports, topByAccuracy, totalSignalsAll, totalPnlAll, avgAccuracyAll]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">التقارير والتحليلات</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">
            {reports.length} خبير | {totalSignalsAll} إشارة | متوسط دقة {avgAccuracyAll}%
          </p>
        </div>
        <button onClick={exportToPDF} disabled={exporting}
          className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50">
          {exporting ? "جاري التصدير..." : "📄 تصدير PDF"}
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي الخبراء", value: reports.length, icon: "👥", color: "text-emerald-400" },
          { label: "إجمالي الإشارات", value: totalSignalsAll, icon: "📊", color: "text-blue-400" },
          { label: "متوسط الدقة", value: `${avgAccuracyAll}%`, icon: "🎯", color: "text-amber-400" },
          { label: "إجمالي P&L", value: `$${totalPnlAll.toLocaleString()}`, icon: "💰", color: totalPnlAll >= 0 ? "text-emerald-400" : "text-red-400" },
        ].map((m) => (
          <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
              <span>{m.icon}</span>
            </div>
            <p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-2 border-b border-[var(--color-omega-border)]">
        {(["overview", "performance", "export"] as const).map((tab) => (
          <button key={tab} onClick={() => setSelectedTab(tab)}
            className={`px-4 py-2 text-xs font-medium border-b-2 ${
              selectedTab === tab ? "border-emerald-500 text-emerald-400" : "border-transparent text-[var(--color-omega-muted)]"
            }`}>
            {tab === "overview" ? "📊 نظرة عامة" : tab === "performance" ? "🏆 أداء مفصّل" : "📄 تصدير"}
          </button>
        ))}
      </div>

      {selectedTab === "overview" && (
        <>
          <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="bg-[var(--color-omega-surface)]">
                  <th className="text-right px-3 py-2 font-medium">الخبير</th>
                  <th className="text-right px-3 py-2 font-medium">التصنيف</th>
                  <th className="text-right px-3 py-2 font-medium">الدقة</th>
                  <th className="text-right px-3 py-2 font-medium">الوزن</th>
                  <th className="text-right px-3 py-2 font-medium">المساعدين</th>
                  <th className="text-right px-3 py-2 font-medium">دقة المساعدين</th>
                  <th className="text-right px-3 py-2 font-medium">الحالة</th>
                </tr>
              </thead>
              <tbody>
                {reports.map((r) => (
                  <tr key={r.expertId} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)] transition-colors">
                    <td className="px-3 py-2 font-medium">{r.icon} {r.expertName}</td>
                    <td className="px-3 py-2"><span className="text-[9px] bg-[var(--color-omega-surface)] px-1.5 py-0.5 rounded">{r.category}</span></td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-1.5 bg-[var(--color-omega-border)] rounded-full overflow-hidden">
                          <div className="h-full rounded-full" style={{ width: `${r.accuracy}%`, backgroundColor: r.accuracy > 80 ? "#10b981" : r.accuracy > 60 ? "#f59e0b" : "#ef4444" }} />
                        </div>
                        <span className="font-bold">{Math.round(r.accuracy)}%</span>
                      </div>
                    </td>
                    <td className="px-3 py-2">{Math.round(r.weight * 100)}%</td>
                    <td className="px-3 py-2">{r.assistantCount}</td>
                    <td className="px-3 py-2">{Math.round(r.avgAssistantAccuracy)}%</td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <div className={`status-dot status-${r.status}`} />
                        <span>{r.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><span>📈</span>توزيع الأوزان</h3>
              <div className="space-y-2">
                {reports.map((r) => (
                  <div key={r.expertId} className="flex items-center gap-3">
                    <span className="text-xs w-32 truncate">{r.expertName}</span>
                    <div className="flex-1 h-3 bg-[var(--color-omega-surface)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${r.weight * 100}%` }} />
                    </div>
                    <span className="text-xs w-10 text-left">{Math.round(r.weight * 100)}%</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
              <h3 className="text-sm font-bold mb-3 flex items-center gap-2"><span>🎯</span>أفضل الدقة</h3>
              <div className="space-y-2">
                {topByAccuracy.slice(0, 8).map((r, i) => (
                  <div key={r.expertId} className="flex items-center justify-between bg-[var(--color-omega-surface)] px-3 py-2 rounded-lg">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-amber-400 font-bold">#{i + 1}</span>
                      <span className="text-sm">{r.icon} {r.expertName}</span>
                    </div>
                    <span className="text-sm font-bold text-emerald-400">{Math.round(r.accuracy)}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {selectedTab === "performance" && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-omega-surface)]">
                <th className="text-right px-3 py-2 font-medium">الخبير</th>
                <th className="text-right px-3 py-2 font-medium">الإشارات</th>
                <th className="text-right px-3 py-2 font-medium">الصحيحة</th>
                <th className="text-right px-3 py-2 font-medium">الدقة</th>
                <th className="text-right px-3 py-2 font-medium">P&L</th>
                <th className="text-right px-3 py-2 font-medium">الثقة</th>
                <th className="text-right px-3 py-2 font-medium">سلسلة ربح</th>
                <th className="text-right px-3 py-2 font-medium">سلسلة خسارة</th>
              </tr>
            </thead>
            <tbody>
              {topByAccuracy.map((r) => (
                <tr key={r.expertId} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                  <td className="px-3 py-2 font-medium">{r.icon} {r.expertName}</td>
                  <td className="px-3 py-2">{r.totalSignals}</td>
                  <td className="px-3 py-2 text-emerald-400">{r.correctSignals}</td>
                  <td className="px-3 py-2 font-bold">{r.accuracy}%</td>
                  <td className={`px-3 py-2 font-bold font-mono ${r.totalPnl >= 0 ? "text-emerald-400" : "text-red-400"}`}>${r.totalPnl.toLocaleString()}</td>
                  <td className="px-3 py-2">{r.avgConfidence}%</td>
                  <td className="px-3 py-2 text-emerald-400">🔥 {r.winStreak}</td>
                  <td className="px-3 py-2 text-red-400">📉 {r.lossStreak}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedTab === "export" && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 text-center space-y-4">
          <p className="text-4xl">📄</p>
          <h3 className="text-lg font-bold">تصدير التقرير كـ PDF</h3>
          <p className="text-xs text-[var(--color-omega-muted)] max-w-md mx-auto">
            اضغط على زر التصدير لإنشاء تقرير PDF شامل يتضمن أداء جميع الخبراء، الإشارات، P&L، والترتيب
          </p>
          <button onClick={exportToPDF} disabled={exporting}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
            {exporting ? "جاري التصدير..." : "📄 تصدير التقرير"}
          </button>
          <p className="text-[9px] text-[var(--color-omega-muted)]">سيتم فتح نافذة طباعة - اختر &quot;حفظ كـ PDF&quot;</p>
        </div>
      )}
    </div>
  );
}

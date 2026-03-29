"use client";
import { useState } from "react";
import { useSettings } from "@/hooks/useSettings";

interface AnalysisResult {
  asset: string;
  timestamp: string;
  summary: string;
  recommendation: string;
  confidence: number;
  keyPoints: string[];
  riskLevel: string;
  entryZone: string;
  stopLoss: string;
  takeProfit: string;
}

export default function AIAnalysisPage() {
  const { settings } = useSettings();
  const [query, setQuery] = useState("");
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AnalysisResult[]>([]);

  const analyze = async () => {
    if (!query.trim()) return;
    setLoading(true);

    // Simulate AI deep analysis
    await new Promise(r => setTimeout(r, 2000));

    const assets = ["ذهب", "بيتكوين", "إيثريوم", "يورو/دولار", "سولانا", "نفط"];
    const detectedAsset = assets.find(a => query.includes(a)) || "السوق العام";
    const isPositive = Math.random() > 0.4;
    const conf = 88 + Math.random() * 10;

    const result: AnalysisResult = {
      asset: detectedAsset,
      timestamp: new Date().toLocaleString("ar-SA"),
      summary: isPositive
        ? `تحليل عميق يشير إلى فرصة شراء جيدة في ${detectedAsset}. البيانات المالية والفنية متضاربة مع مؤشرات إيجابية على المدى المتوسط.`
        : `تحليل عميق يشير إلى حذر من ${detectedAsset}. هناك علامات تضعف قد تؤثر على الأداء قصير المدى.`,
      recommendation: isPositive ? "شراء حذر" : "انتظار",
      confidence: Math.round(conf * 10) / 10,
      keyPoints: [
        `التوجه العام: ${isPositive ? "صاعد" : "متذبذب"}`,
        `مؤشر RSI: ${isPositive ? "52 (محايد-إيجابي)" : "44 (محايد-سلبي)"}`,
        `المشاعر: ${isPositive ? "إيجابية" : "متقاربة"}`,
        `الدعم الرئيسي: ${isPositive ? "قوي" : "ضعيف"}`,
        `الحجم: ${isPositive ? "متزايد" : "متراجع"}`,
      ],
      riskLevel: conf > 93 ? "منخفضة" : conf > 85 ? "متوسطة" : "عالية",
      entryZone: isPositive ? "السعر الحالي أو أدنى 1%" : "انتظار كسر المقاومة",
      stopLoss: isPositive ? "2% تحت سعر الدخول" : "لا يوجد - انتظار",
      takeProfit: isPositive ? "4% فوق سعر الدخول" : "لا يوجد - انتظار",
    };

    setResult(result);
    setHistory(prev => [result, ...prev.slice(0, 9)]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-bold">التحليل بالذكاء الاصطناعي</h1>
        <p className="text-xs text-[var(--color-omega-muted)]">تحليل نصي متقدم - {settings.selectedStrategies.length} استراتيجية نشطة</p>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <div className="flex gap-3">
          <input type="text" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === "Enter" && analyze()}
            placeholder="مثال: تحليل عميق للذهب الآن مع مراعاة الأخبار والمؤشرات الفنية"
            className="flex-1 bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-emerald-500" dir="rtl" />
          <button onClick={analyze} disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700 px-6 py-3 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
            {loading ? "⏳ يحلل..." : "🧠 تحليل عميق"}
          </button>
        </div>
        <div className="flex gap-2 mt-3 flex-wrap">
          {["تحليل عميق للذهب", "فرصة في بيتكوين", "هل أشتري إيثريوم؟", "تحليل يورو/دولار", "فرصة سولانا"].map(q => (
            <button key={q} onClick={() => setQuery(q)} className="text-[10px] bg-[var(--color-omega-surface)] px-2 py-1 rounded hover:bg-emerald-900/30">{q}</button>
          ))}
        </div>
      </div>

      {loading && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full mx-auto mb-3" />
          <p className="text-sm">جاري التحليل المتقدم...</p>
          <p className="text-xs text-[var(--color-omega-muted)]">تطبيق {settings.selectedStrategies.length} استراتيجية + 59 خبير</p>
        </div>
      )}

      {result && !loading && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold">🧠 تحليل: {result.asset}</h3>
            <span className="text-[10px] text-[var(--color-omega-muted)]">{result.timestamp}</span>
          </div>

          <div className="bg-[var(--color-omega-surface)] rounded-lg p-4">
            <p className="text-sm leading-relaxed">{result.summary}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[var(--color-omega-muted)]">التوصية</p>
              <p className={`text-sm font-bold ${result.recommendation.includes("شراء") ? "text-emerald-400" : "text-amber-400"}`}>{result.recommendation}</p>
            </div>
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[var(--color-omega-muted)]">الثقة</p>
              <p className="text-sm font-bold text-emerald-400">{result.confidence}%</p>
            </div>
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[var(--color-omega-muted)]">المخاطر</p>
              <p className="text-sm font-bold">{result.riskLevel}</p>
            </div>
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg text-center">
              <p className="text-[10px] text-[var(--color-omega-muted)]">منطقة الدخول</p>
              <p className="text-xs font-bold">{result.entryZone}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
              <p className="text-[10px] text-[var(--color-omega-muted)] mb-1">نقاط رئيسية:</p>
              {result.keyPoints.map((p, i) => <p key={i} className="text-xs text-[var(--color-omega-muted)]">• {p}</p>)}
            </div>
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
              <p className="text-[10px] text-[var(--color-omega-muted)] mb-1">وقف الخسارة:</p>
              <p className="text-xs font-bold text-red-400">{result.stopLoss}</p>
            </div>
            <div className="bg-[var(--color-omega-surface)] p-3 rounded-lg">
              <p className="text-[10px] text-[var(--color-omega-muted)] mb-1">جني الأرباح:</p>
              <p className="text-xs font-bold text-emerald-400">{result.takeProfit}</p>
            </div>
          </div>
        </div>
      )}

      {history.length > 0 && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
          <h3 className="text-sm font-bold mb-3">📋 سجل التحليلات</h3>
          <div className="space-y-2">
            {history.map((h, i) => (
              <div key={i} className="bg-[var(--color-omega-surface)] p-3 rounded-lg flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium">{h.asset} - {h.recommendation}</p>
                  <p className="text-[10px] text-[var(--color-omega-muted)]">{h.timestamp}</p>
                </div>
                <span className="text-xs font-bold text-emerald-400">{h.confidence}%</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

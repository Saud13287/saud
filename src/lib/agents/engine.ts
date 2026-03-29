import {
  ExpertAgent,
  AgentAnalysis,
  WarRoomSession,
  CEODecision,
  AuditReport,
  DecisionType,
} from "./types";
import { agentRegistry } from "./registry";
import {
  runFullTechnicalAnalysis,
  detectSupportResistance,
  detectCandlestickPatterns,
  PriceData,
} from "@/lib/analysis/technical";
import {
  analyzeFundamentals,
  calculateFundamentalScore,
  FundamentalData,
} from "@/lib/analysis/fundamental";
import {
  analyzeNewsSentiment,
  calculateFearGreedIndex,
  NewsItem,
} from "@/lib/analysis/sentiment";
import {
  calculatePositionSize,
  RiskParameters,
} from "@/lib/analysis/risk";
import {
  detectAllPatterns,
} from "@/lib/analysis/patterns";
import {
  runAllStrategies,
  calculateEnsembleDecision,
} from "@/lib/strategies/advanced";
import { saveSession } from "@/lib/db/store";

function generateMockPriceData(count: number): PriceData[] {
  const data: PriceData[] = [];
  let price = 100 + Math.random() * 50;
  const now = Date.now();
  const trend = (Math.random() - 0.5) * 0.02;

  for (let i = 0; i < count; i++) {
    const drift = trend * price;
    const noise = (Math.random() - 0.5) * price * 0.02;
    const open = price;
    const close = price + drift + noise;
    const high = Math.max(open, close) + Math.random() * price * 0.01;
    const low = Math.min(open, close) - Math.random() * price * 0.01;
    data.push({
      open,
      high,
      low,
      close,
      volume: 800000 + Math.random() * 4000000,
      timestamp: new Date(now - (count - i) * 3600000).toISOString(),
    });
    price = close;
  }
  return data;
}

function generateMockNews(): NewsItem[] {
  const headlines = [
    { title: "البنك المركزي الأمريكي يحافظ على أسعار الفائدة", source: "رويترز" },
    { title: "ارتفاع أسهم التكنولوجيا بعد توقعات أرباح قوية من NVIDIA", source: "بلومبرغ" },
    { title: "مخاوف من تباطؤ النمو الاقتصادي في الصين", source: "سي إن بي سي" },
    { title: "الذهب يرتفع نحو 2660 مع زيادة طلبات الملاذ الآمن", source: "رويترز" },
    { title: "أسعار النفط تتراجع 2% بسبب مخاوف الطلب العالمي", source: "وول ستريت جورنال" },
    { title: "البيتكوين يقترب من 100 ألف دولار بدعم من ETFs المؤسسية", source: "كوين ديسك" },
  ];
  return headlines.map((h, i) => ({
    title: h.title,
    source: h.source,
    timestamp: new Date(Date.now() - i * 3600000).toISOString(),
    content: h.title,
    language: "ar",
  }));
}

function generateMockFundamentals(): FundamentalData {
  const bullish = Math.random() > 0.5;
  return {
    peRatio: bullish ? 8 + Math.random() * 12 : 25 + Math.random() * 20,
    pbRatio: bullish ? 0.5 + Math.random() * 1.5 : 2 + Math.random() * 3,
    debtToEquity: bullish ? Math.random() * 0.8 : 1.5 + Math.random() * 2,
    currentRatio: bullish ? 1.5 + Math.random() * 1.5 : 0.8 + Math.random() * 0.5,
    roe: bullish ? 15 + Math.random() * 20 : 3 + Math.random() * 8,
    roa: bullish ? 8 + Math.random() * 12 : 1 + Math.random() * 5,
    profitMargin: bullish ? 12 + Math.random() * 15 : 2 + Math.random() * 5,
    revenueGrowth: bullish ? 10 + Math.random() * 20 : -5 + Math.random() * 8,
    earningsGrowth: bullish ? 15 + Math.random() * 25 : -10 + Math.random() * 12,
    dividendYield: Math.random() * 5,
    freeCashFlow: bullish ? 1000 + Math.random() * 5000 : -500 + Math.random() * 1000,
    marketCap: 5000000000 + Math.random() * 500000000000,
  };
}

function analyzeFundamentalExpert(): AgentAnalysis {
  const fundData = generateMockFundamentals();
  const signals = analyzeFundamentals(fundData);
  const score = calculateFundamentalScore(signals);

  const bullishSignals = signals.filter((s) => s.signal === "bullish");
  const bearishSignals = signals.filter((s) => s.signal === "bearish");

  let rec: DecisionType;
  let confidence: number;
  if (score > 60) {
    rec = "buy";
    confidence = Math.min(70 + (score - 60) * 0.5, 95);
  } else if (score < 40) {
    rec = "sell";
    confidence = Math.min(70 + (40 - score) * 0.5, 95);
  } else {
    rec = "hold";
    confidence = 55 + Math.abs(score - 50) * 0.5;
  }

  return {
    agentId: "fundamental",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.round(confidence * 10) / 10,
    reasoning: `النقاط المالية: ${score}/100 - ${bullishSignals.length} إشارات إيجابية، ${bearishSignals.length} سلبية. P/E: ${fundData.peRatio.toFixed(1)}, ROE: ${fundData.roe.toFixed(1)}%, نمو إيرادات: ${fundData.revenueGrowth.toFixed(1)}%`,
    evidence: signals.slice(0, 4).map((s) => `${s.metric}: ${s.value.toFixed(2)} - ${s.description}`),
    riskAssessment: score < 30 ? "high" : score > 70 ? "low" : "medium",
  };
}

function analyzeNewsExpert(): AgentAnalysis {
  const news = generateMockNews();
  const sentiment = analyzeNewsSentiment(news);
  const fgIndex = calculateFearGreedIndex(sentiment, 2, sentiment.score, 0.5);

  let rec: DecisionType;
  let confidence: number;
  if (sentiment.score > 0.15) {
    rec = "buy";
    confidence = 70 + sentiment.confidence * 20;
  } else if (sentiment.score < -0.15) {
    rec = "sell";
    confidence = 70 + sentiment.confidence * 20;
  } else {
    rec = "wait";
    confidence = 55;
  }

  return {
    agentId: "news",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.round(Math.min(confidence, 95) * 10) / 10,
    reasoning: `مؤشر الخوف/الطمع: ${fgIndex.value} (${fgIndex.label}) - المشاعر: ${sentiment.label} (${sentiment.score.toFixed(2)}). ${sentiment.signals.filter(s => s.sentiment === "positive").length} أخبار إيجابية، ${sentiment.signals.filter(s => s.sentiment === "negative").length} سلبية`,
    evidence: sentiment.signals.slice(0, 4).map((s) => `${s.source}: ${s.sentiment === "positive" ? "+" : s.sentiment === "negative" ? "-" : "="} ${s.description}`),
    riskAssessment: sentiment.score < -0.3 ? "high" : sentiment.score > 0.3 ? "low" : "medium",
  };
}

function analyzeTechnicalExpert(): AgentAnalysis {
  const priceData = generateMockPriceData(100);
  const signals = runFullTechnicalAnalysis(priceData);
  const closes = priceData.map((d) => d.close);
  const highs = priceData.map((d) => d.high);
  const lows = priceData.map((d) => d.low);

  const sr = detectSupportResistance(highs, lows);
  const patterns = detectAllPatterns(closes);
  const candlePatterns = detectCandlestickPatterns(priceData);

  const strategies = runAllStrategies(priceData);
  const ensemble = calculateEnsembleDecision(strategies);

  const buySignals = signals.filter((s) => s.signal === "buy");
  const sellSignals = signals.filter((s) => s.signal === "sell");

  let rec: DecisionType;
  if (ensemble.decision === "buy" && ensemble.confidence > 65) rec = "buy";
  else if (ensemble.decision === "sell" && ensemble.confidence > 65) rec = "sell";
  else rec = "hold";

  const combinedConfidence = Math.min(
    (ensemble.confidence * 0.6) + ((signals.reduce((s, sig) => s + (sig.signal === rec ? sig.strength : 0), 0) / Math.max(signals.length, 1)) * 100 * 0.4) + 10,
    95
  );

  return {
    agentId: "technical",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.round(combinedConfidence * 10) / 10,
    reasoning: `Ensemble: ${strategies.length} استراتيجيات (${ensemble.agreement}% اتفاق). ${buySignals.length} مؤشرات شراء، ${sellSignals.length} مؤشرات بيع. ${patterns.length > 0 ? `نمط: ${patterns[0].nameAr}` : candlePatterns.length > 0 ? candlePatterns[0] : ""}`,
    evidence: [
      ...strategies.slice(0, 5).map((s) => `${s.strategyAr}: ${s.signal === "buy" ? "شراء" : s.signal === "sell" ? "بيع" : "محايد"} (${s.confidence}%)`),
      sr.supports.length > 0 ? `دعم: ${sr.supports[0].toFixed(2)}` : "",
      sr.resistances.length > 0 ? `مقاومة: ${sr.resistances[0].toFixed(2)}` : "",
      ...candlePatterns.slice(0, 2),
    ].filter(Boolean),
    riskAssessment: combinedConfidence > 80 ? "low" : combinedConfidence > 60 ? "medium" : "high",
  };
}

function analyzeRiskExpert(): AgentAnalysis {
  const riskParams: RiskParameters = {
    totalCapital: 100000,
    availableCapital: 85000,
    maxRiskPerTrade: 2,
    maxDailyLoss: 5,
    maxOpenPositions: 5,
    currentOpenPositions: 2,
    dailyPnL: 350,
  };

  const entryPrice = 100 + Math.random() * 20;
  const positionResult = calculatePositionSize(riskParams, entryPrice, 2, 4);

  let rec: DecisionType = positionResult.approved ? "hold" : "cancel";
  const confidence = positionResult.approved ? 85 : 100;

  return {
    agentId: "risk",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence,
    reasoning: positionResult.approved
      ? `حجم مقترح: ${positionResult.recommendedSize} وحدة | وقف خسارة: $${positionResult.stopLossPrice.toFixed(2)} | جني أرباح: $${positionResult.takeProfitPrice.toFixed(2)} | نسبة R/R: ${positionResult.riskRewardRatio.toFixed(2)} | مخاطرة: $${positionResult.riskAmount.toFixed(2)}`
      : `🚫 فيتو: ${positionResult.vetoReason}`,
    evidence: [
      `رأس المال: $${riskParams.totalCapital.toLocaleString()} | متاح: $${riskParams.availableCapital.toLocaleString()}`,
      `حد المخاطرة/صفقة: ${riskParams.maxRiskPerTrade}% | الخسارة اليومية: $${riskParams.dailyPnL}`,
      `الصفقات المفتوحة: ${riskParams.currentOpenPositions}/${riskParams.maxOpenPositions}`,
      `نسبة R/R: ${positionResult.riskRewardRatio.toFixed(2)} ${positionResult.riskRewardRatio >= 2 ? "✅ ممتاز" : positionResult.riskRewardRatio >= 1.5 ? "⚠️ مقبول" : "❌ ضعيف"}`,
    ],
    riskAssessment: positionResult.approved ? "medium" : "extreme",
    vetoActive: !positionResult.approved,
  };
}

function analyzeSystemExpert(): AgentAnalysis {
  const health = {
    cpu: 15 + Math.random() * 30,
    memory: 35 + Math.random() * 25,
    latency: 30 + Math.random() * 100,
    dataFreshness: Math.random() * 5,
  };

  const issues: string[] = [];
  if (health.cpu > 80) issues.push("استهلاك معالج مرتفع");
  if (health.memory > 85) issues.push("ذاكرة مرتفعة");
  if (health.latency > 200) issues.push("تأخير بيانات");
  if (health.dataFreshness > 10) issues.push("بيانات قديمة");

  return {
    agentId: "system",
    timestamp: new Date().toISOString(),
    recommendation: issues.length > 1 ? "wait" : "hold",
    confidence: issues.length === 0 ? 96 : 70,
    reasoning: `CPU: ${health.cpu.toFixed(1)}% | RAM: ${health.memory.toFixed(1)}% | Latency: ${health.latency.toFixed(0)}ms | Data Age: ${health.dataFreshness.toFixed(1)}s. ${issues.length > 0 ? "⚠️ " + issues.join(", ") : "✅ النظام يعمل بكفاءة مثالية"}`,
    evidence: [
      `مزود البيانات الرئيسي: متصل ✅`,
      `مزود البيانات الاحتياطي: متصل ✅`,
      `آخر تحديث: ${new Date().toLocaleTimeString("ar-SA")}`,
      issues.length === 0 ? "لا توجد تحذيرات" : `تنبيهات: ${issues.length}`,
    ],
  };
}

function analyzeDecisionExpert(analyses: AgentAnalysis[]): AgentAnalysis {
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  const holdCount = analyses.filter((a) => a.recommendation === "hold").length;
  const waitCount = analyses.filter((a) => a.recommendation === "wait").length;
  const cancelCount = analyses.filter((a) => a.recommendation === "cancel").length;
  const hasVeto = analyses.some((a) => a.vetoActive);

  let rec: DecisionType;
  let confidence: number;
  let reasoning: string;

  if (hasVeto) {
    rec = "cancel";
    confidence = 100;
    reasoning = "🚫 تم تفعيل الفيتو من خبير المخاطر - لا يمكن المضي قدماً بأي ظرف";
  } else if (cancelCount > 0) {
    rec = "wait";
    confidence = 75;
    reasoning = "⚠️ أحد الخبراء (المخاطر) رفض الصفقة - يُنصح بالانتظار";
  } else {
    const avgConfidence = analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length;
    const agreement = Math.max(buyCount, sellCount, holdCount) / analyses.length;

    if (buyCount > sellCount + 1 && agreement > 0.4) {
      rec = "buy";
      confidence = Math.min(65 + agreement * 25 + (avgConfidence / 100) * 10, 95);
      reasoning = `${buyCount} خبراء مع الشراء مقابل ${sellCount} مع البيع - اتفاق ${Math.round(agreement * 100)}%`;
    } else if (sellCount > buyCount + 1 && agreement > 0.4) {
      rec = "sell";
      confidence = Math.min(65 + agreement * 25 + (avgConfidence / 100) * 10, 95);
      reasoning = `${sellCount} خبراء مع البيع مقابل ${buyCount} مع الشراء - اتفاق ${Math.round(agreement * 100)}%`;
    } else {
      rec = "wait";
      confidence = 55;
      reasoning = `تعارض: ${buyCount} شراء | ${sellCount} بيع | ${holdCount} إبقاء | ${waitCount} انتظار - لا يوجد توافق كافٍ`;
    }
  }

  return {
    agentId: "decision",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.round(confidence * 10) / 10,
    reasoning,
    evidence: [
      `توزيع: ${buyCount} شراء | ${sellCount} بيع | ${holdCount} إبقاء | ${waitCount} انتظار | ${cancelCount} إلغاء`,
      hasVeto ? "🚫 فيتو نشط من خبير المخاطر" : "✅ لا توجد فيتوهات",
      `متوسط ثقة الخبراء: ${(analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length).toFixed(1)}%`,
      `أعلى ثقة: ${Math.max(...analyses.map(a => a.confidence)).toFixed(1)}%`,
    ],
  };
}

function runAuditAnalysis(analyses: AgentAnalysis[]): AuditReport {
  const expertPerformanceScores: Record<string, number> = {};
  for (const a of analyses) {
    expertPerformanceScores[a.agentId] = a.confidence;
  }

  const contradictions: string[] = [];
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  if (buyCount >= 2 && sellCount >= 2) {
    contradictions.push(`تضارب: ${buyCount} خبراء مع الشراء و${sellCount} مع البيع - مراجعة مطلوبة`);
  }

  const highRisk = analyses.filter(a => a.riskAssessment === "high" || a.riskAssessment === "extreme");
  if (highRisk.length > 0) {
    contradictions.push(`${highRisk.length} خبراء يشيرون لمخاطر عالية`);
  }

  const complianceViolations: string[] = [];
  const riskAnalysis = analyses.find((a) => a.agentId === "risk");
  if (riskAnalysis?.vetoActive) {
    complianceViolations.push("صفقة تتجاوز حد المخاطرة المسموح به (2% من رأس المال)");
  }

  const anomalies: string[] = [];
  for (const a of analyses) {
    if (a.confidence > 95) anomalies.push(`${a.agentId}: ثقة غير عادية (${a.confidence}%)`);
  }

  return {
    expertPerformanceScores,
    contradictions,
    complianceViolations,
    anomalies,
    dataQualityIssues: [],
  };
}

function generateCEODecision(
  analyses: AgentAnalysis[],
  auditReport: AuditReport
): CEODecision {
  const weights: Record<string, number> = {
    fundamental: 0.18,
    news: 0.12,
    technical: 0.22,
    risk: 0.22,
    system: 0.04,
    decision: 0.22,
  };

  const votes: Record<string, number> = { buy: 0, sell: 0, hold: 0, wait: 0, cancel: 0 };
  for (const a of analyses) {
    const weight = weights[a.agentId] ?? 0.1;
    votes[a.recommendation] += a.confidence * weight;
  }

  const sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const topDecision = sortedVotes[0][0] as DecisionType;

  const totalConfidence = analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length;
  const hasVeto = analyses.some((a) => a.vetoActive);
  const agreement = Math.max(...Object.values(votes)) / Object.values(votes).reduce((a, b) => a + b, 0);

  if (hasVeto) {
    return {
      decision: "cancel",
      confidence: 100,
      summary: "🚫 تم تفعيل الفيتو من خبير المخاطر - الصفقة مرفوضة",
      reasoning: analyses.find((a) => a.vetoActive)?.reasoning ?? "تم تجاوز حد المخاطرة",
      risks: ["تجاوز حد المخاطرة المسموح به (2% من رأس المال)", "النسبة R/R أقل من 1.5"],
      alternatives: ["تقليل حجم الصفقة", "انتظار فرصة أفضل", "تعديل وقف الخسارة للتقرب من السعر"],
    };
  }

  const summaries: Record<DecisionType, string> = {
    buy: `شراء مُوصى به بثقة ${Math.round(totalConfidence)}% - توافق ${Math.round(agreement * 100)}% من الخبراء`,
    sell: `بيع مُوصى به بثقة ${Math.round(totalConfidence)}% - توافق ${Math.round(agreement * 100)}% من الخبراء`,
    hold: "الإبقاء على الوضع الحالي - بيانات متوازنة لا تبرر التغيير",
    wait: "الانتظار مُوصى به - لا يوجد توافق كافٍ بين الخبراء",
    cancel: "إلغاء بسبب المخاطر العالية",
  };

  const riskMessages = analyses
    .filter((a) => a.riskAssessment === "high" || a.riskAssessment === "extreme")
    .map((a) => {
      const expert = agentRegistry.find((e) => e.id === a.agentId);
      return `${expert?.nameAr}: مخاطر ${a.riskAssessment === "extreme" ? "قصوى" : "عالية"}`;
    });

  return {
    decision: topDecision,
    confidence: Math.round(totalConfidence * 10) / 10,
    summary: summaries[topDecision],
    reasoning: analyses
      .slice(0, 4)
      .map((a) => {
        const expert = agentRegistry.find((e) => e.id === a.agentId);
        return `${expert?.icon} ${expert?.nameAr}: ${a.reasoning}`;
      })
      .join("\n"),
    risks: riskMessages.length > 0 ? riskMessages : ["لا توجد مخاطر جوهرية مكتشفة"],
    alternatives: [
      "تعديل حجم الصفقة بناءً على توصية Kelly Criterion",
      "تحديد وقف خسارة عند أقرب مستوى دعم",
      "الانتظار لتأكيد إضافي من التحليل متعدد الأطر الزمنية",
      "وضع أمر معلق (Limit Order) عند السعر المثالي",
    ],
  };
}

export async function runConsultation(
  query: string,
  asset?: string
): Promise<WarRoomSession> {
  const sessionId = `session-${Date.now()}`;
  const analyses: AgentAnalysis[] = [];

  analyses.push(analyzeFundamentalExpert());
  analyses.push(analyzeNewsExpert());
  analyses.push(analyzeTechnicalExpert());
  analyses.push(analyzeRiskExpert());
  analyses.push(analyzeSystemExpert());
  analyses.push(analyzeDecisionExpert(analyses));

  const auditReport = runAuditAnalysis(analyses);
  const ceoDecision = generateCEODecision(analyses, auditReport);

  const session: WarRoomSession = {
    id: sessionId,
    timestamp: new Date().toISOString(),
    query,
    asset,
    status: "decided",
    expertAnalyses: analyses,
    ceoDecision,
    auditReport,
  };

  saveSession(session);
  return session;
}

export function getAgentById(id: string): ExpertAgent | undefined {
  return agentRegistry.find((a) => a.id === id);
}

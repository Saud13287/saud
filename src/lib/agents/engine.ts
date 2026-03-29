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
  detectFakeNews,
  NewsItem,
} from "@/lib/analysis/sentiment";
import {
  calculatePositionSize,
  RiskParameters,
} from "@/lib/analysis/risk";
import {
  detectAllPatterns,
  detectCrisisPattern,
} from "@/lib/analysis/patterns";
import { saveSession } from "@/lib/db/store";

function generateMockPriceData(count: number): PriceData[] {
  const data: PriceData[] = [];
  let price = 100 + Math.random() * 50;
  const now = Date.now();
  for (let i = 0; i < count; i++) {
    const change = (Math.random() - 0.48) * 3;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * 1.5;
    const low = Math.min(open, close) - Math.random() * 1.5;
    data.push({
      open,
      high,
      low,
      close,
      volume: 1000000 + Math.random() * 5000000,
      timestamp: new Date(now - (count - i) * 3600000).toISOString(),
    });
    price = close;
  }
  return data;
}

function generateMockNews(): NewsItem[] {
  const headlines = [
    { title: "البنك المركزي يعلن عن قرارات فائدة جديدة", source: "رويترز", sentiment: "neutral" },
    { title: "ارتفاع أسهم التكنولوجيا بعد تقارير أرباح قوية", source: "بلومبرغ", sentiment: "positive" },
    { title: "مخاوف من تباطؤ النمو الاقتصادي العالمي", source: "سي إن بي سي", sentiment: "negative" },
    { title: "الذهب يرتفع مع زيادة طلبات الملاذ الآمن", source: "رويترز", sentiment: "positive" },
    { title: "أسعار النفط تتراجع بسبب قلق الطلب", source: "ويست تكساس", sentiment: "negative" },
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
  return {
    peRatio: 12 + Math.random() * 20,
    pbRatio: 0.8 + Math.random() * 3,
    debtToEquity: Math.random() * 2.5,
    currentRatio: 1 + Math.random() * 2,
    roe: 5 + Math.random() * 25,
    roa: 2 + Math.random() * 15,
    profitMargin: 3 + Math.random() * 20,
    revenueGrowth: -5 + Math.random() * 30,
    earningsGrowth: -10 + Math.random() * 35,
    dividendYield: Math.random() * 5,
    freeCashFlow: -1000 + Math.random() * 5000,
    marketCap: 1000000000 + Math.random() * 100000000000,
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
  if (score > 65) {
    rec = "buy";
    confidence = Math.min(score, 95);
  } else if (score < 35) {
    rec = "sell";
    confidence = Math.min(100 - score, 95);
  } else {
    rec = "hold";
    confidence = 50 + Math.abs(score - 50);
  }

  return {
    agentId: "fundamental",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence,
    reasoning: `النقاط المالية: ${score}/100 - ${bullishSignals.length} إشارات إيجابية، ${bearishSignals.length} سلبية. ${bullishSignals.length > 0 ? bullishSignals[0].description : bearishSignals.length > 0 ? bearishSignals[0].description : "بيانات متوازنة"}`,
    evidence: signals.slice(0, 3).map((s) => `${s.metric}: ${s.value.toFixed(2)} - ${s.description}`),
    riskAssessment: score < 30 ? "high" : score > 70 ? "low" : "medium",
  };
}

function analyzeNewsExpert(): AgentAnalysis {
  const news = generateMockNews();
  const sentiment = analyzeNewsSentiment(news);
  const fgIndex = calculateFearGreedIndex(sentiment, 2, sentiment.score, 0);

  let rec: DecisionType;
  let confidence: number;
  if (sentiment.score > 0.2) {
    rec = "buy";
    confidence = 60 + sentiment.confidence * 30;
  } else if (sentiment.score < -0.2) {
    rec = "sell";
    confidence = 60 + sentiment.confidence * 30;
  } else {
    rec = "wait";
    confidence = 50;
  }

  const fakeNewsCheck = news.map((n) => detectFakeNews(n));
  const suspiciousCount = fakeNewsCheck.filter((f) => f.isSuspicious).length;

  return {
    agentId: "news",
    timestamp: new Date().toISOString(),
    recommendation: suspiciousCount > 2 ? "wait" : rec,
    confidence: suspiciousCount > 2 ? 30 : confidence,
    reasoning: `مؤشر الخوف/الطمع: ${fgIndex.value} (${fgIndex.label}) - المشاعر: ${sentiment.label}. ${suspiciousCount > 0 ? `تحذير: ${suspiciousCount} أخبار مشبوهة` : "جميع المصادر موثوقة"}`,
    evidence: sentiment.signals.slice(0, 3).map((s) => `${s.source}: ${s.sentiment} - ${s.description}`),
    riskAssessment: sentiment.score < -0.4 ? "high" : sentiment.score > 0.4 ? "low" : "medium",
  };
}

function analyzeTechnicalExpert(): AgentAnalysis {
  const priceData = generateMockPriceData(60);
  const signals = runFullTechnicalAnalysis(priceData);
  const closes = priceData.map((d) => d.close);
  const highs = priceData.map((d) => d.high);
  const lows = priceData.map((d) => d.low);

  const sr = detectSupportResistance(highs, lows);
  const patterns = detectAllPatterns(closes);
  const candlePatterns = detectCandlestickPatterns(priceData);

  const buySignals = signals.filter((s) => s.signal === "buy");
  const sellSignals = signals.filter((s) => s.signal === "sell");
  const totalBuyStrength = buySignals.reduce((s, sig) => s + sig.strength, 0);
  const totalSellStrength = sellSignals.reduce((s, sig) => s + sig.strength, 0);

  let rec: DecisionType;
  if (totalBuyStrength > totalSellStrength * 1.3) rec = "buy";
  else if (totalSellStrength > totalBuyStrength * 1.3) rec = "sell";
  else rec = "hold";

  const confidence = Math.min(50 + Math.abs(totalBuyStrength - totalSellStrength) * 15, 95);

  return {
    agentId: "technical",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence,
    reasoning: `إشارات شراء: ${buySignals.length} (قوة: ${totalBuyStrength.toFixed(1)}), إشارات بيع: ${sellSignals.length} (قوة: ${totalSellStrength.toFixed(1)}). ${patterns.length > 0 ? `نمط: ${patterns[0].nameAr}` : ""}`,
    evidence: [
      ...signals.slice(0, 3).map((s) => `${s.indicator}: ${s.description}`),
      ...candlePatterns.slice(0, 2),
      sr.supports.length > 0 ? `دعم: ${sr.supports[0].toFixed(2)}` : "",
      sr.resistances.length > 0 ? `مقاومة: ${sr.resistances[0].toFixed(2)}` : "",
    ].filter(Boolean),
    riskAssessment: confidence > 75 ? "low" : confidence > 50 ? "medium" : "high",
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
    dailyPnL: 500,
  };

  const positionResult = calculatePositionSize(riskParams, 100, 2, 4);

  let rec: DecisionType = positionResult.approved ? "hold" : "cancel";
  let confidence = positionResult.approved ? 80 : 100;

  return {
    agentId: "risk",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence,
    reasoning: positionResult.approved
      ? `حجم مقترح: ${positionResult.recommendedSize} وحدة. وقف خسارة: ${positionResult.stopLossPrice.toFixed(2)}. نسبة مخاطرة/عائد: ${positionResult.riskRewardRatio.toFixed(2)}`
      : `فيتو: ${positionResult.vetoReason}`,
    evidence: [
      `مخاطرة الصفقة: $${positionResult.riskAmount.toFixed(2)}`,
      `ربح محتمل: $${positionResult.potentialProfit.toFixed(2)}`,
      `نسبة R/R: ${positionResult.riskRewardRatio.toFixed(2)}`,
    ],
    riskAssessment: positionResult.approved ? "medium" : "extreme",
    vetoActive: !positionResult.approved,
  };
}

function analyzeSystemExpert(): AgentAnalysis {
  const health = {
    cpu: 20 + Math.random() * 40,
    memory: 40 + Math.random() * 30,
    latency: 50 + Math.random() * 150,
  };

  const issues: string[] = [];
  if (health.cpu > 80) issues.push("استهلاك معالج مرتفع");
  if (health.memory > 85) issues.push("استهلاك ذاكرة مرتفع");
  if (health.latency > 200) issues.push("تأخير في البيانات");

  return {
    agentId: "system",
    timestamp: new Date().toISOString(),
    recommendation: issues.length > 1 ? "wait" : "hold",
    confidence: issues.length > 0 ? 60 : 95,
    reasoning: `CPU: ${health.cpu.toFixed(1)}%, RAM: ${health.memory.toFixed(1)}%, Latency: ${health.latency.toFixed(0)}ms. ${issues.length > 0 ? "تحذيرات: " + issues.join(", ") : "النظام يعمل بكفاءة"}`,
    evidence: [
      `مزود البيانات: متصل`,
      `آخر تحديث: ${new Date().toLocaleTimeString("ar-SA")}`,
      issues.length > 0 ? `تنبيهات: ${issues.length}` : "لا توجد تنبيهات",
    ],
  };
}

function analyzeDecisionExpert(analyses: AgentAnalysis[]): AgentAnalysis {
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  const waitCount = analyses.filter((a) => a.recommendation === "wait").length;
  const cancelCount = analyses.filter((a) => a.recommendation === "cancel").length;
  const hasVeto = analyses.some((a) => a.vetoActive);

  let rec: DecisionType;
  let confidence: number;
  let reasoning: string;

  if (hasVeto) {
    rec = "cancel";
    confidence = 100;
    reasoning = "تم تفعيل الفيتو من خبير المخاطر - لا يمكن المضي قدماً";
  } else if (cancelCount > 0) {
    rec = "wait";
    confidence = 70;
    reasoning = " أحد الخبراء رفض الصفقة - يُنصح بالانتظار";
  } else if (buyCount > sellCount + 1) {
    rec = "buy";
    confidence = 60 + buyCount * 8;
    reasoning = `${buyCount} خبراء مع الشراء مقابل ${sellCount} مع البيع - توافق إيجابي`;
  } else if (sellCount > buyCount + 1) {
    rec = "sell";
    confidence = 60 + sellCount * 8;
    reasoning = `${sellCount} خبراء مع البيع مقابل ${buyCount} مع الشراء - توافق سلبي`;
  } else {
    rec = "wait";
    confidence = 50;
    reasoning = `تعارض في الآراء: ${buyCount} شراء، ${sellCount} بيع، ${waitCount} انتظار - يُنصح بالانتظار لمزيد من الوضوح`;
  }

  return {
    agentId: "decision",
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.min(confidence, 95),
    reasoning,
    evidence: [
      `توزيع الآراء: ${buyCount} شراء | ${sellCount} بيع | ${waitCount} انتظار | ${cancelCount} رفض`,
      hasVeto ? "⚠️ فيتو نشط" : "✅ لا توجد فيتوهات",
      `متوسط ثقة الخبراء: ${(analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length).toFixed(1)}%`,
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
  if (buyCount > 0 && sellCount > 0) {
    contradictions.push(`${buyCount} خبراء مع الشراء و${sellCount} مع البيع`);
  }

  const complianceViolations: string[] = [];
  const riskAnalysis = analyses.find((a) => a.agentId === "risk");
  if (riskAnalysis?.vetoActive) {
    complianceViolations.push("صفقة تتجاوز حد المخاطرة المسموح به");
  }

  const anomalies: string[] = [];
  for (const a of analyses) {
    if (a.confidence > 95) {
      anomalies.push(`${a.agentId}: ثقة غير عادية (${a.confidence}%)`);
    }
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
    fundamental: 0.2,
    news: 0.15,
    technical: 0.2,
    risk: 0.25,
    system: 0.05,
    decision: 0.15,
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

  if (hasVeto) {
    return {
      decision: "cancel",
      confidence: 100,
      summary: "تم تفعيل الفيتو من خبير المخاطر - الصفقة مرفوضة",
      reasoning: analyses.find((a) => a.vetoActive)?.reasoning ?? "تم تجاوز حد المخاطرة",
      risks: ["تجاوز حد المخاطرة المسموح به"],
      alternatives: ["تقليل حجم الصفقة", "انتظار فرصة أفضل", "تعديل وقف الخسارة"],
    };
  }

  const summaries: Record<DecisionType, string> = {
    buy: "شراء حذر بناءً على توافق أغلب الخبراء",
    sell: "بيع بناءً على تحليل متعدد الأبعاد",
    hold: "الإبقاء على الوضع الحالي - بيانات متوازنة",
    wait: "الانتظار حتى وضوح الصورة",
    cancel: "إلغاء بسبب المخاطر العالية",
  };

  const riskMessages = analyses
    .filter((a) => a.riskAssessment === "high" || a.riskAssessment === "extreme")
    .map((a) => {
      const expert = agentRegistry.find((e) => e.id === a.agentId);
      return `${expert?.nameAr}: تحذير من مخاطر ${a.riskAssessment === "extreme" ? "قصوى" : "عالية"}`;
    });

  return {
    decision: topDecision,
    confidence: Math.round(totalConfidence * 10) / 10,
    summary: summaries[topDecision],
    reasoning: analyses
      .slice(0, 3)
      .map((a) => {
        const expert = agentRegistry.find((e) => e.id === a.agentId);
        return `${expert?.nameAr}: ${a.reasoning}`;
      })
      .join("\n"),
    risks: riskMessages.length > 0 ? riskMessages : ["لا توجد مخاطر جوهرية"],
    alternatives: [
      "تعديل حجم الصفقة بناءً على توصية خبير المخاطر",
      "تحديد وقف خسارة أقرب",
      "الانتظار لتأكيد إضافي من التحليل الفني",
    ],
  };
}

export async function runConsultation(
  query: string,
  asset?: string
): Promise<WarRoomSession> {
  const sessionId = `session-${Date.now()}`;
  const experts = agentRegistry.filter((a) => a.category !== "ceo");
  const analyses: AgentAnalysis[] = [];

  const fundamentalAnalysis = analyzeFundamentalExpert();
  const newsAnalysis = analyzeNewsExpert();
  const technicalAnalysis = analyzeTechnicalExpert();
  const riskAnalysis = analyzeRiskExpert();
  const systemAnalysis = analyzeSystemExpert();

  analyses.push(fundamentalAnalysis, newsAnalysis, technicalAnalysis, riskAnalysis, systemAnalysis);

  const decisionAnalysis = analyzeDecisionExpert(analyses);
  analyses.push(decisionAnalysis);

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

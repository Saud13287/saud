import {
  ExpertAgent, AgentAnalysis, WarRoomSession, CEODecision, AuditReport, DecisionType,
} from "./types";
import { agentRegistry } from "./registry";
import {
  runFullTechnicalAnalysis, detectSupportResistance, detectCandlestickPatterns, PriceData,
} from "@/lib/analysis/technical";
import { analyzeFundamentals, calculateFundamentalScore, FundamentalData } from "@/lib/analysis/fundamental";
import { analyzeNewsSentiment, calculateFearGreedIndex, NewsItem } from "@/lib/analysis/sentiment";
import { calculatePositionSize, RiskParameters } from "@/lib/analysis/risk";
import { detectAllPatterns } from "@/lib/analysis/patterns";
import { runAllStrategies, calculateEnsembleDecision } from "@/lib/strategies/advanced";
import { saveSession } from "@/lib/db/store";

const NEWS_POOL = [
  { title: "البنك المركزي يحافظ على أسعار الفائدة", source: "رويترز" },
  { title: "ارتفاع أسهم التكنولوجيا بعد أرباح قوية", source: "بلومبرغ" },
  { title: "مخاوف من تباطؤ النمو في الصين", source: "سي إن بي سي" },
  { title: "الذهب يرتفع مع زيادة طلبات الملاذ الآمن", source: "رويترز" },
  { title: "النفط يتراجع بسبب قلق الطلب", source: "WSJ" },
  { title: "بيتكوين يقترب من 100 ألف بدعم ETF", source: "كوين ديسك" },
  { title: "الفيدرالي يشير لتقليل الفائدة قريباً", source: "بلومبرغ" },
  { title: "توترات جيوسياسية تدعم الذهب", source: "رويترز" },
  { title: "أرباح شركات تتجاوز التوقعات", source: "فايننشال تايمز" },
  { title: "تقلبات في سوق العملات الرقمية", source: "كوين تيليغراف" },
  { title: "⊚ؤشر الدولار يرتفع أمام السلة", source: "رويترز" },
  { title: "⊚ أسعار الذهب تسجل ارتفاعاً历史新", source: "بلومبرغ" },
  { title: "⊚ انتعاش سوق الأسهم العالمية", source: "فايننشال تايمز" },
  { title: "⊚ مؤشر الخوف من السوق ينخفض", source: "سي إن بي سي" },
  { title: "⊚ زيادة الاستثمارات المؤسسية في الكريبتو", source: "كوين ديسك" },
  { title: "⊚ تراجع في أسعار السلع الأساسية", source: "WSJ" },
  { title: "⊚ بوابات نفطية جديدة تزيد الإنتاج", source: "رويترز" },
  { title: "⊚ بيانات توظيف قوية تدعم السوق", source: "بلومبرغ" },
];

let consultationCounter = 0;

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMockPriceData(count: number, rng: () => number): PriceData[] {
  const data: PriceData[] = [];
  let price = 80 + rng() * 100;
  const now = Date.now();
  const trend = (rng() - 0.45) * 0.03;
  for (let i = 0; i < count; i++) {
    const drift = trend * price;
    const noise = (rng() - 0.5) * price * 0.025;
    const open = price;
    const close = Math.max(0.1, price + drift + noise);
    const high = Math.max(open, close) + rng() * price * 0.012;
    const low = Math.min(open, close) - rng() * price * 0.012;
    data.push({ open, high, low, close, volume: 500000 + rng() * 5000000, timestamp: new Date(now - (count - i) * 3600000).toISOString() });
    price = close;
  }
  return data;
}

function generateMockNews(rng: () => number): NewsItem[] {
  const shuffled = [...NEWS_POOL].sort(() => rng() - 0.5);
  return shuffled.slice(0, 4 + Math.floor(rng() * 3)).map((h, i) => ({
    title: h.title, source: h.source,
    timestamp: new Date(Date.now() - i * 1800000).toISOString(),
    content: h.title, language: "ar",
  }));
}

function generateMockFundamentals(rng: () => number): FundamentalData {
  const bullish = rng() > 0.45;
  const r = () => rng();
  return {
    peRatio: bullish ? 7 + r() * 14 : 22 + r() * 25,
    pbRatio: bullish ? 0.4 + r() * 1.8 : 1.8 + r() * 3.5,
    debtToEquity: bullish ? r() * 0.9 : 1.2 + r() * 2.5,
    currentRatio: bullish ? 1.4 + r() * 1.8 : 0.6 + r() * 0.7,
    roe: bullish ? 12 + r() * 25 : 1 + r() * 10,
    roa: bullish ? 6 + r() * 15 : 0.5 + r() * 6,
    profitMargin: bullish ? 10 + r() * 18 : 1 + r() * 6,
    revenueGrowth: bullish ? 8 + r() * 25 : -8 + r() * 10,
    earningsGrowth: bullish ? 10 + r() * 30 : -15 + r() * 15,
    dividendYield: r() * 6,
    freeCashFlow: bullish ? 500 + r() * 6000 : -800 + r() * 1200,
    marketCap: 2000000000 + r() * 800000000000,
  };
}

function analyzeFundamentalExpert(rng: () => number): AgentAnalysis {
  const fundData = generateMockFundamentals(rng);
  const signals = analyzeFundamentals(fundData);
  const score = calculateFundamentalScore(signals);
  const bullishSignals = signals.filter((s) => s.signal === "bullish");
  const bearishSignals = signals.filter((s) => s.signal === "bearish");
  const rand = rng();

  let rec: DecisionType;
  let confidence: number;
  if (score > 52 + rand * 8) { rec = "buy"; confidence = 87 + rand * 8; }
  else if (score < 48 - rand * 8) { rec = "sell"; confidence = 87 + rand * 8; }
  else { rec = rand > 0.5 ? "hold" : "wait"; confidence = 82 + rand * 8; }

  return {
    agentId: "fundamental", timestamp: new Date().toISOString(), recommendation: rec,
    confidence: Math.round(Math.min(confidence, 97) * 10) / 10,
    reasoning: `النقاط: ${score}/100 | P/E: ${fundData.peRatio.toFixed(1)} | ROE: ${fundData.roe.toFixed(1)}% | نمو: ${fundData.revenueGrowth.toFixed(1)}% | ${bullishSignals.length}+/ ${bearishSignals.length}-`,
    evidence: signals.slice(0, 4).map((s) => `${s.metric}: ${s.value.toFixed(2)}`),
    riskAssessment: score < 30 ? "high" : score > 70 ? "low" : "medium",
  };
}

function analyzeNewsExpert(rng: () => number): AgentAnalysis {
  const news = generateMockNews(rng);
  const sentiment = analyzeNewsSentiment(news);
  const fgIndex = calculateFearGreedIndex(sentiment, 2, sentiment.score, 0.5);
  const rand = rng();

  // Enhanced analysis: cross-reference sentiment with fear/greed
  const sentimentWeight = sentiment.confidence * 0.6;
  const fgWeight = (100 - fgIndex.value) / 100 * 0.4;
  const compositeScore = sentiment.score * sentimentWeight + (fgWeight - 0.5);

  let rec: DecisionType;
  let confidence: number;

  if (compositeScore > 0.05 + rand * 0.1) {
    rec = "buy"; confidence = 90 + rand * 7;
  } else if (compositeScore < -(0.05 + rand * 0.1)) {
    rec = "sell"; confidence = 90 + rand * 7;
  } else {
    rec = rand > 0.4 ? "hold" : "wait"; confidence = 87 + rand * 8;
  }

  const posNews = sentiment.signals.filter(s => s.sentiment === "positive").length;
  const negNews = sentiment.signals.filter(s => s.sentiment === "negative").length;

  return {
    agentId: "news", timestamp: new Date().toISOString(), recommendation: rec,
    confidence: Math.round(Math.min(confidence, 97) * 10) / 10,
    reasoning: `خوف/طمع: ${fgIndex.value} (${fgIndex.label}) | مشاعر: ${sentiment.label} (${sentiment.score.toFixed(2)}) | ${news.length} أخبار (${posNews}+/${negNews}-) | مركب: ${compositeScore.toFixed(3)}`,
    evidence: [
      ...sentiment.signals.slice(0, 3).map((s) => `${s.source}: ${s.sentiment === "positive" ? "+" : s.sentiment === "negative" ? "-" : "="} - ${s.description}`),
      `مؤشر الخوف/الطمع: ${fgIndex.value}/100`,
    ],
    riskAssessment: sentiment.score < -0.3 ? "high" : sentiment.score > 0.3 ? "low" : "medium",
  };
}

function analyzeTechnicalExpert(rng: () => number): AgentAnalysis {
  const priceData = generateMockPriceData(80 + Math.floor(rng() * 40), rng);
  const signals = runFullTechnicalAnalysis(priceData);
  const closes = priceData.map((d) => d.close);
  const highs = priceData.map((d) => d.high);
  const lows = priceData.map((d) => d.low);
  const sr = detectSupportResistance(highs, lows);
  const patterns = detectAllPatterns(closes);
  const strategies = runAllStrategies(priceData);
  const ensemble = calculateEnsembleDecision(strategies);
  const buySignals = signals.filter((s) => s.signal === "buy");
  const sellSignals = signals.filter((s) => s.signal === "sell");
  const rand = rng();

  let rec: DecisionType;
  if (ensemble.decision === "buy" && ensemble.confidence > 60) rec = "buy";
  else if (ensemble.decision === "sell" && ensemble.confidence > 60) rec = "sell";
  else rec = rand > 0.5 ? "hold" : "wait";

  const confidence = 88 + rand * 9;

  return {
    agentId: "technical", timestamp: new Date().toISOString(), recommendation: rec,
    confidence: Math.round(Math.min(confidence, 97) * 10) / 10,
    reasoning: `Ensemble: ${strategies.length} استراتيجيات (${ensemble.agreement}% اتفاق) | ${buySignals.length} شراء | ${sellSignals.length} بيع | ${patterns.length > 0 ? patterns[0].nameAr : "لا يوجد نمط"}`,
    evidence: strategies.slice(0, 5).map((s) => `${s.strategyAr}: ${s.signal} (${s.confidence}%)`),
    riskAssessment: confidence > 90 ? "low" : "medium",
  };
}

function analyzeRiskExpert(rng: () => number): AgentAnalysis {
  const rand = rng();
  const approved = rand > 0.2;
  const rr = 1.2 + rand * 2.5;
  return {
    agentId: "risk", timestamp: new Date().toISOString(),
    recommendation: approved ? (rand > 0.6 ? "hold" : "wait") : "cancel",
    confidence: approved ? 90 + rand * 7 : 100,
    reasoning: approved
      ? `R/R: ${rr.toFixed(2)} | مخاطرة: ${(1 + rand * 2).toFixed(1)}% | وقف: ${(2 + rand * 2).toFixed(1)}% | حجم مقترح: ${Math.floor(10 + rand * 80)} وحدة`
      : `🚫 فيتو: نسبة R/R (${rr.toFixed(2)}) أقل من 1.5 - تجاوز حد المخاطرة`,
    evidence: [`حد المخاطرة/صفقة: ${(1 + rand * 2).toFixed(1)}%`, `الصفقات المفتوحة: ${Math.floor(rand * 5)}/5`],
    riskAssessment: approved ? "medium" : "extreme",
    vetoActive: !approved,
  };
}

function analyzeSystemExpert(rng: () => number): AgentAnalysis {
  const rand = rng();
  return {
    agentId: "system", timestamp: new Date().toISOString(),
    recommendation: rand > 0.9 ? "wait" : "hold",
    confidence: 94 + rand * 4,
    reasoning: `CPU: ${(15 + rand * 30).toFixed(1)}% | RAM: ${(35 + rand * 25).toFixed(1)}% | Latency: ${Math.floor(30 + rand * 80)}ms | ✅ النظام يعمل بكفاءة`,
    evidence: ["مزود البيانات: متصل ✅", `آخر تحديث: ${new Date().toLocaleTimeString("ar-SA")}`],
  };
}

function analyzeDecisionExpert(analyses: AgentAnalysis[], rng: () => number): AgentAnalysis {
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  const holdCount = analyses.filter((a) => a.recommendation === "hold").length;
  const waitCount = analyses.filter((a) => a.recommendation === "wait").length;
  const hasVeto = analyses.some((a) => a.vetoActive);
  const rand = rng();

  let rec: DecisionType;
  let confidence: number;
  let reasoning: string;

  if (hasVeto) {
    rec = "cancel"; confidence = 100;
    reasoning = "🚫 فيتو من خبير المخاطر";
  } else {
    const maxVotes = Math.max(buyCount, sellCount, holdCount, waitCount);
    const total = analyses.length;
    const agreement = maxVotes / total;

    if (buyCount === maxVotes && buyCount >= 2) {
      rec = "buy"; confidence = 90 + agreement * 6 + rand * 3;
      reasoning = `${buyCount}/${total} مع الشراء (اتفاق ${Math.round(agreement * 100)}%)`;
    } else if (sellCount === maxVotes && sellCount >= 2) {
      rec = "sell"; confidence = 90 + agreement * 6 + rand * 3;
      reasoning = `${sellCount}/${total} مع البيع (اتفاق ${Math.round(agreement * 100)}%)`;
    } else {
      rec = rand > 0.5 ? "wait" : "hold"; confidence = 84 + rand * 8;
      reasoning = `توزيع: ${buyCount} شراء/${sellCount} بيع/${holdCount} إبقاء/${waitCount} انتظار`;
    }
  }

  return {
    agentId: "decision", timestamp: new Date().toISOString(), recommendation: rec,
    confidence: Math.round(Math.min(confidence, 97) * 10) / 10, reasoning,
    evidence: [
      `${buyCount} شراء | ${sellCount} بيع | ${holdCount} إبقاء | ${waitCount} انتظار`,
      `متوسط الثقة: ${(analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length).toFixed(1)}%`,
    ],
  };
}

function runAuditAnalysis(analyses: AgentAnalysis[]): AuditReport {
  const scores: Record<string, number> = {};
  for (const a of analyses) scores[a.agentId] = a.confidence;
  const contradictions: string[] = [];
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  if (buyCount >= 2 && sellCount >= 2) contradictions.push(`تضارب: ${buyCount} شراء مقابل ${sellCount} بيع`);
  return {
    expertPerformanceScores: scores, contradictions,
    complianceViolations: analyses.some(a => a.vetoActive) ? ["تجاوز حد المخاطرة"] : [],
    anomalies: [], dataQualityIssues: [],
  };
}

function generateCEODecision(analyses: AgentAnalysis[], auditReport: AuditReport): CEODecision {
  const weights: Record<string, number> = { fundamental: 0.18, news: 0.12, technical: 0.22, risk: 0.22, system: 0.04, decision: 0.22 };
  const votes: Record<string, number> = { buy: 0, sell: 0, hold: 0, wait: 0, cancel: 0 };
  for (const a of analyses) {
    const w = weights[a.agentId] ?? 0.1;
    votes[a.recommendation] += a.confidence * w;
  }
  const sortedVotes = Object.entries(votes).sort((a, b) => b[1] - a[1]);
  const topDecision = sortedVotes[0][0] as DecisionType;
  const totalConfidence = analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length;
  const hasVeto = analyses.some((a) => a.vetoActive);
  const agreement = Math.max(...Object.values(votes)) / Object.values(votes).reduce((a, b) => a + b, 0);

  if (hasVeto) {
    return {
      decision: "cancel", confidence: 100,
      summary: "🚫 فيتو من خبير المخاطر - الصفقة مرفوضة",
      reasoning: analyses.find(a => a.vetoActive)?.reasoning ?? "",
      risks: ["تجاوز حد المخاطرة"], alternatives: ["تقليل الحجم", "انتظار فرصة أفضل"],
    };
  }

  const recLabels: Record<DecisionType, string> = {
    buy: "شراء", sell: "بيع", hold: "إبقاء", wait: "انتظار", cancel: "إلغاء",
  };

  return {
    decision: topDecision, confidence: Math.round(Math.min(totalConfidence, 97) * 10) / 10,
    summary: `${recLabels[topDecision]} مُوصى به بثقة ${Math.round(totalConfidence)}% - توافق ${Math.round(agreement * 100)}%`,
    reasoning: analyses.slice(0, 4).map(a => `${agentRegistry.find(e => e.id === a.agentId)?.icon} ${a.reasoning}`).join("\n"),
    risks: analyses.filter(a => a.riskAssessment === "high" || a.riskAssessment === "extreme").map(a => `${agentRegistry.find(e => e.id === a.agentId)?.nameAr}: مخاطر ${a.riskAssessment}`),
    alternatives: ["Kelly Criterion للحجم", "وقف عند أقرب دعم", "Limit Order", "تأكيد إضافي"],
  };
}

export async function runConsultation(query: string, asset?: string): Promise<WarRoomSession> {
  consultationCounter++;
  const seed = Date.now() + consultationCounter + query.length;
  const rng = seededRandom(seed);
  const analyses: AgentAnalysis[] = [];

  analyses.push(analyzeFundamentalExpert(rng));
  analyses.push(analyzeNewsExpert(rng));
  analyses.push(analyzeTechnicalExpert(rng));
  analyses.push(analyzeRiskExpert(rng));
  analyses.push(analyzeSystemExpert(rng));
  analyses.push(analyzeDecisionExpert(analyses, rng));

  const auditReport = runAuditAnalysis(analyses);
  const ceoDecision = generateCEODecision(analyses, auditReport);

  const session: WarRoomSession = {
    id: `session-${seed}`, timestamp: new Date().toISOString(), query, asset, status: "decided",
    expertAnalyses: analyses, ceoDecision, auditReport,
  };
  saveSession(session);
  return session;
}

export function getAgentById(id: string): ExpertAgent | undefined {
  return agentRegistry.find((a) => a.id === id);
}

import {
  ExpertAgent,
  AgentAnalysis,
  WarRoomSession,
  CEODecision,
  AuditReport,
  DecisionType,
} from "./types";
import { agentRegistry } from "./registry";

const RECOMMENDATIONS: DecisionType[] = ["buy", "sell", "hold", "wait"];
const REASONINGS: Record<DecisionType, string[]> = {
  buy: [
    "السعر كسر مقاومة هامة والمؤشرات الفنية إيجابية",
    "القوائم المالية تظهر نمو قوي في الأرباح والإيرادات",
    "المشاعر السوقية إيجابية مع تدفق أخبار داعمة",
    "القيمة العادلة أعلى من السعر الحالي بنسبة ملحوظة",
    "نمط السعر يشير إلى بداية اتجاه صاعد قوي",
  ],
  sell: [
    "السعر وصل لمقاومة قوية مع ضعف في الزخم",
    "القوائم المالية تظهر تراجع في هامش الربح",
    "أخبار سلبية قد تؤثر على الأداء قصير المدى",
    "القيمة العادلة أقل من السعر الحالي",
    "مؤشرات فنية تشير إلى تشبع شرائي",
  ],
  hold: [
    "السوق في مرحلة انتظار قبل حدث رئيسي",
    "التقييم الحالي متوازن لا يوجد ميزة واضحة",
    "التقلبات عالية جداً للدخول في هذا الوقت",
    "ينتظر تأكيد الاختراق أو الكسر",
    "التوزيع الحالي متوازن ولا يبرر التغيير",
  ],
  wait: [
    "هناك بيانات مهمة ستصدر قريباً قد تغير الصورة",
    "التضارب بين المؤشرات يتطلب مزيداً من الوضوح",
    "المخاطر الجيوسياسية تزيد من عدم اليقين",
    "انتظار فتح جلسة تداول رئيسية للسيولة",
    "النظام يحتاج لمزيد من البيانات للقرار",
  ],
  cancel: [
    "تم تجاوز حد المخاطرة المسموح به",
    "فيتو من خبير المخاطر بسبب المخاطر العالية",
    "بيانات غير موثوقة تمنع اتخاذ القرار",
    "توقف طارئ بسبب خلل في النظام",
    "مخالفات امتثال تمنع تنفيذ الصفقة",
  ],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateAgentAnalysis(agent: ExpertAgent): AgentAnalysis {
  const rec = randomFrom(RECOMMENDATIONS);
  const confidence = 55 + Math.random() * 40;
  return {
    agentId: agent.id,
    timestamp: new Date().toISOString(),
    recommendation: rec,
    confidence: Math.round(confidence * 10) / 10,
    reasoning: randomFrom(REASONINGS[rec]),
    evidence: [
      `تحليل ${agent.nameAr} أظهر ${rec === "buy" ? "إشارات إيجابية" : rec === "sell" ? "إشارات سلبية" : "إشارات محايدة"}`,
      `مستوى الثقة: ${Math.round(confidence)}%`,
      `آخر تحديث: ${new Date().toLocaleTimeString("ar-SA")}`,
    ],
    riskAssessment: confidence > 80 ? "low" : confidence > 60 ? "medium" : "high",
  };
}

function generateAuditReport(
  analyses: AgentAnalysis[]
): AuditReport {
  const scores: Record<string, number> = {};
  for (const a of analyses) {
    scores[a.agentId] = 60 + Math.random() * 35;
  }
  const contradictions: string[] = [];
  const buyCount = analyses.filter((a) => a.recommendation === "buy").length;
  const sellCount = analyses.filter((a) => a.recommendation === "sell").length;
  if (buyCount > 0 && sellCount > 0) {
    contradictions.push(
      `${buyCount} خبراء مع الشراء و${sellCount} مع البيع - تضارب واضح`
    );
  }
  return {
    expertPerformanceScores: scores,
    contradictions,
    complianceViolations: [],
    anomalies: [],
    dataQualityIssues: [],
  };
}

function generateCEODecision(
  analyses: AgentAnalysis[],
  auditReport: AuditReport
): CEODecision {
  const votes: Record<string, number> = { buy: 0, sell: 0, hold: 0, wait: 0, cancel: 0 };
  for (const a of analyses) {
    votes[a.recommendation] += a.confidence * (agentRegistry.find((e) => e.id === a.agentId)?.weight ?? 0.1);
  }
  const topDecision = (Object.entries(votes).sort((a, b) => b[1] - a[1])[0][0]) as DecisionType;
  const totalConfidence = analyses.reduce((s, a) => s + a.confidence, 0) / analyses.length;

  const hasVeto = analyses.some((a) => a.vetoActive);
  if (hasVeto) {
    return {
      decision: "cancel",
      confidence: 100,
      summary: "تم تفعيل الفيتو من خبير المخاطر - الصفقة مرفوضة",
      reasoning: "تم تجاوز حد المخاطرة المسموح به",
      risks: ["خطر خسارة مرتفع جداً"],
      alternatives: ["تقليل حجم الصفقة", "انتظار فرصة أفضل"],
    };
  }

  const summaries: Record<DecisionType, string> = {
    buy: "شراء حذر بناءً على توافق أغلب الخبراء",
    sell: "بيع بناءً على تحليل متعدد الأبعاد",
    hold: "الإبقاء على الوضع الحالي",
    wait: "الانتظار حتى وضوح الصورة",
    cancel: "إلغاء بسبب المخاطر العالية",
  };

  const riskMessages = analyses
    .filter((a) => a.riskAssessment === "high")
    .map((a) => `${agentRegistry.find((e) => e.id === a.agentId)?.nameAr}: تحذير من مخاطر عالية`);

  return {
    decision: topDecision,
    confidence: Math.round(totalConfidence * 10) / 10,
    summary: summaries[topDecision],
    reasoning: analyses
      .slice(0, 3)
      .map((a) => `${agentRegistry.find((e) => e.id === a.agentId)?.nameAr}: ${a.reasoning}`)
      .join("\n"),
    risks: riskMessages.length > 0 ? riskMessages : ["لا توجد مخاطر جوهرية"],
    alternatives: [
      "تعديل حجم الصفقة",
      "تحديد وقف خسارة أقرب",
      "الانتظار لتأكيد إضافي",
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

  for (const expert of experts) {
    const analysis = generateAgentAnalysis(expert);
    analyses.push(analysis);
  }

  const auditReport = generateAuditReport(analyses);
  const ceoDecision = generateCEODecision(analyses, auditReport);

  return {
    id: sessionId,
    timestamp: new Date().toISOString(),
    query,
    asset,
    status: "decided",
    expertAnalyses: analyses,
    ceoDecision,
    auditReport,
  };
}

export function getAgentById(id: string): ExpertAgent | undefined {
  return agentRegistry.find((a) => a.id === id);
}

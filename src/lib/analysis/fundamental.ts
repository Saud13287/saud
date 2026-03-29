export interface FundamentalData {
  peRatio: number;
  pbRatio: number;
  debtToEquity: number;
  currentRatio: number;
  roe: number;
  roa: number;
  profitMargin: number;
  revenueGrowth: number;
  earningsGrowth: number;
  dividendYield: number;
  freeCashFlow: number;
  marketCap: number;
}

export interface FundamentalSignal {
  metric: string;
  value: number;
  benchmark: number;
  signal: "bullish" | "bearish" | "neutral";
  strength: number;
  description: string;
}

export function analyzeFundamentals(data: FundamentalData): FundamentalSignal[] {
  const signals: FundamentalSignal[] = [];

  signals.push({
    metric: "نسبة السعر للربح (P/E)",
    value: data.peRatio,
    benchmark: 20,
    signal: data.peRatio < 15 ? "bullish" : data.peRatio > 30 ? "bearish" : "neutral",
    strength: data.peRatio < 15 ? Math.min((15 - data.peRatio) / 15, 1) :
              data.peRatio > 30 ? Math.min((data.peRatio - 30) / 30, 1) : 0,
    description: data.peRatio < 15 ? "السهم مقوم بأقل من قيمته - فرصة شراء" :
                 data.peRatio > 30 ? "السهم مقوم بأكثر من قيمته - قد يكون مبالغ فيه" :
                 "التقييم ضمن النطاق المعقول",
  });

  signals.push({
    metric: "نسبة السعر للقيمة الدفترية (P/B)",
    value: data.pbRatio,
    benchmark: 1.5,
    signal: data.pbRatio < 1 ? "bullish" : data.pbRatio > 3 ? "bearish" : "neutral",
    strength: data.pbRatio < 1 ? Math.min((1 - data.pbRatio), 1) :
              data.pbRatio > 3 ? Math.min((data.pbRatio - 3) / 3, 1) : 0,
    description: data.pbRatio < 1 ? "السعر أقل من القيمة الدفترية" :
                 data.pbRatio > 3 ? "السعر أعلى بكثير من القيمة الدفترية" : "within normal range",
  });

  signals.push({
    metric: "نسبة الديون إلى حقوق المساهمين",
    value: data.debtToEquity,
    benchmark: 1,
    signal: data.debtToEquity < 0.5 ? "bullish" : data.debtToEquity > 2 ? "bearish" : "neutral",
    strength: data.debtToEquity < 0.5 ? 0.7 : data.debtToEquity > 2 ? Math.min((data.debtToEquity - 2) / 2, 1) : 0,
    description: data.debtToEquity < 0.5 ? "مستوى ديون منخفض - ماليات قوية" :
                 data.debtToEquity > 2 ? "مستوى ديون مرتفع - خطر مالي" : "مستوى ديون معقول",
  });

  signals.push({
    metric: "العائد على حقوق المساهمين (ROE)",
    value: data.roe,
    benchmark: 15,
    signal: data.roe > 20 ? "bullish" : data.roe < 5 ? "bearish" : "neutral",
    strength: data.roe > 20 ? Math.min((data.roe - 20) / 20, 1) :
              data.roe < 5 ? Math.min((5 - data.roe) / 5, 1) : 0,
    description: data.roe > 20 ? "عائد ممتاز على حقوق المساهمين" :
                 data.roe < 5 ? "عائد ضعيف - الكفاءة التشغيلية منخفضة" : "عائد معقول",
  });

  signals.push({
    metric: "هامش الربح الصافي",
    value: data.profitMargin,
    benchmark: 10,
    signal: data.profitMargin > 15 ? "bullish" : data.profitMargin < 3 ? "bearish" : "neutral",
    strength: data.profitMargin > 15 ? Math.min((data.profitMargin - 15) / 15, 1) :
              data.profitMargin < 3 ? Math.min((3 - data.profitMargin) / 3, 1) : 0,
    description: data.profitMargin > 15 ? "هامش ربح قوي جداً" :
                 data.profitMargin < 3 ? "هامش ربح ضعيف - ضغط تنافسي" : "هامش ربح معقول",
  });

  signals.push({
    metric: "نمو الإيرادات",
    value: data.revenueGrowth,
    benchmark: 10,
    signal: data.revenueGrowth > 15 ? "bullish" : data.revenueGrowth < 0 ? "bearish" : "neutral",
    strength: data.revenueGrowth > 15 ? Math.min((data.revenueGrowth - 15) / 15, 1) :
              data.revenueGrowth < 0 ? Math.min(Math.abs(data.revenueGrowth) / 10, 1) : 0,
    description: data.revenueGrowth > 15 ? "نمو إيرادات قوي" :
                 data.revenueGrowth < 0 ? "تراجع في الإيرادات - تحذير" : "نمو إيرادات مستقر",
  });

  signals.push({
    metric: "نمو الأرباح",
    value: data.earningsGrowth,
    benchmark: 10,
    signal: data.earningsGrowth > 15 ? "bullish" : data.earningsGrowth < -5 ? "bearish" : "neutral",
    strength: data.earningsGrowth > 15 ? Math.min((data.earningsGrowth - 15) / 15, 1) :
              data.earningsGrowth < -5 ? Math.min(Math.abs(data.earningsGrowth + 5) / 10, 1) : 0,
    description: data.earningsGrowth > 15 ? "نمو أرباح قوي" :
                 data.earningsGrowth < -5 ? "تراجع الأرباح - ضغط على السعر" : "أرباح مستقرة",
  });

  signals.push({
    metric: "التدفق النقدي الحر",
    value: data.freeCashFlow,
    benchmark: 0,
    signal: data.freeCashFlow > 0 ? "bullish" : "bearish",
    strength: data.freeCashFlow > 0 ? 0.7 : 0.8,
    description: data.freeCashFlow > 0 ? "تدفق نقدي إيجابي - قدرة على الاستثمار والدفع" :
                 "تدفق نقدي سلبي - قد تحتاج لإعادة هيكلة",
  });

  return signals;
}

export function calculateFairValue(data: FundamentalData): number {
  const earningsBasedValue = data.peRatio > 0 ? data.marketCap / data.peRatio * 15 : data.marketCap;
  const bookValue = data.pbRatio > 0 ? data.marketCap / data.pbRatio * 1.5 : data.marketCap;
  return (earningsBasedValue + bookValue) / 2;
}

export function calculateFundamentalScore(signals: FundamentalSignal[]): number {
  let score = 50;
  for (const s of signals) {
    if (s.signal === "bullish") score += s.strength * 10;
    else if (s.signal === "bearish") score -= s.strength * 10;
  }
  return Math.max(0, Math.min(100, score));
}

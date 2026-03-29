export interface RiskParameters {
  totalCapital: number;
  availableCapital: number;
  maxRiskPerTrade: number;
  maxDailyLoss: number;
  maxOpenPositions: number;
  currentOpenPositions: number;
  dailyPnL: number;
}

export interface PositionSizeResult {
  recommendedSize: number;
  maxAllowedSize: number;
  stopLossPrice: number;
  takeProfitPrice: number;
  riskRewardRatio: number;
  riskAmount: number;
  potentialProfit: number;
  approved: boolean;
  vetoReason?: string;
}

export interface PortfolioExposure {
  totalExposure: number;
  exposurePercent: number;
  byAsset: Record<string, number>;
  byDirection: { long: number; short: number };
  correlationRisk: "low" | "medium" | "high";
  concentrationRisk: "low" | "medium" | "high";
}

export function calculatePositionSize(
  params: RiskParameters,
  entryPrice: number,
  stopLossPercent: number,
  takeProfitPercent: number
): PositionSizeResult {
  const riskAmount = params.totalCapital * (params.maxRiskPerTrade / 100);
  const priceRisk = entryPrice * (stopLossPercent / 100);
  const maxShares = priceRisk > 0 ? Math.floor(riskAmount / priceRisk) : 0;
  const maxAllowedByCapital = Math.floor(params.availableCapital * 0.8 / entryPrice);
  const recommendedSize = Math.min(maxShares, maxAllowedByCapital);

  const stopLossPrice = entryPrice * (1 - stopLossPercent / 100);
  const takeProfitPrice = entryPrice * (1 + takeProfitPercent / 100);
  const riskRewardRatio = takeProfitPercent / stopLossPercent;

  let approved = true;
  let vetoReason: string | undefined;

  if (params.dailyPnL <= -params.maxDailyLoss) {
    approved = false;
    vetoReason = "تم تجاوز حد الخسارة اليومي - النظام متوقف";
  }

  if (params.currentOpenPositions >= params.maxOpenPositions) {
    approved = false;
    vetoReason = "تم الوصول للحد الأقصى للصفقات المفتوحة";
  }

  if (recommendedSize * entryPrice > params.availableCapital) {
    approved = false;
    vetoReason = "رأس المال المتاح غير كافٍ";
  }

  if (riskRewardRatio < 1.5) {
    approved = false;
    vetoReason = `نسبة المخاطرة/العائد (${riskRewardRatio.toFixed(2)}) أقل من 1.5`;
  }

  return {
    recommendedSize,
    maxAllowedSize: maxAllowedByCapital,
    stopLossPrice,
    takeProfitPrice,
    riskRewardRatio,
    riskAmount,
    potentialProfit: recommendedSize * entryPrice * (takeProfitPercent / 100),
    approved,
    vetoReason,
  };
}

export function calculatePortfolioExposure(
  positions: { asset: string; value: number; direction: "long" | "short" }[],
  totalCapital: number
): PortfolioExposure {
  const byAsset: Record<string, number> = {};
  let longTotal = 0;
  let shortTotal = 0;

  for (const pos of positions) {
    byAsset[pos.asset] = (byAsset[pos.asset] || 0) + pos.value;
    if (pos.direction === "long") longTotal += pos.value;
    else shortTotal += pos.value;
  }

  const totalExposure = longTotal + shortTotal;
  const exposurePercent = (totalExposure / totalCapital) * 100;

  const maxAssetExposure = Math.max(...Object.values(byAsset), 0);
  const concentrationRatio = totalExposure > 0 ? maxAssetExposure / totalExposure : 0;

  return {
    totalExposure,
    exposurePercent,
    byAsset,
    byDirection: { long: longTotal, short: shortTotal },
    correlationRisk: exposurePercent > 70 ? "high" : exposurePercent > 40 ? "medium" : "low",
    concentrationRisk: concentrationRatio > 0.5 ? "high" : concentrationRatio > 0.3 ? "medium" : "low",
  };
}

export function evaluateHedgeNeed(
  exposure: PortfolioExposure,
  marketVolatility: number
): { needsHedge: boolean; suggestions: string[] } {
  const suggestions: string[] = [];
  let needsHedge = false;

  if (exposure.correlationRisk === "high") {
    needsHedge = true;
    suggestions.push("شراء ذهب أو سندات حكومية كتحوط");
  }

  if (exposure.concentrationRisk === "high") {
    needsHedge = true;
    suggestions.push("تنويع المحفظة - تقليل التركيز على أصل واحد");
  }

  if (marketVolatility > 3 && exposure.exposurePercent > 50) {
    needsHedge = true;
    suggestions.push("تقليل التعرض الكلي بسبب التقلبات العالية");
    suggestions.push("شراء خيارات بيع (Put Options) كتأمين");
  }

  if (exposure.byDirection.long > exposure.byDirection.short * 3) {
    suggestions.push("إضافة صفقات شورت للتوازن");
  }

  return { needsHedge, suggestions };
}

export function calculateKelly(
  winRate: number,
  avgWin: number,
  avgLoss: number
): number {
  if (avgLoss === 0) return 0;
  const ratio = avgWin / avgLoss;
  const kelly = winRate - (1 - winRate) / ratio;
  return Math.max(0, Math.min(kelly, 0.25));
}

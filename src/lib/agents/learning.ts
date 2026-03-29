import { LearningMetric, MarketRegime, TradeRecord } from "./types";

export function calculateExpertAccuracy(
  expertId: string,
  trades: TradeRecord[]
): number {
  const relevantTrades = trades.filter((t) => expertId in t.expertVotes);
  if (relevantTrades.length === 0) return 70;
  const correct = relevantTrades.filter((t) => {
    const vote = t.expertVotes[expertId];
    if (t.pnl === undefined) return false;
    if (vote === "buy" && t.pnl > 0) return true;
    if (vote === "sell" && t.pnl > 0) return true;
    if (vote === "hold" && t.pnl === 0) return true;
    return false;
  }).length;
  return Math.round((correct / relevantTrades.length) * 100 * 10) / 10;
}

export function detectMarketRegime(prices: number[]): MarketRegime {
  if (prices.length < 20) return "sideways";
  const recent = prices.slice(-20);
  const sma20 = recent.reduce((a, b) => a + b, 0) / recent.length;
  const older = prices.slice(-40, -20);
  const sma40 = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : sma20;

  const trend = ((sma20 - sma40) / sma40) * 100;
  const returns: number[] = [];
  for (let i = 1; i < recent.length; i++) {
    returns.push(((recent[i] - recent[i - 1]) / recent[i - 1]) * 100);
  }
  const volatility = Math.sqrt(
    returns.reduce((s, r) => s + Math.pow(r, 2), 0) / returns.length
  );

  if (volatility > 3) return "volatile";
  if (trend > 3) return "bullish";
  if (trend < -3) return "bearish";
  return "sideways";
}

export function adjustExpertWeights(
  experts: { id: string; category: string; weight: number; accuracy: number }[],
  regime: MarketRegime
): { id: string; weight: number }[] {
  const regimeBoosts: Record<MarketRegime, Record<string, number>> = {
    bullish: {
      technical: 1.3,
      news: 1.1,
      fundamental: 1.0,
      decision: 0.9,
      risk: 0.8,
      system: 1.0,
      audit: 1.0,
    },
    bearish: {
      risk: 1.4,
      news: 1.2,
      fundamental: 1.1,
      technical: 0.8,
      decision: 1.1,
      system: 1.0,
      audit: 1.2,
    },
    sideways: {
      fundamental: 1.2,
      decision: 1.1,
      technical: 0.9,
      risk: 1.0,
      news: 0.9,
      system: 1.0,
      audit: 1.0,
    },
    volatile: {
      risk: 1.5,
      decision: 1.3,
      technical: 0.7,
      news: 1.2,
      fundamental: 0.8,
      system: 1.1,
      audit: 1.3,
    },
  };

  const boosts = regimeBoosts[regime];
  const adjusted = experts.map((e) => {
    const boost = boosts[e.category] ?? 1.0;
    const accuracyBoost = e.accuracy > 80 ? 1.1 : e.accuracy < 60 ? 0.9 : 1.0;
    return {
      id: e.id,
      weight: e.weight * boost * accuracyBoost,
    };
  });

  const total = adjusted.reduce((s, e) => s + e.weight, 0);
  return adjusted.map((e) => ({
    ...e,
    weight: Math.round((e.weight / total) * 1000) / 1000,
  }));
}

export function generateLearningMetrics(
  experts: { id: string; category: string }[],
  trades: TradeRecord[]
): LearningMetric[] {
  return experts.map((e) => {
    const accuracy = calculateExpertAccuracy(e.id, trades);
    const relevantTrades = trades.filter((t) => e.id in t.expertVotes);
    const correct = relevantTrades.filter((t) => {
      const vote = t.expertVotes[e.id];
      return (vote === "buy" && (t.pnl ?? 0) > 0) || (vote === "sell" && (t.pnl ?? 0) > 0);
    }).length;

    let bestRegime: MarketRegime = "sideways";
    if (e.category === "technical") bestRegime = "bullish";
    if (e.category === "risk") bestRegime = "volatile";
    if (e.category === "news") bestRegime = "volatile";
    if (e.category === "fundamental") bestRegime = "sideways";

    return {
      expertId: e.id,
      period: "30d",
      accuracy,
      totalRecommendations: relevantTrades.length,
      correctRecommendations: correct,
      avgConfidence: 55 + Math.random() * 30,
      bestMarketRegime: bestRegime,
    };
  });
}

export function calculateAdaptiveWeights(
  historicalMetrics: LearningMetric[],
  currentRegime: MarketRegime
): Record<string, number> {
  const weights: Record<string, number> = {};

  for (const metric of historicalMetrics) {
    let baseWeight = metric.accuracy / 100;
    if (metric.bestMarketRegime === currentRegime) {
      baseWeight *= 1.2;
    }
    weights[metric.expertId] = baseWeight;
  }

  const total = Object.values(weights).reduce((s, w) => s + w, 0);
  if (total > 0) {
    for (const key of Object.keys(weights)) {
      weights[key] = weights[key] / total;
    }
  }

  return weights;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  dataFeedStatus: "connected" | "delayed" | "disconnected";
  lastUpdate: string;
  errors: string[];
}

export function getSystemHealth(): SystemHealth {
  return {
    cpuUsage: 20 + Math.random() * 40,
    memoryUsage: 40 + Math.random() * 30,
    apiLatency: 50 + Math.random() * 200,
    dataFeedStatus: "connected",
    lastUpdate: new Date().toISOString(),
    errors: [],
  };
}

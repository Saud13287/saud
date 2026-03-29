import { LearningMetric, MarketRegime, TradeRecord, SystemHealth } from "./types";

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
  const first = recent[0];
  const last = recent[recent.length - 1];
  const change = ((last - first) / first) * 100;
  const volatility =
    recent.reduce((sum, p, i) => {
      if (i === 0) return 0;
      return sum + Math.abs(((p - recent[i - 1]) / recent[i - 1]) * 100);
    }, 0) / (recent.length - 1);

  if (volatility > 3) return "volatile";
  if (change > 5) return "bullish";
  if (change < -5) return "bearish";
  return "sideways";
}

export function adjustExpertWeights(
  experts: { id: string; weight: number; accuracy: number }[],
  regime: MarketRegime
): { id: string; weight: number }[] {
  const regimeBoosts: Record<MarketRegime, Record<string, number>> = {
    bullish: { technical: 1.3, news: 1.1, fundamental: 1.0, decision: 0.9 },
    bearish: { risk: 1.4, news: 1.2, fundamental: 1.1, technical: 0.8 },
    sideways: { fundamental: 1.2, decision: 1.1, technical: 0.9, risk: 1.0 },
    volatile: { risk: 1.5, decision: 1.3, technical: 0.7, news: 1.2 },
  };

  const boosts = regimeBoosts[regime];
  const adjusted = experts.map((e) => {
    const boost = boosts[e.id] ?? 1.0;
    return {
      id: e.id,
      weight: Math.round(e.weight * boost * 1000) / 1000,
    };
  });

  const total = adjusted.reduce((s, e) => s + e.weight, 0);
  return adjusted.map((e) => ({
    ...e,
    weight: Math.round((e.weight / total) * 1000) / 1000,
  }));
}

export function generateLearningMetrics(
  experts: { id: string }[],
  trades: TradeRecord[]
): LearningMetric[] {
  return experts.map((e) => ({
    expertId: e.id,
    period: "30d",
    accuracy: calculateExpertAccuracy(e.id, trades),
    totalRecommendations: trades.length,
    correctRecommendations: trades.filter((t) => {
      const vote = t.expertVotes[e.id];
      if (!vote || t.pnl === undefined) return false;
      return (vote === "buy" && t.pnl > 0) || (vote === "sell" && t.pnl > 0);
    }).length,
    avgConfidence: 70 + Math.random() * 20,
    bestMarketRegime: "bullish",
  }));
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

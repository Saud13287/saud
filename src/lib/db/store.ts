import { TradeRecord, WarRoomSession, LearningMetric, PortfolioState } from "@/lib/agents/types";

const DB: {
  trades: TradeRecord[];
  sessions: WarRoomSession[];
  learningMetrics: LearningMetric[];
  portfolio: PortfolioState;
} = {
  trades: [],
  sessions: [],
  learningMetrics: [],
  portfolio: {
    totalCapital: 100000,
    availableCapital: 85000,
    openPositions: 0,
    dailyPnL: 0,
    totalPnL: 0,
    riskExposure: 0,
    trades: [],
  },
};

export function getPortfolio(): PortfolioState {
  return { ...DB.portfolio };
}

export function updatePortfolio(update: Partial<PortfolioState>): PortfolioState {
  DB.portfolio = { ...DB.portfolio, ...update };
  return DB.portfolio;
}

export function addTrade(trade: TradeRecord): void {
  DB.trades.push(trade);
  DB.portfolio.trades = DB.trades;
}

export function getTrades(): TradeRecord[] {
  return [...DB.trades];
}

export function getOpenTrades(): TradeRecord[] {
  return DB.trades.filter((t) => t.status === "open");
}

export function closeTrade(tradeId: string, exitPrice: number): TradeRecord | null {
  const trade = DB.trades.find((t) => t.id === tradeId);
  if (!trade) return null;
  trade.status = "closed";
  trade.exitPrice = exitPrice;
  trade.pnl = trade.direction === "buy"
    ? (exitPrice - trade.entryPrice) * trade.quantity
    : (trade.entryPrice - exitPrice) * trade.quantity;
  DB.portfolio.totalPnL += trade.pnl;
  DB.portfolio.availableCapital += trade.pnl;
  return trade;
}

export function saveSession(session: WarRoomSession): void {
  DB.sessions.push(session);
}

export function getSessions(limit = 20): WarRoomSession[] {
  return DB.sessions.slice(-limit);
}

export function getLearningMetrics(): LearningMetric[] {
  return [...DB.learningMetrics];
}

export function updateLearningMetrics(metrics: LearningMetric[]): void {
  DB.learningMetrics = metrics;
}

export function getTradeStats(): {
  totalTrades: number;
  winRate: number;
  avgPnL: number;
  totalPnL: number;
  bestTrade: number;
  worstTrade: number;
  profitFactor: number;
} {
  const closedTrades = DB.trades.filter((t) => t.status === "closed" && t.pnl !== undefined);
  if (closedTrades.length === 0) {
    return { totalTrades: 0, winRate: 0, avgPnL: 0, totalPnL: 0, bestTrade: 0, worstTrade: 0, profitFactor: 0 };
  }
  const wins = closedTrades.filter((t) => (t.pnl ?? 0) > 0);
  const losses = closedTrades.filter((t) => (t.pnl ?? 0) <= 0);
  const totalPnL = closedTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossProfit = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const grossLoss = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));
  const pnls = closedTrades.map((t) => t.pnl ?? 0);

  return {
    totalTrades: closedTrades.length,
    winRate: Math.round((wins.length / closedTrades.length) * 10000) / 100,
    avgPnL: totalPnL / closedTrades.length,
    totalPnL,
    bestTrade: Math.max(...pnls),
    worstTrade: Math.min(...pnls),
    profitFactor: grossLoss > 0 ? Math.round((grossProfit / grossLoss) * 100) / 100 : grossProfit > 0 ? Infinity : 0,
  };
}

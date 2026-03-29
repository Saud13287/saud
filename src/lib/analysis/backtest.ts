import { PriceData } from "./technical";
import { runFullTechnicalAnalysis, TechnicalSignal } from "./technical";

export interface BacktestConfig {
  initialCapital: number;
  riskPerTrade: number;
  stopLossPercent: number;
  takeProfitPercent: number;
  strategy: string;
}

export interface BacktestTrade {
  entryDate: string;
  exitDate: string;
  entryPrice: number;
  exitPrice: number;
  direction: "long" | "short";
  pnl: number;
  pnlPercent: number;
  reason: string;
}

export interface BacktestResult {
  strategy: string;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalReturn: number;
  totalReturnPercent: number;
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  profitFactor: number;
  avgWin: number;
  avgLoss: number;
  bestTrade: number;
  worstTrade: number;
  trades: BacktestTrade[];
}

export function runBacktest(
  data: PriceData[],
  config: BacktestConfig
): BacktestResult {
  const trades: BacktestTrade[] = [];
  let capital = config.initialCapital;
  let peak = capital;
  let maxDrawdown = 0;
  let inPosition = false;
  let entryPrice = 0;
  let entryDate = "";
  let direction: "long" | "short" = "long";

  for (let i = 30; i < data.length; i++) {
    const slice = data.slice(0, i + 1);
    const signals = runFullTechnicalAnalysis(slice);

    if (!inPosition) {
      const buySignals = signals.filter((s) => s.signal === "buy");
      const sellSignals = signals.filter((s) => s.signal === "sell");
      const buyStrength = buySignals.reduce((s, sig) => s + sig.strength, 0);
      const sellStrength = sellSignals.reduce((s, sig) => s + sig.strength, 0);

      if (buyStrength > sellStrength && buyStrength > 1.5) {
        inPosition = true;
        entryPrice = data[i].close;
        entryDate = data[i].timestamp;
        direction = "long";
      } else if (sellStrength > buyStrength && sellStrength > 1.5) {
        inPosition = true;
        entryPrice = data[i].close;
        entryDate = data[i].timestamp;
        direction = "short";
      }
    } else {
      const currentPrice = data[i].close;
      let exit = false;
      let reason = "";

      if (direction === "long") {
        const change = ((currentPrice - entryPrice) / entryPrice) * 100;
        if (change <= -config.stopLossPercent) { exit = true; reason = "وقف خسارة"; }
        if (change >= config.takeProfitPercent) { exit = true; reason = "جني أرباح"; }
      } else {
        const change = ((entryPrice - currentPrice) / entryPrice) * 100;
        if (change <= -config.stopLossPercent) { exit = true; reason = "وقف خسارة"; }
        if (change >= config.takeProfitPercent) { exit = true; reason = "جني أرباح"; }
      }

      if (exit) {
        const pnl = direction === "long"
          ? (currentPrice - entryPrice) * (capital * config.riskPerTrade / 100 / entryPrice)
          : (entryPrice - currentPrice) * (capital * config.riskPerTrade / 100 / entryPrice);
        const pnlPercent = direction === "long"
          ? ((currentPrice - entryPrice) / entryPrice) * 100
          : ((entryPrice - currentPrice) / entryPrice) * 100;

        capital += pnl;
        if (capital > peak) peak = capital;
        const drawdown = peak - capital;
        if (drawdown > maxDrawdown) maxDrawdown = drawdown;

        trades.push({
          entryDate,
          exitDate: data[i].timestamp,
          entryPrice,
          exitPrice: currentPrice,
          direction,
          pnl,
          pnlPercent,
          reason,
        });

        inPosition = false;
      }
    }
  }

  const winningTrades = trades.filter((t) => t.pnl > 0);
  const losingTrades = trades.filter((t) => t.pnl <= 0);
  const totalReturn = capital - config.initialCapital;
  const winRate = trades.length > 0 ? winningTrades.length / trades.length : 0;
  const avgWin = winningTrades.length > 0
    ? winningTrades.reduce((s, t) => s + t.pnlPercent, 0) / winningTrades.length
    : 0;
  const avgLoss = losingTrades.length > 0
    ? Math.abs(losingTrades.reduce((s, t) => s + t.pnlPercent, 0) / losingTrades.length)
    : 0;
  const grossProfit = winningTrades.reduce((s, t) => s + t.pnl, 0);
  const grossLoss = Math.abs(losingTrades.reduce((s, t) => s + t.pnl, 0));
  const profitFactor = grossLoss > 0 ? grossProfit / grossLoss : grossProfit > 0 ? Infinity : 0;

  const returns = trades.map((t) => t.pnlPercent / 100);
  const avgReturn = returns.length > 0 ? returns.reduce((a, b) => a + b, 0) / returns.length : 0;
  const stdDev = returns.length > 1
    ? Math.sqrt(returns.reduce((s, r) => s + Math.pow(r - avgReturn, 2), 0) / returns.length)
    : 1;
  const sharpeRatio = stdDev > 0 ? (avgReturn / stdDev) * Math.sqrt(252) : 0;

  return {
    strategy: config.strategy,
    totalTrades: trades.length,
    winningTrades: winningTrades.length,
    losingTrades: losingTrades.length,
    winRate: Math.round(winRate * 10000) / 100,
    totalReturn,
    totalReturnPercent: Math.round((totalReturn / config.initialCapital) * 10000) / 100,
    maxDrawdown,
    maxDrawdownPercent: Math.round((maxDrawdown / config.initialCapital) * 10000) / 100,
    sharpeRatio: Math.round(sharpeRatio * 100) / 100,
    profitFactor: Math.round(profitFactor * 100) / 100,
    avgWin: Math.round(avgWin * 100) / 100,
    avgLoss: Math.round(avgLoss * 100) / 100,
    bestTrade: trades.length > 0 ? Math.max(...trades.map((t) => t.pnlPercent)) : 0,
    worstTrade: trades.length > 0 ? Math.min(...trades.map((t) => t.pnlPercent)) : 0,
    trades,
  };
}

export function compareStrategies(
  data: PriceData[],
  strategies: { name: string; stopLoss: number; takeProfit: number }[]
): BacktestResult[] {
  return strategies.map((s) =>
    runBacktest(data, {
      initialCapital: 100000,
      riskPerTrade: 2,
      stopLossPercent: s.stopLoss,
      takeProfitPercent: s.takeProfit,
      strategy: s.name,
    })
  );
}

export interface PriceData {
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  timestamp: string;
}

export interface TechnicalSignal {
  indicator: string;
  signal: "buy" | "sell" | "neutral";
  strength: number;
  value: number;
  description: string;
}

export function calculateSMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = 0; i < prices.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const sum = prices.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0);
      result.push(sum / period);
    }
  }
  return result;
}

export function calculateEMA(prices: number[], period: number): number[] {
  const result: number[] = [];
  const multiplier = 2 / (period + 1);
  let ema = prices[0];
  for (let i = 0; i < prices.length; i++) {
    if (i === 0) {
      result.push(prices[0]);
    } else {
      ema = (prices[i] - ema) * multiplier + ema;
      result.push(ema);
    }
  }
  return result;
}

export function calculateRSI(prices: number[], period: number = 14): number[] {
  const result: number[] = [];
  const gains: number[] = [];
  const losses: number[] = [];

  for (let i = 1; i < prices.length; i++) {
    const change = prices[i] - prices[i - 1];
    gains.push(change > 0 ? change : 0);
    losses.push(change < 0 ? Math.abs(change) : 0);
  }

  for (let i = 0; i < gains.length; i++) {
    if (i < period - 1) {
      result.push(NaN);
    } else {
      const avgGain = gains.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      const avgLoss = losses.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0) / period;
      if (avgLoss === 0) {
        result.push(100);
      } else {
        const rs = avgGain / avgLoss;
        result.push(100 - 100 / (1 + rs));
      }
    }
  }
  return [NaN, ...result];
}

export function calculateMACD(
  prices: number[],
  fastPeriod: number = 12,
  slowPeriod: number = 26,
  signalPeriod: number = 9
): { macd: number[]; signal: number[]; histogram: number[] } {
  const fastEMA = calculateEMA(prices, fastPeriod);
  const slowEMA = calculateEMA(prices, slowPeriod);
  const macdLine = fastEMA.map((f, i) => f - slowEMA[i]);
  const signalLine = calculateEMA(macdLine.slice(slowPeriod - 1), signalPeriod);

  const fullSignal: number[] = [];
  for (let i = 0; i < slowPeriod - 1; i++) fullSignal.push(NaN);
  fullSignal.push(...signalLine);

  const histogram = macdLine.map((m, i) => {
    if (isNaN(fullSignal[i])) return NaN;
    return m - fullSignal[i];
  });

  return { macd: macdLine, signal: fullSignal, histogram };
}

export function calculateBollingerBands(
  prices: number[],
  period: number = 20,
  stdDev: number = 2
): { upper: number[]; middle: number[]; lower: number[] } {
  const sma = calculateSMA(prices, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < prices.length; i++) {
    if (isNaN(sma[i])) {
      upper.push(NaN);
      lower.push(NaN);
    } else {
      const slice = prices.slice(i - period + 1, i + 1);
      const mean = sma[i];
      const variance = slice.reduce((sum, p) => sum + Math.pow(p - mean, 2), 0) / period;
      const std = Math.sqrt(variance);
      upper.push(mean + stdDev * std);
      lower.push(mean - stdDev * std);
    }
  }

  return { upper, middle: sma, lower };
}

export function calculateATR(
  highs: number[],
  lows: number[],
  closes: number[],
  period: number = 14
): number[] {
  const trueRanges: number[] = [highs[0] - lows[0]];
  for (let i = 1; i < highs.length; i++) {
    const tr = Math.max(
      highs[i] - lows[i],
      Math.abs(highs[i] - closes[i - 1]),
      Math.abs(lows[i] - closes[i - 1])
    );
    trueRanges.push(tr);
  }
  return calculateSMA(trueRanges, period);
}

export function calculateStochastic(
  highs: number[],
  lows: number[],
  closes: number[],
  kPeriod: number = 14,
  dPeriod: number = 3
): { k: number[]; d: number[] } {
  const kValues: number[] = [];
  for (let i = 0; i < closes.length; i++) {
    if (i < kPeriod - 1) {
      kValues.push(NaN);
    } else {
      const highSlice = highs.slice(i - kPeriod + 1, i + 1);
      const lowSlice = lows.slice(i - kPeriod + 1, i + 1);
      const highestHigh = Math.max(...highSlice);
      const lowestLow = Math.min(...lowSlice);
      if (highestHigh === lowestLow) {
        kValues.push(50);
      } else {
        kValues.push(((closes[i] - lowestLow) / (highestHigh - lowestLow)) * 100);
      }
    }
  }
  const dValues = calculateSMA(kValues.filter((v) => !isNaN(v)), dPeriod);
  const fullD: number[] = [];
  let dIdx = 0;
  for (let i = 0; i < kValues.length; i++) {
    if (isNaN(kValues[i]) || dIdx >= dValues.length) {
      fullD.push(NaN);
    } else {
      fullD.push(dValues[dIdx++]);
    }
  }
  return { k: kValues, d: fullD };
}

export function detectSupportResistance(
  highs: number[],
  lows: number[],
  tolerance: number = 0.02
): { supports: number[]; resistances: number[] } {
  const supports: number[] = [];
  const resistances: number[] = [];

  for (let i = 2; i < lows.length - 2; i++) {
    if (lows[i] < lows[i - 1] && lows[i] < lows[i - 2] &&
        lows[i] < lows[i + 1] && lows[i] < lows[i + 2]) {
      const exists = supports.some((s) => Math.abs(s - lows[i]) / lows[i] < tolerance);
      if (!exists) supports.push(lows[i]);
    }
  }

  for (let i = 2; i < highs.length - 2; i++) {
    if (highs[i] > highs[i - 1] && highs[i] > highs[i - 2] &&
        highs[i] > highs[i + 1] && highs[i] > highs[i + 2]) {
      const exists = resistances.some((r) => Math.abs(r - highs[i]) / highs[i] < tolerance);
      if (!exists) resistances.push(highs[i]);
    }
  }

  return { supports: supports.sort((a, b) => b - a), resistances: resistances.sort((a, b) => a - b) };
}

export function detectCandlestickPatterns(data: PriceData[]): string[] {
  const patterns: string[] = [];
  if (data.length < 3) return patterns;

  const latest = data[data.length - 1];
  const prev = data[data.length - 2];
  const body = Math.abs(latest.close - latest.open);
  const prevBody = Math.abs(prev.close - prev.open);
  const upperShadow = latest.high - Math.max(latest.close, latest.open);
  const lowerShadow = Math.min(latest.close, latest.open) - latest.low;
  const range = latest.high - latest.low;

  if (body < range * 0.1) patterns.push("دوجي - تردد السوق");
  if (lowerShadow > body * 2 && upperShadow < body * 0.5) patterns.push("المطرقة - إشارة انعكاس صاعدة");
  if (upperShadow > body * 2 && lowerShadow < body * 0.5) patterns.push("المعلقة المقلوبة - إشارة انعكاس هابطة");
  if (prev.close > prev.open && latest.close < latest.open && latest.close < prev.open && latest.open > prev.close) {
    patterns.push("الابتلاع الهابط - إشارة بيع قوية");
  }
  if (prev.close < prev.open && latest.close > latest.open && latest.close > prev.open && latest.open < prev.close) {
    patterns.push("الابتلاع الصاعد - إشارة شراء قوية");
  }

  return patterns;
}

export function runFullTechnicalAnalysis(data: PriceData[]): TechnicalSignal[] {
  if (data.length < 30) return [];

  const closes = data.map((d) => d.close);
  const highs = data.map((d) => d.high);
  const lows = data.map((d) => d.low);
  const signals: TechnicalSignal[] = [];

  const rsi = calculateRSI(closes);
  const lastRSI = rsi[rsi.length - 1];
  if (!isNaN(lastRSI)) {
    signals.push({
      indicator: "RSI",
      signal: lastRSI < 30 ? "buy" : lastRSI > 70 ? "sell" : "neutral",
      strength: lastRSI < 30 ? (30 - lastRSI) / 30 : lastRSI > 70 ? (lastRSI - 70) / 30 : 0,
      value: lastRSI,
      description: lastRSI < 30 ? "تشبع بيعي - فرصة شراء" : lastRSI > 70 ? "تشبع شرائي - فرصة بيع" : "في المنطقة المحايدة",
    });
  }

  const macd = calculateMACD(closes);
  const lastMACD = macd.macd[macd.macd.length - 1];
  const lastSignal = macd.signal[macd.signal.length - 1];
  if (!isNaN(lastMACD) && !isNaN(lastSignal)) {
    signals.push({
      indicator: "MACD",
      signal: lastMACD > lastSignal ? "buy" : "sell",
      strength: Math.min(Math.abs(lastMACD - lastSignal) / Math.abs(lastSignal || 1), 1),
      value: lastMACD - lastSignal,
      description: lastMACD > lastSignal ? "MACD فوق خط الإشارة - زخم صاعد" : "MACD تحت خط الإشارة - زخم هابط",
    });
  }

  const bb = calculateBollingerBands(closes);
  const lastClose = closes[closes.length - 1];
  const lastBBUpper = bb.upper[bb.upper.length - 1];
  const lastBBLower = bb.lower[bb.lower.length - 1];
  if (!isNaN(lastBBUpper) && !isNaN(lastBBLower)) {
    const bbPosition = (lastClose - lastBBLower) / (lastBBUpper - lastBBLower);
    signals.push({
      indicator: "Bollinger Bands",
      signal: bbPosition < 0.2 ? "buy" : bbPosition > 0.8 ? "sell" : "neutral",
      strength: bbPosition < 0.2 ? 1 - bbPosition : bbPosition > 0.8 ? bbPosition - 0.8 : 0,
      value: bbPosition,
      description: bbPosition < 0.2 ? "السعر عند الحد السفلي - محتمل ارتداد" : bbPosition > 0.8 ? "السعر عند الحد العلوي - محتمل تصحيح" : "في نطاق بولنجر الوسطي",
    });
  }

  const sma20 = calculateSMA(closes, 20);
  const sma50 = calculateSMA(closes, 50);
  const lastSMA20 = sma20[sma20.length - 1];
  const lastSMA50 = sma50[sma50.length - 1];
  if (!isNaN(lastSMA20) && !isNaN(lastSMA50)) {
    signals.push({
      indicator: "SMA Cross",
      signal: lastSMA20 > lastSMA50 ? "buy" : "sell",
      strength: Math.min(Math.abs(lastSMA20 - lastSMA50) / lastSMA50 * 10, 1),
      value: lastSMA20 - lastSMA50,
      description: lastSMA20 > lastSMA50 ? "المتوسط 20 فوق 50 - اتجاه صاعد" : "المتوسط 20 تحت 50 - اتجاه هابط",
    });
  }

  const stoch = calculateStochastic(highs, lows, closes);
  const lastK = stoch.k[stoch.k.length - 1];
  if (!isNaN(lastK)) {
    signals.push({
      indicator: "Stochastic",
      signal: lastK < 20 ? "buy" : lastK > 80 ? "sell" : "neutral",
      strength: lastK < 20 ? (20 - lastK) / 20 : lastK > 80 ? (lastK - 80) / 20 : 0,
      value: lastK,
      description: lastK < 20 ? "تشبع بيعي في الستوكاستك" : lastK > 80 ? "تشبع شرائي في الستوكاستك" : "منطقة محايدة",
    });
  }

  const patterns = detectCandlestickPatterns(data);
  for (const pattern of patterns) {
    signals.push({
      indicator: "Candlestick",
      signal: pattern.includes("صاعد") || pattern.includes("مطرقة") ? "buy" :
              pattern.includes("هابط") || pattern.includes("معلقة") ? "sell" : "neutral",
      strength: 0.6,
      value: 0,
      description: pattern,
    });
  }

  return signals;
}

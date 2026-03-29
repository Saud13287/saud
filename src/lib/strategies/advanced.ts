import { PriceData } from "@/lib/analysis/technical";

export interface StrategySignal {
  strategy: string;
  strategyAr: string;
  signal: "buy" | "sell" | "neutral";
  strength: number;
  confidence: number;
  entry?: number;
  stopLoss?: number;
  takeProfit?: number;
  reasoning: string;
  timeframe: string;
}

export interface IchimokuData {
  tenkanSen: number;
  kijunSen: number;
  senkouSpanA: number;
  senkouSpanB: number;
  chikouSpan: number;
  cloudTop: number;
  cloudBottom: number;
}

export function calculateIchimoku(data: PriceData[]): IchimokuData[] {
  const result: IchimokuData[] = [];
  for (let i = 0; i < data.length; i++) {
    const tenkan = i >= 8
      ? (Math.max(...data.slice(i - 8, i + 1).map(d => d.high)) +
         Math.min(...data.slice(i - 8, i + 1).map(d => d.low))) / 2
      : NaN;
    const kijun = i >= 25
      ? (Math.max(...data.slice(i - 25, i + 1).map(d => d.high)) +
         Math.min(...data.slice(i - 25, i + 1).map(d => d.low))) / 2
      : NaN;
    const spanA = !isNaN(tenkan) && !isNaN(kijun) ? (tenkan + kijun) / 2 : NaN;
    const spanB = i >= 51
      ? (Math.max(...data.slice(i - 51, i + 1).map(d => d.high)) +
         Math.min(...data.slice(i - 51, i + 1).map(d => d.low))) / 2
      : NaN;
    const chikou = i >= 25 ? data[i - 25].close : NaN;

    result.push({
      tenkanSen: tenkan,
      kijunSen: kijun,
      senkouSpanA: spanA,
      senkouSpanB: spanB,
      chikouSpan: chikou,
      cloudTop: !isNaN(spanA) && !isNaN(spanB) ? Math.max(spanA, spanB) : NaN,
      cloudBottom: !isNaN(spanA) && !isNaN(spanB) ? Math.min(spanA, spanB) : NaN,
    });
  }
  return result;
}

export function ichimokuSignal(data: PriceData[]): StrategySignal {
  const ichimoku = calculateIchimoku(data);
  if (ichimoku.length < 52) {
    return { strategy: "Ichimoku", strategyAr: "إيشيموكو", signal: "neutral", strength: 0, confidence: 0, reasoning: "بيانات غير كافية", timeframe: "D1" };
  }

  const current = ichimoku[ichimoku.length - 1];
  const price = data[data.length - 1].close;
  let score = 0;
  const reasons: string[] = [];

  if (!isNaN(current.tenkanSen) && !isNaN(current.kijunSen)) {
    if (current.tenkanSen > current.kijunSen) { score += 1; reasons.push("Tenkan فوق Kijun"); }
    else { score -= 1; reasons.push("Tenkan تحت Kijun"); }
  }

  if (!isNaN(current.cloudTop) && !isNaN(current.cloudBottom)) {
    if (price > current.cloudTop) { score += 1; reasons.push("السعر فوق السحابة"); }
    else if (price < current.cloudBottom) { score -= 1; reasons.push("السعر تحت السحابة"); }
  }

  if (!isNaN(current.chikouSpan)) {
    const chikouIdx = ichimoku.length - 26;
    if (chikouIdx >= 0 && current.chikouSpan > data[chikouIdx].high) { score += 1; reasons.push("Chikou فوق السعر السابق"); }
    else if (chikouIdx >= 0 && current.chikouSpan < data[chikouIdx].low) { score -= 1; reasons.push("Chikou تحت السعر السابق"); }
  }

  return {
    strategy: "Ichimoku",
    strategyAr: "إيشيموكو",
    signal: score >= 2 ? "buy" : score <= -2 ? "sell" : "neutral",
    strength: Math.min(Math.abs(score) / 3, 1),
    confidence: 70 + Math.abs(score) * 8,
    entry: price,
    stopLoss: !isNaN(current.kijunSen) ? current.kijunSen : price * 0.98,
    takeProfit: price + (price - (!isNaN(current.kijunSen) ? current.kijunSen : price * 0.98)) * 2,
    reasoning: reasons.join(" | "),
    timeframe: "D1",
  };
}

export function fibonacciLevels(data: PriceData[]): { levels: number[]; signal: StrategySignal } {
  const highs = data.map(d => d.high);
  const lows = data.map(d => d.low);
  const high = Math.max(...highs.slice(-50));
  const low = Math.min(...lows.slice(-50));
  const diff = high - low;

  const levels = [
    high,
    high - diff * 0.236,
    high - diff * 0.382,
    high - diff * 0.5,
    high - diff * 0.618,
    high - diff * 0.786,
    low,
  ];

  const price = data[data.length - 1].close;
  let nearestLevel = levels[0];
  let nearestDist = Math.abs(price - levels[0]);

  for (const level of levels) {
    const dist = Math.abs(price - level);
    if (dist < nearestDist) { nearestDist = dist; nearestLevel = level; }
  }

  const levelIdx = levels.indexOf(nearestLevel);
  const isNearSupport = levelIdx >= 4;
  const isNearResistance = levelIdx <= 2;

  return {
    levels,
    signal: {
      strategy: "Fibonacci",
      strategyAr: "فيبوناتشي",
      signal: isNearSupport ? "buy" : isNearResistance ? "sell" : "neutral",
      strength: nearestDist / diff < 0.02 ? 0.8 : 0.4,
      confidence: nearestDist / diff < 0.01 ? 85 : 65,
      entry: price,
      stopLoss: isNearSupport ? levels[Math.min(levelIdx + 1, levels.length - 1)] : price * 1.02,
      takeProfit: isNearSupport ? levels[Math.max(levelIdx - 2, 0)] : levels[Math.min(levelIdx + 2, levels.length - 1)],
      reasoning: `السعر عند مستوى فيبو ${["0%", "23.6%", "38.2%", "50%", "61.8%", "78.6%", "100%"][levelIdx]} (${nearestLevel.toFixed(2)})`,
      timeframe: "D1",
    },
  };
}

export function vwapSignal(data: PriceData[]): StrategySignal {
  let cumVolume = 0;
  let cumVWAP = 0;
  for (const d of data) {
    const typical = (d.high + d.low + d.close) / 3;
    cumVWAP += typical * d.volume;
    cumVolume += d.volume;
  }
  const vwap = cumVolume > 0 ? cumVWAP / cumVolume : data[data.length - 1].close;
  const price = data[data.length - 1].close;
  const deviation = ((price - vwap) / vwap) * 100;

  return {
    strategy: "VWAP",
    strategyAr: "VWAP",
    signal: price < vwap * 0.995 ? "buy" : price > vwap * 1.005 ? "sell" : "neutral",
    strength: Math.min(Math.abs(deviation) / 2, 1),
    confidence: 70 + Math.min(Math.abs(deviation) * 10, 20),
    entry: price,
    stopLoss: price < vwap ? price * 0.98 : price * 1.02,
    takeProfit: price < vwap ? vwap : vwap,
    reasoning: `السعر ${price > vwap ? "أعلى" : "أقل"} من VWAP (${vwap.toFixed(2)}) بنسبة ${deviation.toFixed(2)}%`,
    timeframe: "D1",
  };
}

export function elliottWaveSignal(data: PriceData[]): StrategySignal {
  const closes = data.slice(-60).map(d => d.close);
  const pivots: { idx: number; price: number; type: "high" | "low" }[] = [];

  for (let i = 2; i < closes.length - 2; i++) {
    if (closes[i] > closes[i-1] && closes[i] > closes[i+1] && closes[i] > closes[i-2] && closes[i] > closes[i+2]) {
      pivots.push({ idx: i, price: closes[i], type: "high" });
    }
    if (closes[i] < closes[i-1] && closes[i] < closes[i+1] && closes[i] < closes[i-2] && closes[i] < closes[i+2]) {
      pivots.push({ idx: i, price: closes[i], type: "low" });
    }
  }

  const recentPivots = pivots.slice(-5);
  let wave = "غير محدد";
  let signal: "buy" | "sell" | "neutral" = "neutral";
  let strength = 0;

  if (recentPivots.length >= 3) {
    const last = recentPivots[recentPivots.length - 1];
    const prev = recentPivots[recentPivots.length - 2];
    const prevPrev = recentPivots[recentPivots.length - 3];

    if (last.type === "low" && prev.type === "high" && prevPrev.type === "low") {
      if (last.price > prevPrev.price) {
        wave = "ال🏤ة 2 - تصحيح صاعد";
        signal = "buy";
        strength = 0.7;
      }
    } else if (last.type === "high" && prev.type === "low" && prevPrev.type === "high") {
      if (last.price < prevPrev.price) {
        wave = "ال🏤ة B - تصحيح هابط";
        signal = "sell";
        strength = 0.7;
      }
    }
  }

  return {
    strategy: "Elliott Wave",
    strategyAr: "موجات إليوت",
    signal,
    strength,
    confidence: 60 + strength * 20,
    reasoning: wave,
    timeframe: "D1",
  };
}

export function smcSignal(data: PriceData[]): StrategySignal {
  const recent = data.slice(-20);
  const price = data[data.length - 1].close;

  const orderBlocks: { price: number; type: "bullish" | "bearish" }[] = [];
  for (let i = 2; i < recent.length - 1; i++) {
    if (recent[i-1].close < recent[i-1].open && recent[i].close > recent[i].open && recent[i].close > recent[i-1].high) {
      orderBlocks.push({ price: recent[i-1].low, type: "bullish" });
    }
    if (recent[i-1].close > recent[i-1].open && recent[i].close < recent[i].open && recent[i].close < recent[i-1].low) {
      orderBlocks.push({ price: recent[i-1].high, type: "bearish" });
    }
  }

  const liquiditySweep = recent.some((d, i) => {
    if (i === 0) return false;
    const prevHigh = recent[i-1].high;
    const prevLow = recent[i-1].low;
    return (d.high > prevHigh && d.close < prevHigh) || (d.low < prevLow && d.close > prevLow);
  });

  let signal: "buy" | "sell" | "neutral" = "neutral";
  let strength = 0;
  const reasons: string[] = [];

  const bullishOB = orderBlocks.filter(ob => ob.type === "bullish" && price > ob.price);
  const bearishOB = orderBlocks.filter(ob => ob.type === "bearish" && price < ob.price);

  if (bullishOB.length > 0) { signal = "buy"; strength += 0.4; reasons.push("Order Block صاعد"); }
  if (bearishOB.length > 0) { signal = "sell"; strength += 0.4; reasons.push("Order Block هابط"); }
  if (liquiditySweep) { strength += 0.3; reasons.push(" Liquidity Sweep"); }

  return {
    strategy: "SMC",
    strategyAr: "SMC - Smart Money",
    signal,
    strength: Math.min(strength, 1),
    confidence: 65 + strength * 20,
    entry: price,
    reasoning: reasons.length > 0 ? reasons.join(" | ") : "لا توجد إشارات SMC واضحة",
    timeframe: "H4",
  };
}

export function marketProfileSignal(data: PriceData[]): StrategySignal {
  const price = data[data.length - 1].close;
  const recent = data.slice(-30);

  const priceVolumeMap: Record<number, number> = {};
  for (const d of recent) {
    const rounded = Math.round(d.close);
    priceVolumeMap[rounded] = (priceVolumeMap[rounded] || 0) + d.volume;
  }

  const poc = Object.entries(priceVolumeMap).sort((a, b) => b[1] - a[1])[0];
  const pocPrice = poc ? Number(poc[0]) : price;

  const valueAreaHigh = pocPrice * 1.01;
  const valueAreaLow = pocPrice * 0.99;

  let signal: "buy" | "sell" | "neutral" = "neutral";
  if (price < valueAreaLow) signal = "buy";
  else if (price > valueAreaHigh) signal = "sell";

  return {
    strategy: "Market Profile",
    strategyAr: "ملف السوق",
    signal,
    strength: Math.abs(price - pocPrice) / pocPrice > 0.01 ? 0.7 : 0.3,
    confidence: 68,
    entry: price,
    reasoning: `POC عند ${pocPrice.toFixed(2)} - السعر ${price > pocPrice ? "أعلى" : "أقل"} من منطقة القيمة`,
    timeframe: "D1",
  };
}

export function volumeProfileSignal(data: PriceData[]): StrategySignal {
  const price = data[data.length - 1].close;
  const recent = data.slice(-20);
  const totalVol = recent.reduce((s, d) => s + d.volume, 0);
  const avgVol = totalVol / recent.length;
  const lastVol = data[data.length - 1].volume;
  const volRatio = lastVol / avgVol;

  let signal: "buy" | "sell" | "neutral" = "neutral";
  let strength = 0;
  const priceChange = data.length > 1
    ? (data[data.length - 1].close - data[data.length - 2].close) / data[data.length - 2].close * 100
    : 0;

  if (volRatio > 1.5 && priceChange > 0.5) { signal = "buy"; strength = 0.8; }
  else if (volRatio > 1.5 && priceChange < -0.5) { signal = "sell"; strength = 0.8; }

  return {
    strategy: "Volume Profile",
    strategyAr: "ملف الحجم",
    signal,
    strength,
    confidence: 60 + volRatio * 10,
    reasoning: `حجم التداول ${volRatio > 1.5 ? "مرتفع" : volRatio < 0.5 ? "منخفض" : "طبيعي"} (${volRatio.toFixed(1)}x) مع تغير سعر ${priceChange.toFixed(2)}%`,
    timeframe: "H4",
  };
}

export function runAllStrategies(data: PriceData[]): StrategySignal[] {
  return [
    ichimokuSignal(data),
    fibonacciLevels(data).signal,
    vwapSignal(data),
    elliottWaveSignal(data),
    smcSignal(data),
    marketProfileSignal(data),
    volumeProfileSignal(data),
  ];
}

export function calculateEnsembleDecision(strategies: StrategySignal[]): {
  decision: "buy" | "sell" | "neutral";
  confidence: number;
  agreement: number;
  details: string;
} {
  const buyStrategies = strategies.filter(s => s.signal === "buy");
  const sellStrategies = strategies.filter(s => s.signal === "sell");
  const neutralStrategies = strategies.filter(s => s.signal === "neutral");

  const buyScore = buyStrategies.reduce((s, st) => s + st.strength * (st.confidence / 100), 0);
  const sellScore = sellStrategies.reduce((s, st) => s + st.strength * (st.confidence / 100), 0);

  const totalActive = buyStrategies.length + sellStrategies.length;
  const agreement = totalActive > 0
    ? Math.max(buyStrategies.length, sellStrategies.length) / totalActive
    : 0;

  let decision: "buy" | "sell" | "neutral";
  if (buyScore > sellScore * 1.2 && buyStrategies.length >= 2) decision = "buy";
  else if (sellScore > buyScore * 1.2 && sellStrategies.length >= 2) decision = "sell";
  else decision = "neutral";

  const avgConfidence = strategies.reduce((s, st) => s + st.confidence, 0) / strategies.length;
  const ensembleConfidence = Math.min(avgConfidence * (1 + agreement * 0.3), 95);

  return {
    decision,
    confidence: Math.round(ensembleConfidence * 10) / 10,
    agreement: Math.round(agreement * 100),
    details: `${buyStrategies.length} استراتيجيات مع الشراء، ${sellStrategies.length} مع البيع، ${neutralStrategies.length} محايدة. اتفاق: ${Math.round(agreement * 100)}%`,
  };
}

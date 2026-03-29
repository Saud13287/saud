import { PriceData } from "./technical";

export interface PatternResult {
  name: string;
  nameAr: string;
  type: "bullish" | "bearish" | "neutral";
  reliability: number;
  target: number;
  description: string;
}

export function detectHeadAndShoulders(prices: number[]): PatternResult | null {
  if (prices.length < 20) return null;
  const recent = prices.slice(-30);
  const maxIdx = recent.indexOf(Math.max(...recent));

  if (maxIdx > 5 && maxIdx < recent.length - 5) {
    const leftShoulder = Math.max(...recent.slice(0, maxIdx - 2));
    const head = recent[maxIdx];
    const rightShoulder = Math.max(...recent.slice(maxIdx + 2));

    if (head > leftShoulder * 1.02 && head > rightShoulder * 1.02 &&
        Math.abs(leftShoulder - rightShoulder) / leftShoulder < 0.03) {
      const neckline = Math.min(...recent.slice(maxIdx - 3, maxIdx + 1));
      return {
        name: "Head and Shoulders",
        nameAr: "الرأس والكتفين",
        type: "bearish",
        reliability: 0.7,
        target: neckline - (head - neckline),
        description: "نمط انعكاسي هابط - كسر خط العنق يؤكده",
      };
    }
  }
  return null;
}

export function detectDoubleTop(prices: number[]): PatternResult | null {
  if (prices.length < 15) return null;
  const recent = prices.slice(-20);
  let peak1Idx = -1;
  let peak2Idx = -1;
  let maxVal = 0;

  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] > recent[i-1] && recent[i] > recent[i+1] &&
        recent[i] > recent[i-2] && recent[i] > recent[i+2]) {
      if (peak1Idx === -1) {
        peak1Idx = i;
        maxVal = recent[i];
      } else if (Math.abs(recent[i] - maxVal) / maxVal < 0.02) {
        peak2Idx = i;
        break;
      }
    }
  }

  if (peak1Idx > -1 && peak2Idx > -1) {
    const valley = Math.min(...recent.slice(peak1Idx, peak2Idx));
    return {
      name: "Double Top",
      nameAr: "القممة المزدوجة",
      type: "bearish",
      reliability: 0.65,
      target: valley - (maxVal - valley),
      description: "نمط انعكاسي هابط - قمتان على نفس المستوى تقريباً",
    };
  }
  return null;
}

export function detectDoubleBottom(prices: number[]): PatternResult | null {
  if (prices.length < 15) return null;
  const recent = prices.slice(-20);
  let valley1Idx = -1;
  let valley2Idx = -1;
  let minVal = Infinity;

  for (let i = 2; i < recent.length - 2; i++) {
    if (recent[i] < recent[i-1] && recent[i] < recent[i+1] &&
        recent[i] < recent[i-2] && recent[i] < recent[i+2]) {
      if (valley1Idx === -1) {
        valley1Idx = i;
        minVal = recent[i];
      } else if (Math.abs(recent[i] - minVal) / minVal < 0.02) {
        valley2Idx = i;
        break;
      }
    }
  }

  if (valley1Idx > -1 && valley2Idx > -1) {
    const peak = Math.max(...recent.slice(valley1Idx, valley2Idx));
    return {
      name: "Double Bottom",
      nameAr: "القاع المزدوج",
      type: "bullish",
      reliability: 0.65,
      target: peak + (peak - minVal),
      description: "نمط انعكاسي صاعد - قاعان على نفس المستوى تقريباً",
    };
  }
  return null;
}

export function detectTriangle(prices: number[]): PatternResult | null {
  if (prices.length < 15) return null;
  const recent = prices.slice(-20);
  const highs: number[] = [];
  const lows: number[] = [];

  for (let i = 1; i < recent.length; i++) {
    if (recent[i] > recent[i-1]) highs.push(recent[i]);
    else lows.push(recent[i]);
  }

  if (highs.length < 3 || lows.length < 3) return null;

  const highTrend = (highs[highs.length - 1] - highs[0]) / highs.length;
  const lowTrend = (lows[lows.length - 1] - lows[0]) / lows.length;

  if (Math.abs(highTrend) < 0.001 && lowTrend > 0.001) {
    return {
      name: "Ascending Triangle",
      nameAr: "المثلث الصاعد",
      type: "bullish",
      reliability: 0.6,
      target: recent[recent.length - 1] * 1.05,
      description: "نمط استمراري صاعد - مقاومة أفقية مع قيعان متصاعدة",
    };
  }

  if (highTrend < -0.001 && Math.abs(lowTrend) < 0.001) {
    return {
      name: "Descending Triangle",
      nameAr: "المثلث الهابط",
      type: "bearish",
      reliability: 0.6,
      target: recent[recent.length - 1] * 0.95,
      description: "نمط استمراري هابط - دعم أفقي مع قمم متناقصة",
    };
  }

  if (highTrend < -0.001 && lowTrend > 0.001) {
    return {
      name: "Symmetrical Triangle",
      nameAr: "المثلث المتماثل",
      type: "neutral",
      reliability: 0.5,
      target: recent[recent.length - 1],
      description: "نمط تذبذب - بحاجة لكسر لتحديد الاتجاه",
    };
  }

  return null;
}

export function detectFlag(prices: number[]): PatternResult | null {
  if (prices.length < 10) return null;
  const recent = prices.slice(-10);
  const firstHalf = recent.slice(0, 5);
  const secondHalf = recent.slice(5);

  const firstMove = firstHalf[firstHalf.length - 1] - firstHalf[0];
  const consolidation = Math.abs(secondHalf[secondHalf.length - 1] - secondHalf[0]);
  const flagpole = Math.abs(firstMove);

  if (flagpole > consolidation * 2) {
    return {
      name: "Flag",
      nameAr: "العلم",
      type: firstMove > 0 ? "bullish" : "bearish",
      reliability: 0.6,
      target: firstMove > 0
        ? recent[recent.length - 1] + flagpole
        : recent[recent.length - 1] - flagpole,
      description: firstMove > 0 ? "نمط علم صاعد - استمرار الاتجاه الصاعد" : "نمط علم هابط - استمرار الاتجاه الهابط",
    };
  }
  return null;
}

export function detectAllPatterns(prices: number[]): PatternResult[] {
  const patterns: PatternResult[] = [];
  const hs = detectHeadAndShoulders(prices);
  const dt = detectDoubleTop(prices);
  const db = detectDoubleBottom(prices);
  const tri = detectTriangle(prices);
  const flag = detectFlag(prices);

  if (hs) patterns.push(hs);
  if (dt) patterns.push(dt);
  if (db) patterns.push(db);
  if (tri) patterns.push(tri);
  if (flag) patterns.push(flag);

  return patterns;
}

export function detectCrisisPattern(
  prices: number[],
  volumes: number[],
  historicalCrises: { name: string; priceDrop: number; volumeSpike: number; timeframe: number }[]
): { isCrisis: boolean; similarity: number; matchedCrisis?: string } {
  if (prices.length < 20) return { isCrisis: false, similarity: 0 };

  const recentPrices = prices.slice(-20);
  const priceDrop = (recentPrices[0] - recentPrices[recentPrices.length - 1]) / recentPrices[0] * 100;
  const avgVolume = volumes.slice(-40, -20).reduce((a, b) => a + b, 0) / 20;
  const recentVolume = volumes.slice(-20).reduce((a, b) => a + b, 0) / 20;
  const volumeSpike = avgVolume > 0 ? recentVolume / avgVolume : 1;

  for (const crisis of historicalCrises) {
    const priceSimilarity = 1 - Math.abs(priceDrop - crisis.priceDrop) / Math.max(Math.abs(crisis.priceDrop), 1);
    const volumeSimilarity = 1 - Math.abs(volumeSpike - crisis.volumeSpike) / Math.max(crisis.volumeSpike, 1);
    const similarity = (priceSimilarity + volumeSimilarity) / 2;

    if (similarity > 0.7 && priceDrop < -10) {
      return { isCrisis: true, similarity, matchedCrisis: crisis.name };
    }
  }

  return { isCrisis: false, similarity: 0 };
}

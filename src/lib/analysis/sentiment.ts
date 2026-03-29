export interface NewsItem {
  title: string;
  source: string;
  timestamp: string;
  content: string;
  language: string;
}

export interface SentimentResult {
  score: number;
  label: "very_positive" | "positive" | "neutral" | "negative" | "very_negative";
  confidence: number;
  signals: SentimentSignal[];
}

export interface SentimentSignal {
  source: string;
  sentiment: "positive" | "negative" | "neutral";
  intensity: number;
  keywords: string[];
  description: string;
}

const POSITIVE_WORDS_AR = [
  "ارتفاع", "نمو", "ربح", "إيجابي", "قوي", "تحسن", "قفزة", "שיא",
  "دعم", "فرصة", "شراء", "متفائل", "استثمار", "نجاح", "تعافي",
];

const NEGATIVE_WORDS_AR = [
  "انخفاض", "خسارة", "سلبي", "ضعيف", "تراجع", "أزمة", "خوف", "خطر",
  "بيع", "تحذير", ".Collapsed", "متشائم", "تصحيح", "انهيار", ".Failure",
];

const POSITIVE_WORDS_EN = [
  "surge", "rally", "bullish", "growth", "gain", "profit", "positive",
  "strong", "recovery", "upgrade", "buy", "optimistic", "record", "boom",
];

const NEGATIVE_WORDS_EN = [
  "crash", "bearish", "decline", "loss", "negative", "weak", "fall",
  "fear", "risk", "sell", "warning", "collapse", "downgrade", "recession",
];

export function analyzeSentiment(text: string): { score: number; keywords: string[] } {
  const lower = text.toLowerCase();
  let score = 0;
  const foundKeywords: string[] = [];

  for (const word of POSITIVE_WORDS_AR) {
    if (lower.includes(word)) {
      score += 1;
      foundKeywords.push(`+${word}`);
    }
  }
  for (const word of NEGATIVE_WORDS_AR) {
    if (lower.includes(word)) {
      score -= 1;
      foundKeywords.push(`-${word}`);
    }
  }
  for (const word of POSITIVE_WORDS_EN) {
    if (lower.includes(word)) {
      score += 1;
      foundKeywords.push(`+${word}`);
    }
  }
  for (const word of NEGATIVE_WORDS_EN) {
    if (lower.includes(word)) {
      score -= 1;
      foundKeywords.push(`-${word}`);
    }
  }

  return { score, keywords: foundKeywords };
}

export function analyzeNewsSentiment(news: NewsItem[]): SentimentResult {
  const signals: SentimentSignal[] = [];
  let totalScore = 0;

  for (const item of news) {
    const titleAnalysis = analyzeSentiment(item.title);
    const contentAnalysis = analyzeSentiment(item.content);
    const combinedScore = titleAnalysis.score * 2 + contentAnalysis.score;

    signals.push({
      source: item.source,
      sentiment: combinedScore > 0 ? "positive" : combinedScore < 0 ? "negative" : "neutral",
      intensity: Math.min(Math.abs(combinedScore) / 5, 1),
      keywords: [...titleAnalysis.keywords, ...contentAnalysis.keywords],
      description: item.title,
    });

    totalScore += combinedScore;
  }

  const normalizedScore = news.length > 0 ? totalScore / (news.length * 5) : 0;
  const clampedScore = Math.max(-1, Math.min(1, normalizedScore));

  let label: SentimentResult["label"];
  if (clampedScore > 0.4) label = "very_positive";
  else if (clampedScore > 0.1) label = "positive";
  else if (clampedScore < -0.4) label = "very_negative";
  else if (clampedScore < -0.1) label = "negative";
  else label = "neutral";

  return {
    score: Math.round(clampedScore * 100) / 100,
    label,
    confidence: Math.min(0.5 + Math.abs(clampedScore) * 0.5, 1),
    signals,
  };
}

export function calculateFearGreedIndex(
  sentiment: SentimentResult,
  volatility: number,
  momentum: number,
  volumeTrend: number
): { value: number; label: string } {
  const sentimentComponent = (sentiment.score + 1) * 50;
  const volatilityComponent = Math.max(0, 100 - volatility * 10);
  const momentumComponent = (momentum + 1) * 50;
  const volumeComponent = (volumeTrend + 1) * 50;

  const value = Math.round(
    sentimentComponent * 0.3 +
    volatilityComponent * 0.25 +
    momentumComponent * 0.25 +
    volumeComponent * 0.2
  );

  let label: string;
  if (value > 75) label = "طمع شديد";
  else if (value > 55) label = "طمع";
  else if (value > 45) label = "محايد";
  else if (value > 25) label = "خوف";
  else label = "خوف شديد";

  return { value: Math.max(0, Math.min(100, value)), label };
}

export function detectFakeNews(item: NewsItem): { isSuspicious: boolean; reasons: string[] } {
  const reasons: string[] = [];

  const sensationalWords = ["صدمة", "كارثة", "مفاجأة", "shocking", "breaking", "urgent"];
  const hasSensationalism = sensationalWords.some((w) =>
    item.title.toLowerCase().includes(w)
  );
  if (hasSensationalism) reasons.push("عنوان مبالغ فيه");

  if (!item.source || item.source.length < 3) reasons.push("مصدر غير واضح");

  if (item.content.length < 50) reasons.push("محتوى قصير جداً - ناقص التفاصيل");

  return { isSuspicious: reasons.length > 0, reasons };
}

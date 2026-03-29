export interface StrategyRule {
  id: string;
  type: "indicator" | "price" | "volume" | "time" | "pattern";
  indicator?: string;
  condition: "above" | "below" | "crosses_above" | "crosses_below" | "equals";
  value: number | string;
  period?: number;
  logic: "AND" | "OR";
}

export interface VisualStrategy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  rules: StrategyRule[];
  action: "buy" | "sell" | "both";
  timeframe: string;
  isActive: boolean;
}

export const AVAILABLE_INDICATORS = [
  { id: "RSI", nameAr: "RSI - مؤشر القوة النسبية", period: 14 },
  { id: "MACD", nameAr: "MACD - التقارب والتباعد", period: 12 },
  { id: "SMA", nameAr: "SMA - المتوسط المتحرك البسيط", period: 20 },
  { id: "EMA", nameAr: "EMA - المتوسط المتحرك الأسي", period: 21 },
  { id: "BB", nameAr: "BB - بولينجر باندز", period: 20 },
  { id: "Stochastic", nameAr: "Stochastic - العشوائي", period: 14 },
  { id: "ATR", nameAr: "ATR - متوسط النطاق الحقيقي", period: 14 },
  { id: "ADX", nameAr: "ADX - مؤشر الاتجاه", period: 14 },
  { id: "CCI", nameAr: "CCI - مؤشر القناة السلعية", period: 20 },
  { id: "MFI", nameAr: "MFI - مؤشر تدفق الأموال", period: 14 },
  { id: "OBV", nameAr: "OBV - توازن الحجم", period: 0 },
  { id: "VWAP", nameAr: "VWAP - متوسط السعر المرجح بالحجم", period: 0 },
  { id: "Ichimoku", nameAr: "Ichimoku - إيشيموكو", period: 26 },
  { id: "Fibonacci", nameAr: "Fibonacci - فيبوناتشي", period: 0 },
];

export const AVAILABLE_CONDITIONS = [
  { id: "above", nameAr: "أعلى من" },
  { id: "below", nameAr: "أقل من" },
  { id: "crosses_above", nameAr: "يعبر لأعلى" },
  { id: "crosses_below", nameAr: "يعبر لأسفل" },
  { id: "equals", nameAr: "يساوي" },
];

export const AVAILABLE_TIMEFRAMES = [
  { id: "1m", nameAr: "دقيقة واحدة" },
  { id: "5m", nameAr: "5 دقائق" },
  { id: "15m", nameAr: "15 دقيقة" },
  { id: "1h", nameAr: "ساعة" },
  { id: "4h", nameAr: "4 ساعات" },
  { id: "1D", nameAr: "يوم" },
  { id: "1W", nameAr: "أسبوع" },
];

export const PRESET_STRATEGIES: VisualStrategy[] = [
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    nameAr: "ارتداد RSI من التشبع البيعي",
    description: "شراء عندما يصل RSI أقل من 30 ثم يرتد فوق 30",
    rules: [
      { id: "r1", type: "indicator", indicator: "RSI", condition: "crosses_above", value: 30, period: 14, logic: "AND" },
    ],
    action: "buy",
    timeframe: "1h",
    isActive: true,
  },
  {
    id: "macd-crossover",
    name: "MACD Bullish Crossover",
    nameAr: "تقاطع MACD الصاعد",
    description: "شراء عند تقاطع خط MACD فوق خط الإشارة",
    rules: [
      { id: "r1", type: "indicator", indicator: "MACD", condition: "crosses_above", value: 0, period: 12, logic: "AND" },
    ],
    action: "buy",
    timeframe: "4h",
    isActive: true,
  },
  {
    id: "bb-squeeze",
    name: "Bollinger Band Squeeze",
    nameAr: "انقباض بولينجر باندز",
    description: "إشارة عند انضباط الباندز (تقلبات منخفضة قبل انفجار)",
    rules: [
      { id: "r1", type: "indicator", indicator: "BB", condition: "below", value: 0.02, period: 20, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "ADX", condition: "below", value: 20, period: 14, logic: "AND" },
    ],
    action: "both",
    timeframe: "1h",
    isActive: true,
  },
];

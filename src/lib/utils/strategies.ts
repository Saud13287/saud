export interface StrategyRule {
  id: string;
  type: "indicator" | "price" | "volume" | "time" | "pattern" | "smc" | "ict";
  indicator?: string;
  condition: "above" | "below" | "crosses_above" | "crosses_below" | "equals" | "touches" | "rejection";
  value: number | string;
  period?: number;
  logic: "AND" | "OR";
}

export interface VisualStrategy {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  category: string;
  rules: StrategyRule[];
  action: "buy" | "sell" | "both";
  timeframe: string;
  isActive: boolean;
  winRate: number;
  totalTrades: number;
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
  { id: "SuperTrend", nameAr: "SuperTrend", period: 10 },
  { id: "PivotPoints", nameAr: "نقاط المحور", period: 0 },
];

export const SMC_INDICATORS = [
  { id: "OrderBlock", nameAr: "Order Block - بلوك الأوامر" },
  { id: "FVG", nameAr: "FVG - فجوة القيمة العادلة" },
  { id: "BOS", nameAr: "BOS - كسر الهيكل" },
  { id: "CHoCH", nameAr: "CHoCH - تغير خصوصية" },
  { id: "LiquiditySweep", nameAr: "سحب السيولة" },
  { id: "Displacement", nameAr: "إزاحة قوية" },
  { id: "OTE", nameAr: "OTE - نقطة الدخول المثلى" },
  { id: "KillZone", nameAr: "Kill Zone - منطقة القتل" },
  { id: "PDArray", nameAr: "PD Array - مصفوفة القبول/الرفض" },
  { id: "PremiumDiscount", nameAr: "Premium/Discount - عالي/منخفض" },
];

export const AVAILABLE_CONDITIONS = [
  { id: "above", nameAr: "أعلى من" },
  { id: "below", nameAr: "أقل من" },
  { id: "crosses_above", nameAr: "يعبر لأعلى" },
  { id: "crosses_below", nameAr: "يعبر لأسفل" },
  { id: "equals", nameAr: "يساوي" },
  { id: "touches", nameAr: "يلمس" },
  { id: "rejection", nameAr: "رفض السعر" },
];

export const AVAILABLE_TIMEFRAMES = [
  { id: "1m", nameAr: "دقيقة واحدة" },
  { id: "5m", nameAr: "5 دقائق" },
  { id: "15m", nameAr: "15 دقيقة" },
  { id: "30m", nameAr: "30 دقيقة" },
  { id: "1h", nameAr: "ساعة" },
  { id: "4h", nameAr: "4 ساعات" },
  { id: "1D", nameAr: "يوم" },
  { id: "1W", nameAr: "أسبوع" },
  { id: "1M", nameAr: "شهر" },
];

export const STRATEGY_CATEGORIES = [
  { id: "technical", nameAr: "فني", nameEn: "Technical" },
  { id: "smc", nameAr: "SMC - هيكل السوق", nameEn: "Smart Money" },
  { id: "ict", nameAr: "ICT - نظرية العملات", nameEn: "ICT" },
  { id: "crt", nameAr: "CRT - تأكيد الاتجاه", nameEn: "CRT" },
  { id: "quantitative", nameAr: "كمي", nameEn: "Quantitative" },
  { id: "fractional", nameAr: "كسري", nameEn: "Fractional" },
  { id: "liquidity", nameAr: "سيولة", nameEn: "Liquidity" },
  { id: "custom", nameAr: "مخصص", nameEn: "Custom" },
];

export const PRESET_STRATEGIES: VisualStrategy[] = [
  {
    id: "smc-order-block",
    name: "SMC Order Block Entry",
    nameAr: "SMC - دخول بلوك الأوامر",
    description: "دخول عند اختبار بلوك أوامر مع تأكيد حجم و BOS",
    category: "smc",
    rules: [
      { id: "r1", type: "smc", indicator: "OrderBlock", condition: "touches", value: "demand", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "Volume", condition: "above", value: 1.5, period: 20, logic: "AND" },
      { id: "r3", type: "smc", indicator: "BOS", condition: "above", value: "confirmed", period: 0, logic: "AND" },
    ],
    action: "buy", timeframe: "15m", isActive: true, winRate: 72, totalTrades: 0,
  },
  {
    id: "ict-fvg",
    name: "ICT Fair Value Gap",
    nameAr: "ICT - فجوة القيمة العادلة",
    description: "دخول عند ملء FVG مع تأكيد RSI و Kill Zone",
    category: "ict",
    rules: [
      { id: "r1", type: "ict", indicator: "FVG", condition: "touches", value: "unfilled", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "RSI", condition: "below", value: 40, period: 14, logic: "AND" },
      { id: "r3", type: "ict", indicator: "KillZone", condition: "above", value: "active", period: 0, logic: "AND" },
    ],
    action: "buy", timeframe: "15m", isActive: true, winRate: 68, totalTrades: 0,
  },
  {
    id: "ict-ote",
    name: "ICT Optimal Trade Entry",
    nameAr: "ICT - نقطة الدخول المثلى",
    description: "دخول في منطقة OTE (فيبوناتشي 62-79%) مع RSI",
    category: "ict",
    rules: [
      { id: "r1", type: "ict", indicator: "OTE", condition: "touches", value: "0.62-0.79", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "RSI", condition: "below", value: 35, period: 14, logic: "AND" },
    ],
    action: "buy", timeframe: "1h", isActive: true, winRate: 75, totalTrades: 0,
  },
  {
    id: "smc-liquidity-sweep",
    name: "SMC Liquidity Sweep",
    nameAr: "سحب السيولة - اختراق وعودة",
    description: "دخول بعد سحب السيولة وعودة مع شموع انعكاس",
    category: "liquidity",
    rules: [
      { id: "r1", type: "smc", indicator: "LiquiditySweep", condition: "above", value: "swept", period: 0, logic: "AND" },
      { id: "r2", type: "pattern", indicator: "Engulfing", condition: "above", value: "confirmed", period: 0, logic: "AND" },
      { id: "r3", type: "indicator", indicator: "Volume", condition: "above", value: 2.0, period: 20, logic: "AND" },
    ],
    action: "both", timeframe: "5m", isActive: true, winRate: 70, totalTrades: 0,
  },
  {
    id: "crt-confirmation",
    name: "CRT Confirmation Entry",
    nameAr: "CRT - دخول بتأكيد الاتجاه",
    description: "دخول بعد CRT مع MACD و ADX",
    category: "crt",
    rules: [
      { id: "r1", type: "price", indicator: "Level", condition: "rejection", value: "key_level", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "MACD", condition: "crosses_above", value: 0, period: 12, logic: "AND" },
      { id: "r3", type: "indicator", indicator: "ADX", condition: "above", value: 25, period: 14, logic: "AND" },
    ],
    action: "buy", timeframe: "1h", isActive: true, winRate: 65, totalTrades: 0,
  },
  {
    id: "smc-bos",
    name: "SMC Break of Structure",
    nameAr: "SMC - كسر الهيكل",
    description: "دخول بعد BOS مع إعادة اختبار و EMA",
    category: "smc",
    rules: [
      { id: "r1", type: "smc", indicator: "BOS", condition: "above", value: "confirmed", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "EMA", condition: "crosses_above", value: 50, period: 50, logic: "AND" },
    ],
    action: "buy", timeframe: "1h", isActive: true, winRate: 73, totalTrades: 0,
  },
  {
    id: "ict-judas-swing",
    name: "ICT Judas Swing",
    nameAr: "ICT - جوداس سوينغ",
    description: "التقاط حركة جوداس في بداية جلسة نيويورك",
    category: "ict",
    rules: [
      { id: "r1", type: "ict", indicator: "KillZone", condition: "above", value: "NYOpen", period: 0, logic: "AND" },
      { id: "r2", type: "smc", indicator: "LiquiditySweep", condition: "above", value: "swept", period: 0, logic: "AND" },
      { id: "r3", type: "indicator", indicator: "Volume", condition: "above", value: 1.8, period: 20, logic: "AND" },
    ],
    action: "both", timeframe: "5m", isActive: true, winRate: 71, totalTrades: 0,
  },
  {
    id: "smc-displacement",
    name: "SMC Displacement + OB",
    nameAr: "SMC - إزاحة + بلوك أوامر",
    description: "دخول بعد إزاحة قوية مع اختبار Order Block",
    category: "smc",
    rules: [
      { id: "r1", type: "smc", indicator: "Displacement", condition: "above", value: "strong", period: 0, logic: "AND" },
      { id: "r2", type: "smc", indicator: "OrderBlock", condition: "touches", value: "mitigated", period: 0, logic: "AND" },
      { id: "r3", type: "indicator", indicator: "Volume", condition: "above", value: 1.5, period: 20, logic: "AND" },
    ],
    action: "buy", timeframe: "15m", isActive: true, winRate: 74, totalTrades: 0,
  },
  {
    id: "quant-mean-reversion",
    name: "Quantitative Mean Reversion",
    nameAr: "التحليل الرقمي - عودة المتوسط",
    description: "استراتيجية كمية مع Z-Score و Bollinger Bands",
    category: "quantitative",
    rules: [
      { id: "r1", type: "indicator", indicator: "BB", condition: "below", value: -2, period: 20, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "RSI", condition: "below", value: 30, period: 14, logic: "AND" },
    ],
    action: "buy", timeframe: "1h", isActive: true, winRate: 64, totalTrades: 0,
  },
  {
    id: "fractional-elliott",
    name: "Fractional Elliott Wave",
    nameAr: "التحليل الكسري - موجات إليوت",
    description: "تحليل كسري مع موجات إليوت لتحديد الهدف",
    category: "fractional",
    rules: [
      { id: "r1", type: "pattern", indicator: "ElliottWave", condition: "above", value: "wave3", period: 0, logic: "AND" },
      { id: "r2", type: "indicator", indicator: "Fibonacci", condition: "above", value: 1.618, period: 0, logic: "AND" },
      { id: "r3", type: "indicator", indicator: "RSI", condition: "below", value: 70, period: 14, logic: "AND" },
    ],
    action: "buy", timeframe: "4h", isActive: true, winRate: 66, totalTrades: 0,
  },
  {
    id: "rsi-oversold",
    name: "RSI Oversold Bounce",
    nameAr: "ارتداد RSI من التشبع",
    description: "شراء عند RSI أقل من 30 وارتداد",
    category: "technical",
    rules: [
      { id: "r1", type: "indicator", indicator: "RSI", condition: "crosses_above", value: 30, period: 14, logic: "AND" },
    ],
    action: "buy", timeframe: "1h", isActive: true, winRate: 62, totalTrades: 0,
  },
  {
    id: "macd-crossover",
    name: "MACD Bullish Crossover",
    nameAr: "تقاطع MACD الصاعد",
    description: "شراء عند تقاطع MACD فوق الإشارة",
    category: "technical",
    rules: [
      { id: "r1", type: "indicator", indicator: "MACD", condition: "crosses_above", value: 0, period: 12, logic: "AND" },
    ],
    action: "buy", timeframe: "4h", isActive: true, winRate: 58, totalTrades: 0,
  },
];

"use client";
import { useState, useMemo } from "react";

interface BrokerAccount {
  id: string;
  name: string;
  nameAr: string;
  type: "demo" | "live";
  broker: string;
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  status: "connected" | "disconnected" | "error";
  balances: { asset: string; free: number; total: number }[];
  lastCheck: string;
}

interface UAEBroker {
  id: string;
  name: string;
  nameAr: string;
  regulation: string;
  country: string;
  assets: string[];
  minDeposit: string;
  website: string;
  rating: number;
  description: string;
  features: string[];
}

const UAE_BROKERS: UAEBroker[] = [
  {
    id: "adss",
    name: "ADSS (ADS Securities)",
    nameAr: "إيه دي إس سيكيورتيز",
    regulation: "SCA | CBUAE",
    country: "أبوظبي، الإمارات",
    assets: ["فوركس", "سلع", "مؤشرات", "أسهم"],
    minDeposit: "$200",
    website: "adss.com",
    rating: 4.8,
    description: "وسيط إماراتي رائد مقره أبوظبي، مرخص من هيئة الأوراق المالية والسلع الإماراتية",
    features: ["منصة OREX المتقدمة", "رافعة مالية تصل 1:500", "دعم عربي 24/5", "حسابات إسلامية"],
  },
  {
    id: "shuaa",
    name: "SHUAA Capital",
    nameAr: "شويا كابيتال",
    regulation: "SCA | DFM",
    country: "دبي، الإمارات",
    assets: ["أسهم إماراتية", "صناديق", "سندات"],
    minDeposit: "$1,000",
    website: "shuaa.com",
    rating: 4.7,
    description: "بنك استثماري إماراتي مرخص مدرج في سوق دبي المالي",
    features: ["وصول للأسهم الإماراتية", "صناديق استثمارية", "تحليل أساسي متقدم", "إدارة محافظ"],
  },
  {
    id: "emirates-nbd",
    name: "Emirates NBD Securities",
    nameAr: " Emirates NBD للأوراق المالية",
    regulation: "SCA | DFM | ADX",
    country: "دبي، الإمارات",
    assets: ["أسهم إماراتية", "أسهم عالمية", "صناديق"],
    minDeposit: "$500",
    website: "emiratesnbd.com/securities",
    rating: 4.6,
    description: "ذراع الوساطة لبنك الإمارات NBD - أكبر بنك في الإمارات",
    features: ["ربط مع حساب البنك", "تداول أسهم الإمارات", "أبحاث يومية", "تطبيق موبايل متقدم"],
  },
  {
    id: "adcb",
    name: "ADCB Securities",
    nameAr: "أبوظبي التجاري للأوراق المالية",
    regulation: "SCA | ADX",
    country: "أبوظبي، الإمارات",
    assets: ["أسهم إماراتية", "صناديق ETF"],
    minDeposit: "$500",
    website: "adcb.com/securities",
    rating: 4.5,
    description: "خدمات الوساطة لبنك أبوظبي التجاري - تداول في أسواق أبوظبي ودبي",
    features: ["وصول مباشر لسوق أبوظبي", "ربط مصرفي", "أبحاث السوق", "رسوم تنافسية"],
  },
  {
    id: "multibank",
    name: "MultiBank Group",
    nameAr: "ملتي بنك جروب",
    regulation: "DFSA | ASIC | CySEC",
    country: "دبي، الإمارات",
    assets: ["فوركس", "سلع", "كريبتو", "مؤشرات"],
    minDeposit: "$50",
    website: "multibankfx.com",
    rating: 4.7,
    description: "مجموعة مالية عالمية مقرها دبي، مرخصة من هيئة دبي للخدمات المالية",
    features: ["1000+ أداة مالية", "رافعة 1:500", "حسابات ECN", "منصة MT4/MT5"],
  },
  {
    id: "equiti",
    name: "Equiti Securities",
    nameAr: "إكوتي سيكيورتيز",
    regulation: "DFSA | CMA",
    country: "دبي، الإمارات",
    assets: ["فوركس", "سلع", "كريبتو", "أسهم"],
    minDeposit: "$100",
    website: "equiti.com",
    rating: 4.6,
    description: "وسيط مرخص من هيئة دبي للخدمات المالية مع تواجد قوي في المنطقة",
    features: ["تنفيذ سريع", "دعم عربي محترف", " MT4/MT5", "حسابات VIP"],
  },
  {
    id: "century",
    name: "Century Financial",
    nameAr: "سنشري فاينانشال",
    regulation: "SCA",
    country: "دبي، الإمارات",
    assets: ["فوركس", "سلع", "مؤشرات", "أسهم عالمية"],
    minDeposit: "$500",
    website: "centuryfinancial.ae",
    rating: 4.5,
    description: "شركة وساطة إماراتية عريقة تعمل منذ أكثر من 30 عاماً",
    features: ["خبرة 30+ عام", "أبحاث يومية", "ورش عمل تعليمية", "حسابات إسلامية"],
  },
  {
    id: "saxo",
    name: "Saxo Bank",
    nameAr: "ساكسو بنك",
    regulation: "DFSA | FSA | FINMA",
    country: "دبي (DIFC)",
    assets: ["فوركس", "أسهم", "سندات", "سلع", "خيارات"],
    minDeposit: "$2,000",
    website: "saxobank.com",
    rating: 4.9,
    description: "بنك دنمركي متخصص في التداول عبر الإنترنت مع ترخيص DFSA في دبي",
    features: ["40,000+ أداة", "منصة SaxoTraderGO", "تحليلات متقدمة", "تعدد الأصول"],
  },
  {
    id: "ig",
    name: "IG Markets",
    nameAr: "آي جي ماركتس",
    regulation: "DFSA | FCA | ASIC",
    country: "دبي (DIFC)",
    assets: ["فوركس", "CFD", "خيارات", "كريبتو"],
    minDeposit: "$250",
    website: "ig.com",
    rating: 4.8,
    description: "وسيط عالمي رائد مرخص من FCA و DFSA مع أكثر من 45 سنة خبرة",
    features: ["17,000+ سوق", "منصة ProRealTime", "عدم وجود عمولة", "تعليم متقدم"],
  },
  {
    id: "cmc",
    name: "CMC Markets",
    nameAr: "سي إم سي ماركتس",
    regulation: "DFSA | FCA | ASIC",
    country: "دبي (DIFC)",
    assets: ["فوركس", "سلع", "مؤشرات", "أسهم", "سندات"],
    minDeposit: "$0",
    website: "cmcmarkets.com",
    rating: 4.7,
    description: "وسيط بريطاني عالمي مع منصة Next Generation المتقدمة",
    features: ["12,000+ سوق", "رسوم منخفضة", "منصة Next Gen", "أدوات رسم بياني متقدمة"],
  },
  {
    id: "xtb",
    name: "XTB",
    nameAr: "إكس تي بي",
    regulation: "DFSA | FCA | CySEC",
    country: "دبي",
    assets: ["فوركس", "سلع", "كريبتو", "أسهم حقيقية"],
    minDeposit: "$0",
    website: "xtb.com",
    rating: 4.6,
    description: "وسيط أوروبي مقره بولندا مع ترخيص DFSA - أسهم حقيقية بدون عمولة",
    features: ["أسهم حقيقية 0% عمولة", "منصة xStation", "تعليم XTB Academy", "حساب إسلامي"],
  },
  {
    id: "pepperstone",
    name: "Pepperstone",
    nameAr: "بيبرستون",
    regulation: "DFSA | ASIC | FCA | CySEC",
    country: "دبي",
    assets: ["فوركس", "سلع", "كريبتو", "مؤشرات"],
    minDeposit: "$200",
    website: "pepperstone.com",
    rating: 4.8,
    description: "وسيط أسترالي عالمي مشهور بسرعة التنفيذ وانتشارات منخفضة",
    features: ["تنفيذ فائق السرعة", "0.0 spread حساب Razor", "MT4/MT5/cTrader", "بدون عمولة مخفية"],
  },
  {
    id: "avatrade",
    name: "AvaTrade",
    nameAr: "أفاتريد",
    regulation: "ADGM | ASIC | CBI | CySEC",
    country: "أبوظبي (ADGM)",
    assets: ["فوركس", "سلع", "كريبتو", "أسهم", "خيارات"],
    minDeposit: "$100",
    website: "avatrade.com",
    rating: 4.6,
    description: "وسيط عالمي مرخص من ADGM في أبوظبي مع أكثر من 300,000 عميل",
    features: ["300+ أداة", "منصة AvaTradeGO", " نسخ التداول", " حماية الرصيد السلبي"],
  },
  {
    id: "hfmarkets",
    name: "HF Markets (HotForex)",
    nameAr: "إتش إف ماركتس",
    regulation: "DFSA | FCA | CySEC | FSCA",
    country: "دبي",
    assets: ["فوركس", "سلع", "كريبتو", "أسهم", "صناديق"],
    minDeposit: "$5",
    website: "hfm.com",
    rating: 4.5,
    description: "وسيط عالمي مع ترخيص DFSA - حد أدنى منخفض جداً للإيداع",
    features: ["إيداع من $5", "حسابات متنوعة", " مكافآت وعروض", "منصة HF App"],
  },
  {
    id: "fxcm",
    name: "FXCM",
    nameAr: "إف إكس سي إم",
    regulation: "DFSA | FCA | ASIC | CySEC",
    country: "دبي",
    assets: ["فوركس", "سلع", "مؤشرات", "كريبتو"],
    minDeposit: "$50",
    website: "fxcm.com",
    rating: 4.4,
    description: "وسيط عالمي رائد في الفوركس مع أكثر من 20 سنة خبرة",
    features: ["منصة Trading Station", "执行 سريعة", "أدوات متقدمة", "أبحاث يومية"],
  },
  {
    id: "etoro",
    name: "eToro",
    nameAr: "إي تورو",
    regulation: "FCA | CySEC | ASIC | FinCEN",
    country: "متاح في الإمارات",
    assets: ["أسهم", "كريبتو", "فوركس", "ETF", "صناديق"],
    minDeposit: "$100",
    website: "etoro.com",
    rating: 4.5,
    description: "منصة تداول اجتماعية رائدة عالمياً مع ميزة نسخ المتداولين",
    features: ["نسخ المتداولين", "أسهم حقيقية", "محفظة Smart Portfolio", "واجهة سهلة"],
  },
  {
    id: "swissquote",
    name: "Swissquote",
    nameAr: "سويز كووت",
    regulation: "FINMA | DFSA | FCA",
    country: "دبي (DIFC)",
    assets: ["فوركس", "أسهم", "سندات", "كريبتو", "صناديق"],
    minDeposit: "$1,000",
    website: "swissquote.com",
    rating: 4.7,
    description: "بنك سويسري مرخص مع تواجد في DIFC - الأمان السويسري",
    features: ["بنك سويسري مرخص", "100+ سوق عالمي", "حفظ أصول", "أمان متقدم"],
  },
  {
    id: "al-ansari",
    name: "Al Ansari Exchange - Invest",
    nameAr: "الأنصاري إكسchange - استثمار",
    regulation: "SCA | CBUAE",
    country: "دبي، الإمارات",
    assets: ["أسهم إماراتية", "صناديق", "عملات"],
    minDeposit: "$200",
    website: "alansariexchange.com",
    rating: 4.3,
    description: "ذراع الاستثمار لمجموعة الأنصاري للصرافة - شبكة واسعة في الإمارات",
    features: ["شبكة 200+ فرع", " تحويلات دولية", "حسابات توفير", " وصول سهل"],
  },
  {
    id: "ib-uae",
    name: "Interactive Brokers (ADGM)",
    nameAr: "إنتراكتيف بروكرز",
    regulation: "ADGM | SEC | FCA | CBI",
    country: "أبوظبي (ADGM)",
    assets: ["أسهم", "خيارات", "سندات", "فوركس", "سلع", "ETF"],
    minDeposit: "$0",
    website: "interactivebrokers.com",
    rating: 4.9,
    description: "أكبر وسيط تفاعلي عالمياً مع ترخيص ADGM في أبوظبي - 150+ سوق عالمي",
    features: ["150+ سوق عالمي", "أقل عمولات", "منصة TWS", "تعدد العملات"],
  },
  {
    id: "tradestation",
    name: "TradeStation International",
    nameAr: "تريدي ستيشن",
    regulation: "FCA | SIPC",
    country: "متاح في الإمارات",
    assets: ["أسهم", "خيارات", "期货", "كريبتو"],
    minDeposit: "$500",
    website: "tradestation.com",
    rating: 4.4,
    description: "منصة تداول متقدمة مع أدوات تحليل فنية قوية وبرمجة متقدمة",
    features: ["لغة EasyLanguage", "تحليل فني متقدم", " محاكاة متقدمة", "API مفتوح"],
  },
];

const STORAGE_KEY = "saud-broker-accounts";

function loadAccounts(): BrokerAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch { return []; }
}

function saveAccounts(accounts: BrokerAccount[]) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts)); } catch {}
}

export default function BrokerPage() {
  const [accounts, setAccounts] = useState<BrokerAccount[]>(loadAccounts);
  const [showAdd, setShowAdd] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"accounts" | "directory">("directory");
  const [selectedBroker, setSelectedBroker] = useState<UAEBroker | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterReg, setFilterReg] = useState("all");
  const [newAccount, setNewAccount] = useState({
    name: "", broker: "binance", type: "demo" as "demo" | "live",
    apiKey: "", apiSecret: "", testnet: true,
  });
  const [connecting, setConnecting] = useState<string | null>(null);

  const filteredBrokers = useMemo(() => {
    return UAE_BROKERS.filter((b) => {
      const matchSearch = !searchTerm ||
        b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        b.nameAr.includes(searchTerm) ||
        b.regulation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchReg = filterReg === "all" || b.regulation.includes(filterReg);
      return matchSearch && matchReg;
    });
  }, [searchTerm, filterReg]);

  const regulations = useMemo(() => {
    const regs = new Set<string>();
    UAE_BROKERS.forEach((b) => b.regulation.split(" | ").forEach((r) => regs.add(r)));
    return Array.from(regs).sort();
  }, []);

  const addAccount = () => {
    if (!newAccount.apiKey || !newAccount.apiSecret) return;
    const account: BrokerAccount = {
      id: `broker-${Date.now()}`,
      name: newAccount.name || `${newAccount.broker} ${newAccount.type}`,
      nameAr: selectedBroker?.nameAr || newAccount.broker,
      type: newAccount.type,
      broker: newAccount.broker,
      apiKey: newAccount.apiKey,
      apiSecret: newAccount.apiSecret,
      testnet: newAccount.type === "demo",
      status: "disconnected",
      balances: [],
      lastCheck: new Date().toLocaleTimeString("ar-SA"),
    };
    const updated = [...accounts, account];
    setAccounts(updated);
    saveAccounts(updated);
    setShowAdd(false);
    setSelectedBroker(null);
    setNewAccount({ name: "", broker: "binance", type: "demo", apiKey: "", apiSecret: "", testnet: true });
  };

  const connectAccount = async (account: BrokerAccount) => {
    setConnecting(account.id);
    try {
      if (account.broker === "binance") {
        const res = await fetch("/api/broker", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "connect", broker: "binance",
            config: { apiKey: account.apiKey, apiSecret: account.apiSecret, testnet: account.testnet },
          }),
        });
        const data = await res.json();
        const updated = accounts.map((a) => {
          if (a.id !== account.id) return a;
          return {
            ...a,
            status: data.success ? "connected" as const : "error" as const,
            balances: data.balances || [],
            lastCheck: new Date().toLocaleTimeString("ar-SA"),
          };
        });
        setAccounts(updated);
        saveAccounts(updated);
      }
    } catch {
      const updated = accounts.map((a) => a.id === account.id ? { ...a, status: "error" as const } : a);
      setAccounts(updated);
      saveAccounts(updated);
    }
    setConnecting(null);
  };

  const removeAccount = (id: string) => {
    const updated = accounts.filter((a) => a.id !== id);
    setAccounts(updated);
    saveAccounts(updated);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">الوُسطاء المعتمدون في الإمارات</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">{UAE_BROKERS.length} وسيط معتمد ومُرخص</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedTab("directory")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === "directory" ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-card)] text-[var(--color-omega-text)]"
            }`}
          >
            📚 دليل الوسطاء
          </button>
          <button
            onClick={() => setSelectedTab("accounts")}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedTab === "accounts" ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-card)] text-[var(--color-omega-text)]"
            }`}
          >
            🔗 حساباتي ({accounts.length})
          </button>
        </div>
      </div>

      <div className="bg-amber-900/20 border border-amber-700/30 rounded-xl p-4 flex items-start gap-3">
        <span className="text-amber-400 text-lg">⚠️</span>
        <div>
          <p className="text-sm font-medium text-amber-300">تحذير أمني مهم</p>
          <p className="text-xs text-amber-200/70 mt-1">
            • استخدم مفتاح API مع صلاحية <strong>قراءة + تداول فقط</strong> (لا صلاحية سحب)<br/>
            • استخدم حساب <strong>تجريبي (Testnet)</strong> أولاً للاختبار<br/>
            • المفاتيح محفوظة في المتصفح فقط (localStorage)
          </p>
        </div>
      </div>

      {selectedTab === "directory" && (
        <>
          <div className="flex gap-3 flex-wrap">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ابحث عن وسيط..."
              className="flex-1 min-w-[200px] bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500"
              dir="rtl"
            />
            <select
              value={filterReg}
              onChange={(e) => setFilterReg(e.target.value)}
              className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs"
            >
              <option value="all">جميع التراخيص</option>
              {regulations.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredBrokers.map((broker) => (
              <div
                key={broker.id}
                className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4 hover:border-emerald-600/50 transition-all cursor-pointer"
                onClick={() => setSelectedBroker(selectedBroker?.id === broker.id ? null : broker)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold">{broker.nameAr}</h3>
                      <div className="flex items-center gap-0.5">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className={`text-[10px] ${i < Math.floor(broker.rating) ? "text-amber-400" : "text-gray-600"}`}>★</span>
                        ))}
                        <span className="text-[9px] text-[var(--color-omega-muted)] ml-1">{broker.rating}</span>
                      </div>
                    </div>
                    <p className="text-[10px] text-[var(--color-omega-muted)]">{broker.name} | {broker.country}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {broker.regulation.split(" | ").map((reg) => (
                        <span key={reg} className="text-[9px] bg-emerald-900/30 text-emerald-400 px-1.5 py-0.5 rounded font-medium">{reg}</span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedBroker(broker);
                      setNewAccount({ ...newAccount, broker: broker.id, name: broker.nameAr });
                      setShowAdd(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-lg text-[10px] font-medium transition-colors whitespace-nowrap"
                  >
                    + ربط
                  </button>
                </div>

                <p className="text-[10px] text-[var(--color-omega-muted)] mt-2">{broker.description}</p>

                <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--color-omega-muted)]">
                  <span>💰 الحد الأدنى: {broker.minDeposit}</span>
                  <span>📊 {broker.assets.join("، ")}</span>
                </div>

                {selectedBroker?.id === broker.id && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-omega-border)]">
                    <p className="text-[10px] font-bold text-emerald-400 mb-1">المميزات:</p>
                    <div className="flex flex-wrap gap-1">
                      {broker.features.map((f) => (
                        <span key={f} className="text-[9px] bg-[var(--color-omega-surface)] px-2 py-1 rounded">{f}</span>
                      ))}
                    </div>
                    <p className="text-[9px] text-[var(--color-omega-muted)] mt-2">
                      🌐 {broker.website}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {selectedTab === "accounts" && (
        <>
          <button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            + إضافة وسيط
          </button>

          {showAdd && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
              <h3 className="text-sm font-bold">
                إضافة وسيط جديد
                {selectedBroker && <span className="text-emerald-400 mr-2">({selectedBroker.nameAr})</span>}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اسم الحساب</label>
                  <input type="text" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                    placeholder="مثال: حساب تجريبي" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="rtl" />
                </div>
                <div>
                  <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الوسيط</label>
                  <select value={newAccount.broker} onChange={(e) => setNewAccount({ ...newAccount, broker: e.target.value })}
                    className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                    <option value="binance">Binance (بينانس)</option>
                    <option value="ib">Interactive Brokers</option>
                    {UAE_BROKERS.map((b) => (
                      <option key={b.id} value={b.id}>{b.nameAr} ({b.name})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-omega-muted)] block mb-1">نوع الحساب</label>
                  <select value={newAccount.type} onChange={(e) => setNewAccount({ ...newAccount, type: e.target.value as "demo" | "live" })}
                    className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                    <option value="demo">تجريبي (Demo/Testnet)</option>
                    <option value="live">حقيقي (Live)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-[var(--color-omega-muted)] block mb-1">API Key</label>
                  <input type="password" value={newAccount.apiKey} onChange={(e) => setNewAccount({ ...newAccount, apiKey: e.target.value })}
                    placeholder="أدخل API Key" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500" />
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs text-[var(--color-omega-muted)] block mb-1">API Secret</label>
                  <input type="password" value={newAccount.apiSecret} onChange={(e) => setNewAccount({ ...newAccount, apiSecret: e.target.value })}
                    placeholder="أدخل API Secret" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs font-mono focus:outline-none focus:border-emerald-500" />
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={addAccount} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-xs font-medium transition-colors">حفظ</button>
                <button onClick={() => { setShowAdd(false); setSelectedBroker(null); }} className="bg-[var(--color-omega-surface)] px-4 py-2 rounded-lg text-xs transition-colors">إلغاء</button>
              </div>
            </div>
          )}

          {accounts.length === 0 && !showAdd && (
            <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8 text-center">
              <p className="text-sm text-[var(--color-omega-muted)]">لا توجد حسابات وُسطاء مُربوطة</p>
              <p className="text-xs text-[var(--color-omega-muted)] mt-1">اذهب لـ &quot;دليل الوسطاء&quot; لاختيار وسيط أو اضغط &quot;+ إضافة وسيط&quot;</p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account) => (
              <div key={account.id} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center text-lg">
                      {account.broker === "binance" ? "🟡" : account.broker === "ib" ? "🔵" : "🟢"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{account.name}</p>
                      <p className="text-[10px] text-[var(--color-omega-muted)]">{account.nameAr} | {account.type === "demo" ? "تجريبي" : "حقيقي"}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`status-dot ${account.status === "connected" ? "status-completed" : account.status === "error" ? "status-error" : "status-idle"}`} />
                    <span className="text-[10px]">{account.status === "connected" ? "متصل" : account.status === "error" ? "خطأ" : "غير متصل"}</span>
                  </div>
                </div>

                {account.balances.length > 0 && (
                  <div className="bg-[var(--color-omega-surface)] rounded-lg p-3 space-y-1">
                    <p className="text-[10px] text-[var(--color-omega-muted)] mb-1">الأرصدة:</p>
                    {account.balances.slice(0, 5).map((b) => (
                      <div key={b.asset} className="flex items-center justify-between text-xs">
                        <span>{b.asset}</span>
                        <span className="font-mono">{b.free.toFixed(4)}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={() => connectAccount(account)} disabled={connecting === account.id}
                    className="flex-1 bg-emerald-600 hover:bg-emerald-700 py-2 rounded-lg text-xs font-medium transition-colors disabled:opacity-50">
                    {connecting === account.id ? "جاري الاتصال..." : account.status === "connected" ? "🔄 تحديث" : "🔌 اتصال"}
                  </button>
                  <button onClick={() => removeAccount(account.id)} className="bg-red-900/30 hover:bg-red-900/50 px-3 py-2 rounded-lg text-xs text-red-400 transition-colors">
                    🗑️
                  </button>
                </div>
                <p className="text-[9px] text-[var(--color-omega-muted)]">آخر فحص: {account.lastCheck}</p>
              </div>
            ))}
          </div>
        </>
      )}

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">📚 معلومات التراخيص في الإمارات</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs text-[var(--color-omega-muted)]">
          <div className="bg-[var(--color-omega-surface)] rounded-lg p-3">
            <p className="font-bold text-white mb-1">SCA</p>
            <p>هيئة الأوراق المالية والسلع - الهيئة الفيدرالية للإشراف على الأسواق المالية</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] rounded-lg p-3">
            <p className="font-bold text-white mb-1">DFSA</p>
            <p>هيئة دبي للخدمات المالية - الإشراف على مؤسسات DIFC</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] rounded-lg p-3">
            <p className="font-bold text-white mb-1">ADGM</p>
            <p>سوق أبوظبي العالمي - مركز مالي دولي في أبوظبي</p>
          </div>
          <div className="bg-[var(--color-omega-surface)] rounded-lg p-3">
            <p className="font-bold text-white mb-1">CBUAE</p>
            <p>مصرف الإمارات المركزي - الإشراف على البنوك والصرافة</p>
          </div>
        </div>
      </div>
    </div>
  );
}

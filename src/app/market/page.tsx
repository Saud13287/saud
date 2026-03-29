"use client";
import { useState, useEffect } from "react";
import TradingViewWidget from "@/components/tradingview/TradingViewWidget";
import TradingViewMarketOverview from "@/components/tradingview/MarketOverview";
import { fetchAllRealPrices, RealtimePrice, getFallbackPrices } from "@/lib/market/realtime";

const ASSET_CATEGORIES = [
  { id: "all", label: "الكل", icon: "🌍" },
  { id: "crypto", label: "العملات الرقمية", icon: "₿" },
  { id: "forex", label: "الفوركس", icon: "💱" },
  { id: "commodities", label: "السلع", icon: "🛢️" },
  { id: "indices", label: "المؤشرات", icon: "📊" },
];

const ASSET_CATEGORY_MAP: Record<string, string> = {
  BTCUSD: "crypto", ETHUSD: "crypto", SOLUSD: "crypto", BNBUSD: "crypto",
  XRPUSD: "crypto", ADAUSD: "crypto", DOGEUSD: "crypto", DOTUSD: "crypto", AVAXUSD: "crypto", LINKUSD: "crypto",
  EURUSD: "forex", GBPUSD: "forex", USDJPY: "forex",
  XAUUSD: "commodities", XAGUSD: "commodities", USOIL: "commodities",
  SPX500: "indices", NAS100: "indices", US30: "indices",
};

const TRADINGVIEW_SYMBOLS: Record<string, string> = {
  BTCUSD: "BITSTAMP:BTCUSD", ETHUSD: "BITSTAMP:ETHUSD", SOLUSD: "BINANCE:SOLUSDT",
  BNBUSD: "BINANCE:BNBUSDT", XRPUSD: "BITSTAMP:XRPUSD", ADAUSD: "BITSTAMP:ADAUSD",
  DOGEUSD: "BITSTAMP:DOGEUSD", DOTUSD: "BITSTAMP:DOTUSD",
  XAUUSD: "FX_IDC:XAUUSD", XAGUSD: "FX_IDC:XAGUSD", USOIL: "TVC:USOIL",
  EURUSD: "FX_IDC:EURUSD", GBPUSD: "FX_IDC:GBPUSD", USDJPY: "FX_IDC:USDJPY",
  SPX500: "SP:SPX", NAS100: "BLACKBULL:NAS100", US30: "BLACKBULL:US30",
};

const INTERVALS = [
  { value: "1", label: "1د" }, { value: "5", label: "5د" }, { value: "15", label: "15د" },
  { value: "60", label: "1س" }, { value: "D", label: "يوم" }, { value: "W", label: "أسبوع" },
];

export default function MarketPage() {
  const [prices, setPrices] = useState<RealtimePrice[]>(getFallbackPrices);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSymbol, setSelectedSymbol] = useState("FX_IDC:XAUUSD");
  const [selectedInterval, setSelectedInterval] = useState("D");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchAllRealPrices().then((data) => {
      if (data.length > 0) setPrices(data);
    }).catch(() => {});
    const interval = setInterval(() => {
      fetchAllRealPrices().then((data) => {
        if (data.length > 0) setPrices(data);
      }).catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getCategory = (symbol: string): string => {
    return ASSET_CATEGORY_MAP[symbol] || "indices";
  };

  const filteredPrices = prices.filter((p) => {
    const matchCategory = selectedCategory === "all" || getCategory(p.symbol) === selectedCategory;
    const matchSearch = !searchQuery || p.symbol.toLowerCase().includes(searchQuery.toLowerCase()) || p.nameAr.includes(searchQuery);
    return matchCategory && matchSearch;
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h1 className="text-xl font-bold">السوق المباشر</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">{prices.length} أصل متاح</p>
        </div>
        <div className="flex items-center gap-1">
          {INTERVALS.map((iv) => (
            <button key={iv.value} onClick={() => setSelectedInterval(iv.value)}
              className={`px-2.5 py-1 rounded text-xs font-medium transition-all ${selectedInterval === iv.value ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-card)] text-[var(--color-omega-muted)] hover:text-white"}`}>
              {iv.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-hidden">
        <TradingViewWidget symbol={selectedSymbol} interval={selectedInterval} height={450} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-hidden">
          <TradingViewMarketOverview height={400} />
        </div>

        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold">قائمة الأصول ({filteredPrices.length})</h3>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="بحث..." className="bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded px-2 py-1 text-xs w-24 focus:outline-none focus:border-emerald-500" dir="rtl" />
          </div>

          <div className="flex gap-1 mb-3 overflow-x-auto">
            {ASSET_CATEGORIES.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.id)}
                className={`px-2 py-1 rounded text-[10px] font-medium whitespace-nowrap transition-all ${selectedCategory === cat.id ? "bg-emerald-600 text-white" : "bg-[var(--color-omega-surface)] text-[var(--color-omega-muted)]"}`}>
                {cat.icon} {cat.label}
              </button>
            ))}
          </div>

          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {filteredPrices.map((asset) => {
              const tvSymbol = TRADINGVIEW_SYMBOLS[asset.symbol];
              const isSelected = tvSymbol === selectedSymbol;
              return (
                <button key={asset.symbol} onClick={() => tvSymbol && setSelectedSymbol(tvSymbol)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-all text-right ${isSelected ? "bg-emerald-900/30 border border-emerald-700/30" : "hover:bg-[var(--color-omega-surface)]"}`}>
                  <div>
                    <p className="text-xs font-medium">{asset.nameAr}</p>
                    <p className="text-[10px] text-[var(--color-omega-muted)]">{asset.symbol}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-bold font-mono">
                      {asset.price >= 1000 ? asset.price.toLocaleString("en-US", { maximumFractionDigits: 0 }) : asset.price >= 1 ? asset.price.toFixed(2) : asset.price.toFixed(4)}
                    </p>
                    <p className={`text-[10px] font-medium ${asset.changePercent24h >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                      {asset.changePercent24h >= 0 ? "▲" : "▼"}{Math.abs(asset.changePercent24h).toFixed(2)}%
                    </p>
                  </div>
                </button>
              );
            })}
            {filteredPrices.length === 0 && (
              <p className="text-center text-xs text-[var(--color-omega-muted)] py-4">لا توجد أصول في هذه الفئة</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

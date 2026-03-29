export type MarketType = "forex" | "crypto" | "stocks" | "commodities" | "indices";

export interface MarketStatus {
  isOpen: boolean;
  label: string;
  labelEn: string;
  nextOpen?: string;
  sessions: { name: string; open: boolean; hours: string }[];
}

export function getMarketType(symbol: string): MarketType {
  const sym = symbol.toUpperCase();
  if (["BTC", "ETH", "SOL", "BNB", "XRP", "ADA", "DOGE", "DOT", "AVAX", "LINK"].some(c => sym.includes(c))) return "crypto";
  if (["EURUSD", "GBPUSD", "USDJPY", "USDCAD", "AUDUSD", "NZDUSD", "USDCHF"].some(c => sym.includes(c) || sym.startsWith(c.replace("/", "")))) return "forex";
  if (["XAUUSD", "XAGUSD", "USOIL", "GOLD", "SILVER", "OIL", "NGAS", "GC=F", "SI=F", "CL=F"].some(c => sym.includes(c))) return "commodities";
  if (["SPX500", "NAS100", "US30", "GER40", "UK100", "JP225", "^GSPC", "^IXIC", "^DJI", "S&P", "NASDAQ", "DOW"].some(c => sym.includes(c))) return "indices";
  return "stocks";
}

function getETDate(): Date {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "America/New_York" }));
}

function isForexOpen(): boolean {
  const et = getETDate();
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const time = hour * 60 + minute;

  if (day === 0 && time < 1020) return false;
  if (day === 6) return false;
  if (day === 5 && time >= 1020) return false;
  return true;
}

function isStockMarketOpen(): boolean {
  const et = getETDate();
  const day = et.getDay();
  const hour = et.getHours();
  const minute = et.getMinutes();
  const time = hour * 60 + minute;

  if (day === 0 || day === 6) return false;
  if (time < 570 || time >= 960) return false;

  const holidays = ["01-01", "01-15", "02-19", "03-29", "05-27", "06-19", "07-04", "09-02", "11-28", "12-25"];
  const monthDay = `${String(et.getMonth() + 1).padStart(2, "0")}-${String(et.getDate()).padStart(2, "0")}`;
  if (holidays.includes(monthDay)) return false;

  return true;
}

function isCommodityOpen(symbol: string): boolean {
  if (symbol.includes("GC") || symbol.includes("XAU") || symbol.includes("SI") || symbol.includes("XAG")) {
    const et = getETDate();
    const day = et.getDay();
    const hour = et.getHours();
    if (day === 6) return false;
    if (day === 0 && hour < 17) return false;
    if (day === 5 && hour >= 17) return false;
    return true;
  }
  return isStockMarketOpen();
}

export function getMarketStatus(symbol: string): MarketStatus {
  const type = getMarketType(symbol);

  switch (type) {
    case "crypto":
      return {
        isOpen: true,
        label: "مفتوح 24/7",
        labelEn: "Open 24/7",
        sessions: [
          { name: "الكريبتو", open: true, hours: "24/7" },
        ],
      };

    case "forex": {
      const open = isForexOpen();
      return {
        isOpen: open,
        label: open ? "مفتوح" : "مغلق",
        labelEn: open ? "Open" : "Closed",
        sessions: [
          { name: "سيدني", open: true, hours: "22:00 - 07:00 UTC" },
          { name: "طوكيو", open: true, hours: "00:00 - 09:00 UTC" },
          { name: "لندن", open: true, hours: "08:00 - 17:00 UTC" },
          { name: "نيويورك", open: true, hours: "13:00 - 22:00 UTC" },
        ],
      };
    }

    case "stocks":
    case "indices": {
      const open = isStockMarketOpen();
      return {
        isOpen: open,
        label: open ? "مفتوح" : "مغلق",
        labelEn: open ? "Open" : "Closed",
        sessions: [
          { name: "ما قبل السوق", open: !open, hours: "04:00 - 09:30 ET" },
          { name: "الجلسة الرئيسية", open, hours: "09:30 - 16:00 ET" },
          { name: "ما بعد السوق", open: false, hours: "16:00 - 20:00 ET" },
        ],
      };
    }

    case "commodities": {
      const open = isCommodityOpen(symbol);
      return {
        isOpen: open,
        label: open ? "مفتوح" : "مغلق",
        labelEn: open ? "Open" : "Closed",
        sessions: [
          { name: "الجلسة الرئيسية", open, hours: "08:20 - 13:30 ET" },
          { name: "إلكتروني", open: true, hours: "18:00 - 17:00 ET" },
        ],
      };
    }

    default:
      return { isOpen: true, label: "غير معروف", labelEn: "Unknown", sessions: [] };
  }
}

export function isMarketOpenForSymbol(symbol: string): boolean {
  return getMarketStatus(symbol).isOpen;
}

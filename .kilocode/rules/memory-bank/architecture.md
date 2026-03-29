# البنية المعمارية: نظام سعود

## هيكل المشروع
```
src/
├── app/                          # صفحات Next.js App Router
│   ├── layout.tsx                # التخطيط الرئيسي (RTL, Sidebar, Header)
│   ├── page.tsx                  # لوحة التحكم (TradingView, أسعار, محفظة, خبراء)
│   ├── globals.css               # أنماط عالمية (ثيم داكن, RTL)
│   ├── market/page.tsx           # السوق (TradingView كامل, فلترة, قائمة أصول)
│   ├── portfolio/page.tsx        # المحفظة (رصيد, منحنى أموال, مراكز)
│   ├── auto-trading/page.tsx     # التداول الآلي (تفعيل, صفقات, سجل)
│   ├── war-room/page.tsx         # غرفة الحرب (الاستدعاء يمر عبر page)
│   ├── reports/page.tsx          # التقارير (دقة, أوزان)
│   ├── settings/page.tsx         # الإعدادات (20+ خيار)
│   └── api/
│       ├── agents/route.ts       # API الاستشارة
│       ├── prices/route.ts       # API الأسعار (CoinGecko + Forex)
│       ├── reports/route.ts      # API التقارير
│       └── market/route.ts       # API السوق
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx           # الشريط الجانبي (7 روابط + إحصائيات)
│   │   └── Header.tsx            # الرأس (ساعة, إشعارات, شريط TradingView)
│   ├── dashboard/
│   │   ├── ExpertBoard.tsx       # مجلس الخبراء (8 بطاقات + modal)
│   │   ├── SystemHealthPanel.tsx # حالة النظام
│   │   └── WarRoomView.tsx       # غرفة الحرب (استشارة, تنفيذ, أصوات)
│   ├── charts/
│   │   ├── LineChart.tsx         # رسم بياني Canvas
│   │   └── CandlestickChart.tsx  # شموع يابانية Canvas
│   ├── tradingview/
│   │   ├── TradingViewWidget.tsx # TradingView رسم بياني تفاعلي
│   │   ├── MarketOverview.tsx    # نظرة على السوق
│   │   └── TickerTape.tsx        # شريط أسعار متحرك
│   └── notifications/
│       └── NotificationCenter.tsx # نظام الإشعارات 24/7
├── hooks/
│   └── useSettings.ts            # إعدادات مع localStorage (v2)
├── lib/
│   ├── agents/
│   │   ├── types.ts              # تعريفات TypeScript
│   │   ├── registry.ts           # 59 خبير (8 رئيسي + 51 مساعد)
│   │   ├── engine.ts             # محرك الاستشارة (بذرة عشوائية)
│   │   └── learning.ts           # محرك التعلم الذاتي
│   ├── analysis/
│   │   ├── technical.ts          # تحليل فني (RSI, MACD, BB, SMA, ATR, Stochastic)
│   │   ├── fundamental.ts        # تحليل مالي (P/E, P/B, ROE, DCF)
│   │   ├── sentiment.ts          # تحليل مشاعر (عربي + إنجليزي)
│   │   ├── risk.ts               # إدارة مخاطر (Kelly, Position Sizing)
│   │   ├── patterns.ts           # كشف أنماط (H&S, Double Top, Triangles)
│   │   └── backtest.ts           # اختبار استراتيجيات
│   ├── strategies/
│   │   └── advanced.ts           # استراتيجيات (Ichimoku, Fibonacci, SMC, VWAP, Elliott, Market Profile)
│   ├── market/
│   │   └── realtime.ts           # جلب أسعار من API الخادم
│   ├── knowledge/
│   │   └── base.ts               # قاعدة معرفة
│   ├── db/
│   │   └── store.ts              # تخزين مؤقت للصفقات والجلسات
│   └── utils/
│       └── market-hours.ts       # كشف ساعات التداول
```

## نمط البيانات
- **الأسعار**: `/api/prices` ← CoinGecko (كريبتو) + open.er-api (فوركس) + خوارزمية (سلع/مؤشرات)
- **الاستشارة**: POST `/api/agents` ← محرك الاستشارة ← 6 خبراء رئيسيين
- **الإعدادات**: `useSettings()` ← localStorage `saud-fin-v2`

## نمط الحالة
- `useState` للحالة المحلية
- `useSettings()` hook للإعدادات المُشتركة
- `localStorage` للاستمرارية
- `useMemo` للحسابات المُشتقة
- `useCallback` للدوال المستقرة
- refs للقيم غير التفاعلية (logs, counters)

## أنماط التصميم
- **RTL**: `direction: rtl` على `<html>`
- **ثيم داكن**: متغيرات CSS `--color-omega-*`
- **لون أساسي**: أخضر زمردي (emerald)
- **بطاقات**: `bg-[var(--color-omega-card)]` مع حدود
- **حالة**: `status-dot` مع ألوان (أخضر/أحمر/أصفر)

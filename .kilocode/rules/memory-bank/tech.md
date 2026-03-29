# المكونات التقنية: نظام سعود v9.0

## حزمة التكنولوجيا
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16.x | إطار عمل React مع App Router |
| React | 19.x | مكتبة واجهة المستخدم |
| TypeScript | 5.9.x | JavaScript آمن الأنواع |
| Tailwind CSS | 4.x | CSS utility-first |
| Bun | أحدث | مدير الحزم والبيئة |
| Drizzle ORM | 0.45.x | ORM لقاعدة البيانات SQLite |
| @kilocode/app-builder-db | أحدث | محرك قاعدة البيانات |

## أوامر التشغيل
```bash
bun install        # تثبيت التبعيات
bun typecheck      # فحص TypeScript
bun lint           # فحص ESLint
bun build          # بناء الإنتاج
bun db:generate    # توليد مهاجرات قاعدة البيانات
bun db:migrate     # تشغيل المهاجرات (تلقائي في السحابة)
```

## APIs الخارجية
| API | الاستخدام | الحالة |
|-----|-----------|--------|
| CoinGecko | أسعار العملات الرقمية (10 عملات) | مجاني, بدون مفتاح |
| open.er-api.com | أسعار الصرف (EUR, GBP, JPY) | مجاني, بدون مفتاح |
| TradingView widgets | رسوم بيانية + شريط أسعار | مجاني عبر embed |

## التبعيات الإنتاجية
```json
{
  "next": "^16.1.3",
  "react": "^19.2.3",
  "react-dom": "^19.2.3",
  "drizzle-orm": "^0.45.2",
  "@kilocode/app-builder-db": "github:Kilo-Org/app-builder-db#main"
}
```

## تبعيات التطوير
```json
{
  "typescript": "^5.9.3",
  "@types/node": "^24.10.2",
  "@types/react": "^19.2.7",
  "@tailwindcss/postcss": "^4.1.17",
  "tailwindcss": "^4.1.17",
  "drizzle-kit": "^0.31.10",
  "eslint": "^9.39.1",
  "eslint-config-next": "^16.0.0"
}
```

## إعداد TypeScript
- الوضع الصارم: `strict: true`
- مسار بديل: `@/*` → `src/*`
- الهدف: `ESNext`

## إعداد Tailwind CSS 4
- CSS-first configuration
- متغيرات موضوع مُخصصة في `globals.css`
- `--color-omega-*` للثيم الداكن

## إعداد ESLint
- Flat config format
- `eslint-config-next`
- قواعد React hooks صارمة

## القيود التقنية
- قاعدة بيانات SQLite عبر Drizzle ORM
- مصادقة HMAC-SHA256 (بدون JWT خارجي)
- لا IE11
- المتصفحات الحديثة فقط (ES2020+)

## هيكل قاعدة البيانات
| الجدول | الأعمدة | الاستخدام |
|--------|---------|-----------|
| users | 8 | المستخدمون والمصادقة |
| trades | 19 | سجل التداول |
| expert_performance | 10 | أداء الخبراء |
| price_alerts | 9 | التنبيهات السعرية |
| strategies | 10 | استراتيجيات التداول |
| portfolio_snapshots | 9 | لحظات المحفظة |
| copy_trades | 14 | صفقات النسخ |
| war_room_sessions | 10 | جلسات غرفة الحرب |

## أداء
- Server Components افتراضياً
- `use client` فقط عند الحاجة للتفاعل
- `useMemo` و `useCallback` للحسابات المُعقدة
- `AbortSignal.timeout` لطلبات API
- TradingView widgets (لا مكتبة رسوميات)

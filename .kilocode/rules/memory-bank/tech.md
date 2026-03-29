# المكونات التقنية: نظام سعود

## حزمة التكنولوجيا
| التقنية | الإصدار | الاستخدام |
|---------|---------|-----------|
| Next.js | 16.x | إطار عمل React مع App Router |
| React | 19.x | مكتبة واجهة المستخدم |
| TypeScript | 5.9.x | JavaScript آمن الأنواع |
| Tailwind CSS | 4.x | CSS utility-first |
| Bun | أحدث | مدير الحزم والبيئة |

## أوامر التشغيل
```bash
bun install        # تثبيت التبعيات
bun typecheck      # فحص TypeScript
bun lint           # فحص ESLint
npx next build     # بناء الإنتاج
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
  "react-dom": "^19.2.3"
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
- لا قاعدة بيانات (localStorage فقط)
- لا مصادقة
- لا IE11
- المتصفحات الحديثة فقط (ES2020+)

## أداء
- Server Components افتراضياً
- `use client` فقط عند الحاجة للتفاعل
- `useMemo` و `useCallback` للحسابات المُعقدة
- `AbortSignal.timeout` لطلبات API
- TradingView widgets (لا مكتبة رسوميات)

"use client";
import { useState } from "react";

interface BrokerAccount {
  id: string;
  name: string;
  nameAr: string;
  type: "demo" | "live";
  broker: "binance" | "ib";
  apiKey: string;
  apiSecret: string;
  testnet: boolean;
  status: "connected" | "disconnected" | "error";
  balances: { asset: string; free: number; total: number }[];
  lastCheck: string;
}

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
  const [newAccount, setNewAccount] = useState({
    name: "", broker: "binance" as "binance" | "ib", type: "demo" as "demo" | "live",
    apiKey: "", apiSecret: "", testnet: true,
  });
  const [connecting, setConnecting] = useState<string | null>(null);

  const addAccount = () => {
    if (!newAccount.apiKey || !newAccount.apiSecret) return;
    const account: BrokerAccount = {
      id: `broker-${Date.now()}`,
      name: newAccount.name || `${newAccount.broker} ${newAccount.type}`,
      nameAr: newAccount.broker === "binance" ? "بينانس" : "إنتراكتيف بروكرز",
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
          <h1 className="text-xl font-bold">الوُسطاء (Brokers)</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">ربط حسابات التداول الحقيقية والتجريبية</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          + إضافة وسيط
        </button>
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

      {showAdd && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-4">
          <h3 className="text-sm font-bold">إضافة وسيط جديد</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">اسم الحساب</label>
              <input type="text" value={newAccount.name} onChange={(e) => setNewAccount({ ...newAccount, name: e.target.value })}
                placeholder="مثال: حساب بينانس التجريبي" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500" dir="rtl" />
            </div>
            <div>
              <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الوسيط</label>
              <select value={newAccount.broker} onChange={(e) => setNewAccount({ ...newAccount, broker: e.target.value as "binance" | "ib" })}
                className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2 text-xs">
                <option value="binance">Binance (بينانس)</option>
                <option value="ib">Interactive Brokers (إنتراكتيف بروكرز)</option>
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
            <button onClick={() => setShowAdd(false)} className="bg-[var(--color-omega-surface)] px-4 py-2 rounded-lg text-xs transition-colors">إلغاء</button>
          </div>
        </div>
      )}

      {accounts.length === 0 && !showAdd && (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-8 text-center">
          <p className="text-sm text-[var(--color-omega-muted)]">لا توجد حسابات وُسطاء مُربوطة</p>
          <p className="text-xs text-[var(--color-omega-muted)] mt-1">اضغط &quot;+ إضافة وسيط&quot; للبدء</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <div key={account.id} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-900/30 flex items-center justify-center text-lg">
                  {account.broker === "binance" ? "🟡" : "🔵"}
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

      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-5">
        <h3 className="text-sm font-bold mb-3">📚 كيفية الحصول على مفاتيح API</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-[var(--color-omega-muted)]">
          <div>
            <p className="font-medium text-white mb-1">Binance:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>سجّل في <span className="text-emerald-400">testnet.binancefuture.com</span> للحساب التجريبي</li>
              <li>أو <span className="text-emerald-400">binance.com</span> للحساب الحقيقي</li>
              <li>اذهب للإعدادات → إدارة API</li>
              <li>أنشئ مفتاح API جديد</li>
              <li>فعّل صلاحيات <strong>قراءة + تداول فقط</strong></li>
              <li>انسخ API Key و Secret</li>
            </ol>
          </div>
          <div>
            <p className="font-medium text-white mb-1">Interactive Brokers:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>سجّل في <span className="text-emerald-400">interactivebrokers.com</span></li>
              <li>حمّل TWS أو IB Gateway</li>
              <li>فعّل API في الإعدادات</li>
              <li>استخدم المنفذ 5000 للـ Gateway</li>
              <li>المصادقة عبر حساب IB مباشرة</li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";
import { useState } from "react";

interface User {
  id: number;
  email: string;
  displayName: string;
  role: string;
  preferredCurrency?: string;
}

export default function AuthPage() {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("saud-user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const handleSubmit = async () => {
    setError("");
    if (!email || !password) { setError("البريد وكلمة المرور مطلوبان"); return; }
    if (mode === "register" && !displayName) { setError("الاسم مطلوب للتسجيل"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: mode, email, password, displayName }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ"); return; }
      localStorage.setItem("saud-user", JSON.stringify(data.user));
      localStorage.setItem("saud-token", data.token);
      setUser(data.user);
    } catch { setError("خطأ في الاتصال بالخادم"); }
    finally { setLoading(false); }
  };

  const logout = () => {
    localStorage.removeItem("saud-user");
    localStorage.removeItem("saud-token");
    setUser(null);
  };

  if (user) {
    return (
      <div className="space-y-4 max-w-md mx-auto">
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-900/30 flex items-center justify-center text-3xl mx-auto mb-4">
            {user.role === "admin" ? "👑" : "👤"}
          </div>
          <h2 className="text-lg font-bold">{user.displayName}</h2>
          <p className="text-xs text-[var(--color-omega-muted)] mt-1">{user.email}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <span className={`text-[10px] px-2 py-1 rounded ${user.role === "admin" ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}`}>
              {user.role === "admin" ? "👑 مسؤول" : user.role === "trader" ? "📊 متداول" : "👁️ مشاهد"}
            </span>
            <span className="text-[10px] bg-blue-900/30 text-blue-400 px-2 py-1 rounded">
              {user.preferredCurrency || "USD"}
            </span>
          </div>
          {user.role === "admin" && (
            <a href="/admin" className="block mt-3 bg-amber-600/20 hover:bg-amber-600/30 text-amber-400 px-4 py-2 rounded-lg text-xs transition-colors">
              👑 لوحة الإدارة
            </a>
          )}
          <button onClick={logout} className="mt-3 bg-red-900/30 hover:bg-red-900/50 text-red-400 px-4 py-2 rounded-lg text-xs transition-colors">
            تسجيل الخروج
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 max-w-md mx-auto">
      <div className="text-center">
        <h1 className="text-xl font-bold">{mode === "login" ? "تسجيل الدخول" : "إنشاء حساب جديد"}</h1>
        <p className="text-xs text-[var(--color-omega-muted)] mt-1">نظام سعود للذكاء المالي</p>
      </div>
      <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-6 space-y-4">
        {mode === "register" && (
          <div>
            <label className="text-xs text-[var(--color-omega-muted)] block mb-1">الاسم الكامل</label>
            <input type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="أدخل اسمك" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500" dir="rtl" />
          </div>
        )}
        <div>
          <label className="text-xs text-[var(--color-omega-muted)] block mb-1">البريد الإلكتروني</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="example@email.com" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500" dir="ltr" />
        </div>
        <div>
          <label className="text-xs text-[var(--color-omega-muted)] block mb-1">كلمة المرور</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full bg-[var(--color-omega-surface)] border border-[var(--color-omega-border)] rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-emerald-500" dir="ltr" />
        </div>
        {error && <div className="bg-red-900/20 border border-red-800/30 rounded-lg p-2 text-xs text-red-400">{error}</div>}
        <button onClick={handleSubmit} disabled={loading} className="w-full bg-emerald-600 hover:bg-emerald-700 py-2.5 rounded-lg text-sm font-bold transition-colors disabled:opacity-50">
          {loading ? "جاري المعالجة..." : mode === "login" ? "دخول" : "تسجيل"}
        </button>
        <button onClick={() => setMode(mode === "login" ? "register" : "login")} className="w-full text-xs text-emerald-400 hover:text-emerald-300">
          {mode === "login" ? "ليس لديك حساب؟ سجل الآن" : "لديك حساب؟ سجل دخول"}
        </button>
      </div>
      <div className="bg-blue-900/20 border border-blue-800/30 rounded-xl p-4 text-xs text-blue-300">
        <p className="font-bold mb-1">🔐 حماية بياناتك</p>
        <p>كلمات المرور مشفرة بـ HMAC-SHA256. للحصول على صلاحيات المسؤول، سجّل بـ admin@saud.ai</p>
      </div>
    </div>
  );
}

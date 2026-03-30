"use client";
import { useState, useEffect, useCallback } from "react";

interface UserData {
  id: number;
  email: string;
  displayName: string;
  role: string;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<{ id: number; role: string } | null>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("saud-user");
      return stored ? JSON.parse(stored) : null;
    }
    return null;
  });

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "list" }),
      });
      const data = await res.json();
      if (data.success) setUsers(data.users);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/auth", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "list" }),
        });
        const data = await res.json();
        if (data.success) setUsers(data.users);
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  const updateRole = async (userId: number, role: string) => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-role", userId, role }),
      });
      fetchUsers();
    } catch {}
  };

  const toggleActive = async (userId: number) => {
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "toggle-active", userId }),
      });
      fetchUsers();
    } catch {}
  };

  const deleteUser = async (userId: number) => {
    if (!confirm("هل أنت متأكد من حذف هذا المستخدم؟")) return;
    try {
      await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "delete-user", userId }),
      });
      fetchUsers();
    } catch {}
  };

  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-4xl mb-3">🔒</p>
          <p className="text-lg font-bold text-red-400">غير مصرح</p>
          <p className="text-xs text-[var(--color-omega-muted)] mt-1">هذه الصفحة للمسؤولين فقط</p>
        </div>
      </div>
    );
  }

  const roleLabels: Record<string, string> = { admin: "مسؤول", trader: "متداول", viewer: "مشاهد" };
  const roleColors: Record<string, string> = { admin: "bg-amber-900/30 text-amber-400", trader: "bg-emerald-900/30 text-emerald-400", viewer: "bg-blue-900/30 text-blue-400" };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">👑 إدارة المستخدمين</h1>
          <p className="text-xs text-[var(--color-omega-muted)]">{users.length} مستخدم | {users.filter(u => u.isActive).length} نشط</p>
        </div>
        <button onClick={fetchUsers} className="bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-lg text-sm font-medium">🔄 تحديث</button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "إجمالي المستخدمين", value: users.length, icon: "👥", color: "text-white" },
          { label: "نشط", value: users.filter(u => u.isActive).length, icon: "✅", color: "text-emerald-400" },
          { label: "معطّل", value: users.filter(u => !u.isActive).length, icon: "🚫", color: "text-red-400" },
          { label: "مسؤولين", value: users.filter(u => u.role === "admin").length, icon: "👑", color: "text-amber-400" },
        ].map(m => (
          <div key={m.label} className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <p className="text-[10px] text-[var(--color-omega-muted)]">{m.label}</p>
              <span>{m.icon}</span>
            </div>
            <p className={`text-lg font-bold font-mono ${m.color}`}>{m.value}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full" />
        </div>
      ) : (
        <div className="bg-[var(--color-omega-card)] border border-[var(--color-omega-border)] rounded-xl overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="bg-[var(--color-omega-surface)]">
                {["#", "الاسم", "البريد", "الدور", "الحالة", "آخر دخول", "إجراءات"].map(h => (
                  <th key={h} className="text-right px-3 py-2 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-t border-[var(--color-omega-border)] hover:bg-[var(--color-omega-surface)]">
                  <td className="px-3 py-2 font-mono">{user.id}</td>
                  <td className="px-3 py-2 font-medium">{user.displayName}</td>
                  <td className="px-3 py-2 font-mono text-[var(--color-omega-muted)]">{user.email}</td>
                  <td className="px-3 py-2">
                    <select value={user.role || "trader"} onChange={(e) => updateRole(user.id, e.target.value)}
                      className={`px-2 py-1 rounded text-[10px] font-bold border-0 ${roleColors[user.role || "trader"]}`}>
                      <option value="admin">مسؤول</option>
                      <option value="trader">متداول</option>
                      <option value="viewer">مشاهد</option>
                    </select>
                  </td>
                  <td className="px-3 py-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] ${user.isActive ? "bg-emerald-900/30 text-emerald-400" : "bg-red-900/30 text-red-400"}`}>
                      {user.isActive ? "نشط" : "معطّل"}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-[var(--color-omega-muted)]">
                    {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString("ar-SA") : "لم يسجل"}
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex gap-1">
                      <button onClick={() => toggleActive(user.id)} className={`px-2 py-1 rounded text-[10px] ${user.isActive ? "bg-amber-900/30 text-amber-400" : "bg-emerald-900/30 text-emerald-400"}`}>
                        {user.isActive ? "تعطيل" : "تفعيل"}
                      </button>
                      {user.id !== currentUser?.id && (
                        <button onClick={() => deleteUser(user.id)} className="px-2 py-1 rounded text-[10px] bg-red-900/30 text-red-400">حذف</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

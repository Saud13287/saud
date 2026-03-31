import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken, ADMIN_EMAIL } from "@/lib/auth";

export async function POST(request: Request) {
  if (!isDbAvailable()) {
    return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة. يرجى التأكد من إعداد المتغيرات البيئية DB_URL و DB_TOKEN." }, { status: 503 });
  }
  try {
    const body = await request.json();
    const { action, email, password, displayName, token, userId, role } = body;

    if (action === "register") {
      if (!email || !password || !displayName) {
        return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
      }
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length > 0) {
        return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
      }
      const userRole = email === ADMIN_EMAIL ? "admin" : "trader";
      const passwordHash = hashPassword(password);
      const result = await db.insert(users).values({
        email, passwordHash, displayName, role: userRole,
        preferredCurrency: "USD", accountBalance: 1000, isActive: true,
      });
      const newUserId = Number((result as unknown as { lastInsertRowid: number }).lastInsertRowid);
      const newToken = generateToken(newUserId, email, userRole as "admin" | "trader");
      return NextResponse.json({ success: true, token: newToken, user: { id: newUserId, email, displayName, role: userRole } });
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
      }
      const found = await db.select().from(users).where(eq(users.email, email));
      if (found.length === 0) return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      const user = found[0];
      if (!user.isActive) return NextResponse.json({ error: "الحساب معطّل" }, { status: 403 });
      if (!verifyPassword(password, user.passwordHash)) return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      await db.update(users).set({ lastLogin: new Date() }).where(eq(users.id, user.id));
      const newToken = generateToken(user.id, user.email, (user.role || "trader") as "admin" | "trader");
      return NextResponse.json({
        success: true, token: newToken,
        user: { id: user.id, email: user.email, displayName: user.displayName, role: user.role, preferredCurrency: user.preferredCurrency },
      });
    }

    if (action === "list") {
      const allUsers = await db.select({
        id: users.id, email: users.email, displayName: users.displayName,
        role: users.role, isActive: users.isActive, lastLogin: users.lastLogin, createdAt: users.createdAt,
      }).from(users);
      return NextResponse.json({ success: true, users: allUsers });
    }

    if (action === "update-role") {
      if (!userId || !role) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
      await db.update(users).set({ role }).where(eq(users.id, userId));
      return NextResponse.json({ success: true });
    }

    if (action === "toggle-active") {
      if (!userId) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
      const found = await db.select().from(users).where(eq(users.id, userId));
      if (found.length === 0) return NextResponse.json({ error: "المستخدم غير موجود" }, { status: 404 });
      await db.update(users).set({ isActive: !found[0].isActive }).where(eq(users.id, userId));
      return NextResponse.json({ success: true });
    }

    if (action === "delete-user") {
      if (!userId) return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
      await db.delete(users).where(eq(users.id, userId));
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

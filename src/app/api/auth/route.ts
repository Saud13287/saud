import { NextResponse } from "next/server";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPassword, verifyPassword, generateToken } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, email, password, displayName } = body;

    if (action === "register") {
      if (!email || !password || !displayName) {
        return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
      }
      const existing = await db.select().from(users).where(eq(users.email, email));
      if (existing.length > 0) {
        return NextResponse.json({ error: "البريد الإلكتروني مسجل مسبقاً" }, { status: 400 });
      }
      const passwordHash = hashPassword(password);
      const result = await db.insert(users).values({
        email,
        passwordHash,
        displayName,
        preferredCurrency: "USD",
        accountBalance: 1000,
      });
      const userId = Number((result as unknown as { lastInsertRowid: number }).lastInsertRowid);
      const token = generateToken(userId, email);
      return NextResponse.json({ success: true, token, user: { id: userId, email, displayName } });
    }

    if (action === "login") {
      if (!email || !password) {
        return NextResponse.json({ error: "البريد وكلمة المرور مطلوبان" }, { status: 400 });
      }
      const found = await db.select().from(users).where(eq(users.email, email));
      if (found.length === 0) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
      const user = found[0];
      if (!verifyPassword(password, user.passwordHash)) {
        return NextResponse.json({ error: "بيانات الدخول غير صحيحة" }, { status: 401 });
      }
      const token = generateToken(user.id, user.email);
      return NextResponse.json({
        success: true,
        token,
        user: { id: user.id, email: user.email, displayName: user.displayName, preferredCurrency: user.preferredCurrency },
      });
    }

    return NextResponse.json({ error: "إجراء غير معروف" }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في الخادم" }, { status: 500 });
  }
}

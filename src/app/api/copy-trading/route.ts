import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { copyTrades } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة", copyTrades: [] }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let result;
    if (userId) {
      result = await db.select().from(copyTrades).where(eq(copyTrades.userId, parseInt(userId))).orderBy(desc(copyTrades.createdAt));
    } else {
      result = await db.select().from(copyTrades).orderBy(desc(copyTrades.createdAt));
    }
    return NextResponse.json({ success: true, copyTrades: result });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب صفقات النسخ" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const body = await request.json();
    const { userId, expertId, originalTradeId, asset, direction, entryPrice, quantity, riskMultiplier } = body;

    await db.insert(copyTrades).values({
      userId: userId || 1,
      expertId,
      originalTradeId,
      asset,
      direction,
      entryPrice,
      quantity,
      riskMultiplier: riskMultiplier || 1.0,
      status: "open",
      pnl: 0,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في نسخ الصفقة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const body = await request.json();
    const { copyTradeId, exitPrice, pnl, status } = body;

    await db.update(copyTrades)
      .set({ exitPrice, pnl, status, closedAt: new Date() })
      .where(eq(copyTrades.id, copyTradeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في تحديث صفقة النسخ" }, { status: 500 });
  }
}

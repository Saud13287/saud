import { NextResponse } from "next/server";
import { db } from "@/db";
import { trades } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "50");

    let result;
    if (userId) {
      result = await db.select().from(trades).where(eq(trades.userId, parseInt(userId))).orderBy(desc(trades.createdAt)).limit(limit);
    } else {
      result = await db.select().from(trades).orderBy(desc(trades.createdAt)).limit(limit);
    }
    return NextResponse.json({ success: true, trades: result });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب الصفقات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, asset, direction, entryPrice, quantity, stopLoss, takeProfit, expert, confidence, strategy, currency } = body;

    const result = await db.insert(trades).values({
      userId: userId || 1,
      asset,
      direction,
      entryPrice,
      quantity,
      stopLoss,
      takeProfit,
      expert: expert || "",
      confidence: confidence || 0,
      strategy: strategy || "",
      status: "open",
      currency: currency || "USD",
      pnl: 0,
      pnlPercent: 0,
    });

    return NextResponse.json({ success: true, tradeId: Number((result as unknown as { lastInsertRowid: number }).lastInsertRowid) });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في إضافة الصفقة" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { tradeId, exitPrice, pnl, pnlPercent, status } = body;

    await db.update(trades)
      .set({ exitPrice, pnl, pnlPercent, status, closedAt: new Date() })
      .where(eq(trades.id, tradeId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في تحديث الصفقة" }, { status: 500 });
  }
}

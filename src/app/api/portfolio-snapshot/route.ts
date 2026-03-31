import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { portfolioSnapshots } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة", snapshots: [] }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const limit = parseInt(searchParams.get("limit") || "30");

    let result;
    if (userId) {
      result = await db.select().from(portfolioSnapshots).where(eq(portfolioSnapshots.userId, parseInt(userId))).orderBy(desc(portfolioSnapshots.createdAt)).limit(limit);
    } else {
      result = await db.select().from(portfolioSnapshots).orderBy(desc(portfolioSnapshots.createdAt)).limit(limit);
    }
    return NextResponse.json({ success: true, snapshots: result });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب لحظات المحفظة" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const body = await request.json();
    const { userId, balance, equity, totalPnl, openPositions, winRate, currency } = body;

    await db.insert(portfolioSnapshots).values({
      userId: userId || 1,
      balance,
      equity,
      totalPnl: totalPnl || 0,
      openPositions: openPositions || 0,
      winRate: winRate || 0,
      currency: currency || "USD",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في حفظ لحظة المحفظة" }, { status: 500 });
  }
}

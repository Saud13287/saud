import { NextResponse } from "next/server";
import { db } from "@/db";
import { expertPerformance } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.select().from(expertPerformance).orderBy(desc(expertPerformance.accuracy));
    return NextResponse.json({ success: true, experts: result });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب أداء الخبراء" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { expertId, expertName, totalSignals, correctSignals, accuracy, totalPnl, avgConfidence, period } = body;

    await db.insert(expertPerformance).values({
      expertId,
      expertName,
      totalSignals: totalSignals || 0,
      correctSignals: correctSignals || 0,
      accuracy: accuracy || 0,
      totalPnl: totalPnl || 0,
      avgConfidence: avgConfidence || 0,
      period: period || "daily",
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في تسجيل أداء الخبير" }, { status: 500 });
  }
}

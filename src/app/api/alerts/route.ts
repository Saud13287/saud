import { NextResponse } from "next/server";
import { db, isDbAvailable } from "@/db";
import { priceAlerts } from "@/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة", alerts: [] }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    let result;
    if (userId) {
      result = await db.select().from(priceAlerts).where(eq(priceAlerts.userId, parseInt(userId))).orderBy(desc(priceAlerts.createdAt));
    } else {
      result = await db.select().from(priceAlerts).orderBy(desc(priceAlerts.createdAt));
    }
    return NextResponse.json({ success: true, alerts: result });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في جلب التنبيهات" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const body = await request.json();
    const { userId, asset, targetPrice, condition, message } = body;

    if (!asset || !targetPrice || !condition) {
      return NextResponse.json({ error: "جميع الحقول مطلوبة" }, { status: 400 });
    }

    await db.insert(priceAlerts).values({
      userId: userId || 1,
      asset,
      targetPrice,
      condition,
      message: message || `${asset} ${condition === "above" ? "فوق" : "أقل من"} ${targetPrice}`,
      triggered: false,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في إضافة التنبيه" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const body = await request.json();
    const { alertId } = body;

    await db.update(priceAlerts)
      .set({ triggered: true, triggeredAt: new Date() })
      .where(eq(priceAlerts.id, alertId));

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في تحديث التنبيه" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!isDbAvailable()) return NextResponse.json({ error: "قاعدة البيانات غير مُعدّة" }, { status: 503 });
  try {
    const { searchParams } = new URL(request.url);
    const alertId = searchParams.get("id");
    if (!alertId) {
      return NextResponse.json({ error: "معرف التنبيه مطلوب" }, { status: 400 });
    }
    await db.delete(priceAlerts).where(eq(priceAlerts.id, parseInt(alertId)));
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "خطأ في حذف التنبيه" }, { status: 500 });
  }
}

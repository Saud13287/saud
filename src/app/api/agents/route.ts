import { NextResponse } from "next/server";
import { runConsultation } from "@/lib/agents/engine";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { query, asset } = body;

    if (!query) {
      return NextResponse.json(
        { error: "يجب تقديم استفسار" },
        { status: 400 }
      );
    }

    const session = await runConsultation(query, asset);
    return NextResponse.json(session);
  } catch (error) {
    return NextResponse.json(
      { error: "حدث خطأ أثناء التحليل" },
      { status: 500 }
    );
  }
}

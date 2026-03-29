import { NextResponse } from "next/server";
import { agentRegistry } from "@/lib/agents/registry";

export async function GET() {
  const reports = agentRegistry.map((expert) => ({
    expertId: expert.id,
    expertName: expert.nameAr,
    accuracy: expert.accuracy,
    weight: expert.weight,
    assistantCount: expert.assistants.length,
    avgAssistantAccuracy:
      expert.assistants.reduce((s, a) => s + a.accuracy, 0) /
      expert.assistants.length,
    status: expert.status,
  }));

  return NextResponse.json({
    timestamp: new Date().toISOString(),
    totalExperts: agentRegistry.length,
    totalAssistants: agentRegistry.reduce((s, e) => s + e.assistants.length, 0),
    reports,
  });
}

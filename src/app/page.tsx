import { agentRegistry } from "@/lib/agents/registry";
import ExpertBoard from "@/components/dashboard/ExpertBoard";
import PortfolioSummary from "@/components/dashboard/PortfolioSummary";
import SystemHealthPanel from "@/components/dashboard/SystemHealthPanel";

export default function Home() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">لوحة التحكم الرئيسية</h1>
        <p className="text-sm text-[var(--color-omega-muted)]">
          نظرة عامة على أداء النظام وجميع الخبراء
        </p>
      </div>

      <SystemHealthPanel />
      <PortfolioSummary />
      <ExpertBoard experts={agentRegistry} />
    </div>
  );
}

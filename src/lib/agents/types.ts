export type AgentStatus = "idle" | "analyzing" | "debating" | "completed" | "error" | "vetoed";
export type AgentCategory = "fundamental" | "news" | "technical" | "risk" | "system" | "decision" | "audit" | "ceo";
export type DecisionType = "buy" | "sell" | "hold" | "wait" | "cancel";
export type MarketRegime = "bullish" | "bearish" | "sideways" | "volatile";
export type RiskLevel = "low" | "medium" | "high" | "extreme";

export interface AssistantAgent {
  id: string;
  nameAr: string;
  nameEn: string;
  role: string;
  status: AgentStatus;
  accuracy: number;
  lastActive: string;
}

export interface ExpertAgent {
  id: string;
  nameAr: string;
  nameEn: string;
  category: AgentCategory;
  role: string;
  description: string;
  icon: string;
  color: string;
  status: AgentStatus;
  accuracy: number;
  weight: number;
  assistants: AssistantAgent[];
  currentAnalysis?: AgentAnalysis;
}

export interface AgentAnalysis {
  agentId: string;
  timestamp: string;
  recommendation: DecisionType;
  confidence: number;
  reasoning: string;
  evidence: string[];
  riskAssessment?: RiskLevel;
  vetoActive?: boolean;
}

export interface WarRoomSession {
  id: string;
  timestamp: string;
  query: string;
  asset?: string;
  status: "gathering" | "debating" | "decided" | "executed";
  expertAnalyses: AgentAnalysis[];
  ceoDecision?: CEODecision;
  auditReport?: AuditReport;
}

export interface CEODecision {
  decision: DecisionType;
  confidence: number;
  summary: string;
  reasoning: string;
  risks: string[];
  alternatives: string[];
  executionPlan?: string;
}

export interface AuditReport {
  expertPerformanceScores: Record<string, number>;
  contradictions: string[];
  complianceViolations: string[];
  anomalies: string[];
  dataQualityIssues: string[];
}

export interface TradeRecord {
  id: string;
  timestamp: string;
  asset: string;
  direction: DecisionType;
  entryPrice: number;
  exitPrice?: number;
  quantity: number;
  stopLoss: number;
  takeProfit: number;
  pnl?: number;
  status: "open" | "closed" | "cancelled";
  expertVotes: Record<string, DecisionType>;
  ceoConfidence: number;
}

export interface PortfolioState {
  totalCapital: number;
  availableCapital: number;
  openPositions: number;
  dailyPnL: number;
  totalPnL: number;
  riskExposure: number;
  trades: TradeRecord[];
}

export interface LearningMetric {
  expertId: string;
  period: string;
  accuracy: number;
  totalRecommendations: number;
  correctRecommendations: number;
  avgConfidence: number;
  bestMarketRegime: MarketRegime;
}

export interface SystemHealth {
  cpuUsage: number;
  memoryUsage: number;
  apiLatency: number;
  dataFeedStatus: "connected" | "delayed" | "disconnected";
  lastUpdate: string;
  errors: string[];
}

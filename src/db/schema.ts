import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  email: text("email").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  displayName: text("display_name").notNull(),
  preferredCurrency: text("preferred_currency").default("USD"),
  accountBalance: real("account_balance").default(1000),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const trades = sqliteTable("trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  asset: text("asset").notNull(),
  direction: text("direction").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  quantity: real("quantity").notNull(),
  stopLoss: real("stop_loss"),
  takeProfit: real("take_profit"),
  pnl: real("pnl").default(0),
  pnlPercent: real("pnl_percent").default(0),
  status: text("status").default("open"),
  expert: text("expert"),
  confidence: real("confidence").default(0),
  strategy: text("strategy"),
  notes: text("notes"),
  currency: text("currency").default("USD"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const expertPerformance = sqliteTable("expert_performance", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expertId: text("expert_id").notNull(),
  expertName: text("expert_name").notNull(),
  totalSignals: integer("total_signals").default(0),
  correctSignals: integer("correct_signals").default(0),
  accuracy: real("accuracy").default(0),
  totalPnl: real("total_pnl").default(0),
  avgConfidence: real("avg_confidence").default(0),
  period: text("period").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const priceAlerts = sqliteTable("price_alerts", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  asset: text("asset").notNull(),
  targetPrice: real("target_price").notNull(),
  condition: text("condition").notNull(),
  message: text("message"),
  triggered: integer("triggered", { mode: "boolean" }).default(false),
  triggeredAt: integer("triggered_at", { mode: "timestamp" }),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const strategies = sqliteTable("strategies", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  name: text("name").notNull(),
  nameAr: text("name_ar").notNull(),
  description: text("description"),
  rules: text("rules").notNull(),
  isActive: integer("is_active", { mode: "boolean" }).default(true),
  totalTrades: integer("total_trades").default(0),
  winRate: real("win_rate").default(0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const portfolioSnapshots = sqliteTable("portfolio_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  balance: real("balance").notNull(),
  equity: real("equity").notNull(),
  totalPnl: real("total_pnl").default(0),
  openPositions: integer("open_positions").default(0),
  winRate: real("win_rate").default(0),
  currency: text("currency").default("USD"),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

export const copyTrades = sqliteTable("copy_trades", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  expertId: text("expert_id").notNull(),
  originalTradeId: text("original_trade_id").notNull(),
  asset: text("asset").notNull(),
  direction: text("direction").notNull(),
  entryPrice: real("entry_price").notNull(),
  exitPrice: real("exit_price"),
  quantity: real("quantity").notNull(),
  pnl: real("pnl").default(0),
  status: text("status").default("open"),
  riskMultiplier: real("risk_multiplier").default(1.0),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
  closedAt: integer("closed_at", { mode: "timestamp" }),
});

export const warRoomSessions = sqliteTable("war_room_sessions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: integer("user_id").references(() => users.id),
  query: text("query").notNull(),
  asset: text("asset"),
  decision: text("decision"),
  confidence: real("confidence").default(0),
  expertVotes: text("expert_votes"),
  summary: text("summary"),
  executed: integer("executed", { mode: "boolean" }).default(false),
  createdAt: integer("created_at", { mode: "timestamp" }).$defaultFn(() => new Date()),
});

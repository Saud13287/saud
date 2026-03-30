CREATE TABLE `backtest_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`strategy` text NOT NULL,
	`asset` text NOT NULL,
	`timeframe` text NOT NULL,
	`total_trades` integer DEFAULT 0,
	`win_rate` real DEFAULT 0,
	`total_return` real DEFAULT 0,
	`max_drawdown` real DEFAULT 0,
	`sharpe_ratio` real DEFAULT 0,
	`profit_factor` real DEFAULT 0,
	`avg_win` real DEFAULT 0,
	`avg_loss` real DEFAULT 0,
	`best_trade` real DEFAULT 0,
	`worst_trade` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `copy_trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`expert_id` text NOT NULL,
	`original_trade_id` text NOT NULL,
	`asset` text NOT NULL,
	`direction` text NOT NULL,
	`entry_price` real NOT NULL,
	`exit_price` real,
	`quantity` real NOT NULL,
	`pnl` real DEFAULT 0,
	`status` text DEFAULT 'open',
	`risk_multiplier` real DEFAULT 1,
	`created_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `expert_performance` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`expert_id` text NOT NULL,
	`expert_name` text NOT NULL,
	`total_signals` integer DEFAULT 0,
	`correct_signals` integer DEFAULT 0,
	`accuracy` real DEFAULT 0,
	`total_pnl` real DEFAULT 0,
	`avg_confidence` real DEFAULT 0,
	`win_streak` integer DEFAULT 0,
	`loss_streak` integer DEFAULT 0,
	`period` text NOT NULL,
	`created_at` integer
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`type` text NOT NULL,
	`title` text NOT NULL,
	`message` text NOT NULL,
	`sound` integer DEFAULT true,
	`read` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `portfolio_snapshots` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`balance` real NOT NULL,
	`equity` real NOT NULL,
	`total_pnl` real DEFAULT 0,
	`open_positions` integer DEFAULT 0,
	`win_rate` real DEFAULT 0,
	`currency` text DEFAULT 'USD',
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `price_alerts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`asset` text NOT NULL,
	`target_price` real NOT NULL,
	`condition` text NOT NULL,
	`message` text,
	`sound_enabled` integer DEFAULT true,
	`triggered` integer DEFAULT false,
	`triggered_at` integer,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `strategies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`name` text NOT NULL,
	`name_ar` text NOT NULL,
	`description` text,
	`rules` text NOT NULL,
	`category` text DEFAULT 'custom',
	`is_active` integer DEFAULT true,
	`total_trades` integer DEFAULT 0,
	`win_rate` real DEFAULT 0,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `trades` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`asset` text NOT NULL,
	`direction` text NOT NULL,
	`entry_price` real NOT NULL,
	`exit_price` real,
	`quantity` real NOT NULL,
	`stop_loss` real,
	`take_profit` real,
	`pnl` real DEFAULT 0,
	`pnl_percent` real DEFAULT 0,
	`status` text DEFAULT 'open',
	`expert` text,
	`strategy` text,
	`broker` text,
	`confidence` real DEFAULT 0,
	`notes` text,
	`currency` text DEFAULT 'USD',
	`created_at` integer,
	`closed_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`email` text NOT NULL,
	`password_hash` text NOT NULL,
	`display_name` text NOT NULL,
	`role` text DEFAULT 'trader',
	`preferred_currency` text DEFAULT 'USD',
	`account_balance` real DEFAULT 1000,
	`is_active` integer DEFAULT true,
	`last_login` integer,
	`created_at` integer,
	`updated_at` integer
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);--> statement-breakpoint
CREATE TABLE `war_room_sessions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`query` text NOT NULL,
	`asset` text,
	`decision` text,
	`confidence` real DEFAULT 0,
	`expert_votes` text,
	`summary` text,
	`strategy` text,
	`executed` integer DEFAULT false,
	`created_at` integer,
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);

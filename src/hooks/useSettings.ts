"use client";
import { useState, useCallback } from "react";

export interface AppSettings {
  riskLimit: number;
  maxDailyTrades: number;
  dailyKillSwitch: number;
  weeklyKillSwitch: number;
  autoExecute: boolean;
  ghostMode: boolean;
  trailingStop: boolean;
  minRR: number;
  maxOpenPositions: number;
  selectedStrategies: string[];
  tradingHours: string;
  notificationsEnabled: boolean;
  brokerType: string;
  selectedBroker: string;
  maxSlippage: number;
  language: string;
  chartSymbol: string;
  chartInterval: string;
  defaultAsset: string;
  riskPerTradePercent: number;
  maxConsecutiveLosses: number;
  cooldownAfterLoss: number;
  enableCrisisDetection: boolean;
  enableFOMODetection: boolean;
  mobileMode: boolean;
  soundEnabled: boolean;
  alertSound: boolean;
  theme: string;
  accountBalance: number;
  cooldownEnabled: boolean;
  manualCloseEnabled: boolean;
  stopLossPercent: number;
  takeProfitPercent: number;
  tradeSizePercent: number;
  allowedAssets: string[];
  requireConfirmation: boolean;
}

const DEFAULT_SETTINGS: AppSettings = {
  riskLimit: 2,
  maxDailyTrades: 10,
  dailyKillSwitch: 5,
  weeklyKillSwitch: 10,
  autoExecute: false,
  ghostMode: false,
  trailingStop: true,
  minRR: 1.5,
  maxOpenPositions: 5,
  selectedStrategies: [
    "Ichimoku", "Fibonacci", "SMC", "VWAP", "Elliott Wave",
    "MACD", "RSI", "Bollinger Bands", "Stochastic", "Ensemble Voting",
    "ICT", "CRT", "Liquidity Sweep", "Order Block",
  ],
  tradingHours: "all",
  notificationsEnabled: true,
  brokerType: "demo",
  selectedBroker: "",
  maxSlippage: 0.1,
  language: "ar",
  chartSymbol: "COMEX:GC1!",
  chartInterval: "D",
  defaultAsset: "XAUUSD",
  riskPerTradePercent: 2,
  maxConsecutiveLosses: 3,
  cooldownAfterLoss: 24,
  enableCrisisDetection: true,
  enableFOMODetection: true,
  mobileMode: false,
  soundEnabled: true,
  alertSound: true,
  theme: "dark",
  accountBalance: 1000,
  cooldownEnabled: true,
  manualCloseEnabled: true,
  stopLossPercent: 2,
  takeProfitPercent: 4,
  tradeSizePercent: 2,
  allowedAssets: ["XAUUSD", "EURUSD", "GBPUSD", "BTCUSD", "ETHUSD"],
  requireConfirmation: true,
};

const SETTINGS_VERSION = "v3";
const STORAGE_KEY = `saud-fin-${SETTINGS_VERSION}`;

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      const merged = { ...DEFAULT_SETTINGS, ...parsed };
      merged.accountBalance = Math.max(100, merged.accountBalance || 1000);
      return merged;
    }
  } catch {}
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const loaded = true;

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      if (next.accountBalance < 100) next.accountBalance = 100;
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS)); } catch {}
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}

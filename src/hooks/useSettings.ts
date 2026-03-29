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
  theme: string;
  accountBalance: number;
  cooldownEnabled: boolean;
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
  ],
  tradingHours: "all",
  notificationsEnabled: true,
  brokerType: "demo",
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
  theme: "dark",
  accountBalance: 100000,
  cooldownEnabled: true,
};

const STORAGE_KEY = "saud-fin-settings";

function loadSettings(): AppSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_SETTINGS, ...JSON.parse(stored) };
    }
  } catch {
    // Use defaults
  }
  return DEFAULT_SETTINGS;
}

export function useSettings() {
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const loaded = true;

  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Storage full or disabled
      }
      return next;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    } catch {
      // ignore
    }
  }, []);

  return { settings, updateSettings, resetSettings, loaded };
}

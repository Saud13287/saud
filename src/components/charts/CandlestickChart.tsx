"use client";
import { useEffect, useRef } from "react";

interface CandleData {
  open: number;
  high: number;
  low: number;
  close: number;
  label: string;
}

interface Props {
  data: CandleData[];
  height?: number;
  showVolume?: boolean;
  sma20?: number[];
  sma50?: number[];
}

export default function CandlestickChart({
  data,
  height = 300,
  sma20,
  sma50,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || data.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const w = rect.width;
    const h = rect.height;
    const padding = { top: 10, right: 15, bottom: 25, left: 55 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const allHighs = data.map((d) => d.high);
    const allLows = data.map((d) => d.low);
    const maxPrice = Math.max(...allHighs);
    const minPrice = Math.min(...allLows);
    const priceRange = maxPrice - minPrice || 1;

    const toY = (price: number) =>
      padding.top + chartH - ((price - minPrice) / priceRange) * chartH;

    ctx.strokeStyle = "#1e293b";
    ctx.lineWidth = 0.5;
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (chartH / 4) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(w - padding.right, y);
      ctx.stroke();
      ctx.fillStyle = "#64748b";
      ctx.font = "10px sans-serif";
      ctx.textAlign = "left";
      const val = maxPrice - (priceRange / 4) * i;
      ctx.fillText(val.toFixed(val > 100 ? 0 : 2), 2, y + 3);
    }

    const candleW = Math.max(2, (chartW / data.length) * 0.7);
    const gap = chartW / data.length;

    data.forEach((candle, i) => {
      const x = padding.left + i * gap + gap / 2;
      const isGreen = candle.close >= candle.open;
      const color = isGreen ? "#10b981" : "#ef4444";

      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, toY(candle.high));
      ctx.lineTo(x, toY(candle.low));
      ctx.stroke();

      const bodyTop = toY(Math.max(candle.open, candle.close));
      const bodyBot = toY(Math.min(candle.open, candle.close));
      const bodyH = Math.max(bodyBot - bodyTop, 1);

      ctx.fillStyle = color;
      ctx.fillRect(x - candleW / 2, bodyTop, candleW, bodyH);
    });

    if (sma20 && sma20.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#f59e0b";
      ctx.lineWidth = 1.5;
      sma20.forEach((val, i) => {
        if (isNaN(val)) return;
        const x = padding.left + i * gap + gap / 2;
        const y = toY(val);
        if (i === 0 || isNaN(sma20[i - 1])) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    if (sma50 && sma50.length > 0) {
      ctx.beginPath();
      ctx.strokeStyle = "#8b5cf6";
      ctx.lineWidth = 1.5;
      sma50.forEach((val, i) => {
        if (isNaN(val)) return;
        const x = padding.left + i * gap + gap / 2;
        const y = toY(val);
        if (i === 0 || isNaN(sma50[i - 1])) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
    }

    const step = Math.max(1, Math.floor(data.length / 6));
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < data.length; i += step) {
      const x = padding.left + i * gap + gap / 2;
      ctx.fillText(data[i].label, x, h - 5);
    }
  }, [data, height, sma20, sma50]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: "100%", height: `${height}px` }}
      className="rounded"
    />
  );
}

"use client";
import { useEffect, useRef } from "react";

interface DataPoint {
  label: string;
  value: number;
}

interface Props {
  data: DataPoint[];
  height?: number;
  color?: string;
  fillColor?: string;
  showDots?: boolean;
  showGrid?: boolean;
  title?: string;
  prefix?: string;
  suffix?: string;
}

export default function LineChart({
  data,
  height = 200,
  color = "#3b82f6",
  fillColor,
  showDots = false,
  showGrid = true,
  title,
  prefix = "",
  suffix = "",
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
    const padding = { top: 10, right: 15, bottom: 30, left: 55 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    ctx.clearRect(0, 0, w, h);

    const values = data.map((d) => d.value);
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values);
    const range = maxVal - minVal || 1;

    if (showGrid) {
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
        const val = maxVal - (range / 4) * i;
        ctx.fillText(`${prefix}${val.toFixed(val > 100 ? 0 : 2)}${suffix}`, 2, y + 3);
      }
    }

    if (fillColor || color + "20") {
      ctx.beginPath();
      ctx.moveTo(padding.left, padding.top + chartH);
      data.forEach((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
        if (i === 0) ctx.lineTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.lineTo(padding.left + chartW, padding.top + chartH);
      ctx.closePath();
      const grad = ctx.createLinearGradient(0, padding.top, 0, h - padding.bottom);
      grad.addColorStop(0, fillColor || color + "30");
      grad.addColorStop(1, fillColor || color + "05");
      ctx.fillStyle = grad;
      ctx.fill();
    }

    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.lineJoin = "round";
    data.forEach((d, i) => {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.stroke();

    if (showDots) {
      data.forEach((d, i) => {
        const x = padding.left + (i / (data.length - 1)) * chartW;
        const y = padding.top + chartH - ((d.value - minVal) / range) * chartH;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.fill();
        ctx.strokeStyle = "#0a0e17";
        ctx.lineWidth = 1.5;
        ctx.stroke();
      });
    }

    const step = Math.max(1, Math.floor(data.length / 6));
    ctx.fillStyle = "#64748b";
    ctx.font = "10px sans-serif";
    ctx.textAlign = "center";
    for (let i = 0; i < data.length; i += step) {
      const x = padding.left + (i / (data.length - 1)) * chartW;
      ctx.fillText(data[i].label, x, h - 8);
    }
  }, [data, height, color, fillColor, showDots, showGrid, prefix, suffix]);

  return (
    <div>
      {title && <p className="text-xs text-[var(--color-omega-muted)] mb-2">{title}</p>}
      <canvas
        ref={canvasRef}
        style={{ width: "100%", height: `${height}px` }}
        className="rounded"
      />
    </div>
  );
}

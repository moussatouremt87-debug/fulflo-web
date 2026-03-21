"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { useI18n } from "@/lib/i18n";

interface ChartDataPoint {
  day: string;
  units_sold: number;
  target: number;
}

function generateDemoData(): ChartDataPoint[] {
  const data: ChartDataPoint[] = [];
  const now = new Date();
  for (let i = 29; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const label = d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
    const base = 40 + Math.sin(i / 4) * 15 + Math.random() * 20;
    data.push({
      day: label,
      units_sold: Math.round(Math.max(5, base)),
      target: 50,
    });
  }
  return data;
}

const DEMO_DATA = generateDemoData();

interface ClearanceChartProps {
  data?: ChartDataPoint[];
}

export default function ClearanceChart({ data = DEMO_DATA }: ClearanceChartProps) {
  const { t } = useI18n();

  const showEvery = Math.ceil(data.length / 6);
  const tickFormatter = (_: unknown, index: number) =>
    index % showEvery === 0 ? data[index]?.day ?? "" : "";

  return (
    <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
      <div className="mb-4">
        <h3 className="font-bold text-gray-900">{t("dashboard.chart.title")}</h3>
        <p className="text-xs text-gray-400">{t("dashboard.chart.subtitle")}</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 4, right: 4, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="colorUnits" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 11, fill: "#9ca3af" }}
            tickFormatter={tickFormatter}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ borderRadius: "12px", border: "1px solid #e5e7eb", fontSize: 12 }}
            labelStyle={{ fontWeight: 600, color: "#111827" }}
          />
          <Legend
            formatter={(value) => (
              <span className="text-xs text-gray-600">
                {value === "units_sold" ? t("dashboard.chart.units") : "Objectif"}
              </span>
            )}
          />
          <Area
            type="monotone"
            dataKey="units_sold"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorUnits)"
            dot={false}
          />
          <Area
            type="monotone"
            dataKey="target"
            stroke="#1B4332"
            strokeWidth={1.5}
            strokeDasharray="4 4"
            fill="none"
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

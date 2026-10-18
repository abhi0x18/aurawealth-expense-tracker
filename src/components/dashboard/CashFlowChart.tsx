"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { formatCurrency } from "@/lib/money";

interface CashFlowChartProps {
  data: { month: string; income: number; expense: number }[];
}

export function CashFlowChart({ data }: CashFlowChartProps) {
  const customTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white/95 dark:bg-slate-900/95 p-3.5 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl text-sm space-y-2 backdrop-blur-md">
          <p className="font-extrabold text-slate-900 dark:text-white mb-1.5">{label}</p>
          <div className="flex items-center gap-2.5 text-emerald-600 dark:text-emerald-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span>Income:</span>
            <span className="font-mono font-extrabold">{formatCurrency(payload[0]?.value * 100)}</span>
          </div>
          <div className="flex items-center gap-2.5 text-rose-600 dark:text-rose-400 font-bold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span>Expense:</span>
            <span className="font-mono font-extrabold">{formatCurrency(payload[1]?.value * 100)}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
            Income &amp; Expense Trend
          </h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Past 6 months cash flow comparison
          </p>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fontWeight: 600, fill: "#64748b" }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 13, fontWeight: 600, fill: "#64748b" }}
              tickFormatter={(v) => `₹${v >= 1000 ? `${v / 1000}k` : v}`}
            />
            <Tooltip content={customTooltip} />
            <Legend
              verticalAlign="top"
              align="right"
              iconType="circle"
              wrapperStyle={{ fontSize: 13, fontWeight: 700, paddingBottom: 12 }}
            />
            <Bar dataKey="income" name="Income" fill="#10b981" radius={[6, 6, 0, 0]} maxBarSize={36} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[6, 6, 0, 0]} maxBarSize={36} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}

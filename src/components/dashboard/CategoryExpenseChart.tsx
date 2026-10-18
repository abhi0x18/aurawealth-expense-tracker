"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrency } from "@/lib/money";

interface CategoryExpenseChartProps {
  categories: {
    name: string;
    amount: number;
    amountPaise: bigint | number;
    color: string;
    count: number;
  }[];
}

const DEFAULT_COLORS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#ef4444",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#14b8a6",
];

export function CategoryExpenseChart({ categories }: CategoryExpenseChartProps) {
  const totalExpense = categories.reduce((sum, c) => sum + c.amount, 0);

  const customTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload;
      const pct = totalExpense > 0 ? Math.round((item.amount / totalExpense) * 100) : 0;
      return (
        <div className="bg-white dark:bg-slate-900 p-2.5 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-bold text-slate-900 dark:text-slate-100">{item.name}</p>
          <p className="text-rose-600 dark:text-rose-400 font-semibold">
            {formatCurrency(item.amountPaise)} ({pct}%)
          </p>
          <p className="text-slate-400 text-[10px]">{item.count} transaction{item.count > 1 ? "s" : ""}</p>
        </div>
      );
    }
    return null;
  };

  if (!categories || categories.length === 0) {
    return (
      <Card className="flex flex-col h-full justify-center items-center py-12 text-center">
        <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No Expenses in Period</p>
        <p className="text-xs text-slate-400 mt-1">Expenses recorded in this timeframe will appear here.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col h-full rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
            Expenses by Category
          </h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Where your capital flows
          </p>
        </div>
      </div>

      <div className="h-48 w-full relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={customTooltip} />
            <Pie
              data={categories}
              dataKey="amount"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={45}
              outerRadius={75}
              paddingAngle={3}
            >
              {categories.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Top 4 Categories Legend */}
      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-200/80 dark:border-white/10">
        {categories.slice(0, 4).map((c, i) => {
          const pct = totalExpense > 0 ? Math.round((c.amount / totalExpense) * 100) : 0;
          return (
            <div key={c.name} className="flex items-center gap-2.5 text-sm">
              <span
                className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                style={{ backgroundColor: c.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length] }}
              />
              <span className="truncate text-slate-700 dark:text-slate-200 font-bold">
                {c.name}
              </span>
              <span className="ml-auto font-mono font-black text-slate-900 dark:text-white">{pct}%</span>
            </div>
          );
        })}
      </div>
    </Card>
  );
}

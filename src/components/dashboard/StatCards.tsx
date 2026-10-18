"use client";

import React from "react";
import { useCurrency } from "@/context/CurrencyContext";
import {
  TrendingUp,
  TrendingDown,
  Scale,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
} from "lucide-react";

interface StatCardsProps {
  overview: {
    totalIncomePaise: bigint | number;
    totalExpensePaise: bigint | number;
    netCashFlowPaise: bigint | number;
    totalBalancePaise: bigint | number;
    incomeChangePct?: number;
    expenseChangePct?: number;
  };
}

export function StatCards({ overview }: StatCardsProps) {
  const { formatMoney } = useCurrency();
  const isNetPositive = Number(overview.netCashFlowPaise) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Income Card */}
      <div className="tilt-card glass-panel rounded-3xl p-6 border border-emerald-500/20 group shadow-xl">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Income
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <TrendingUp className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatMoney(overview.totalIncomePaise)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
              {overview.incomeChangePct !== undefined ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                    overview.incomeChangePct >= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {overview.incomeChangePct >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {Math.abs(overview.incomeChangePct).toFixed(1)}% vs last mo
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-emerald-400" />
                  Active inflow cycle
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Expense Card */}
      <div className="tilt-card glass-panel rounded-3xl p-6 border border-rose-500/20 group shadow-xl">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Expenses
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-red-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <TrendingDown className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatMoney(overview.totalExpensePaise)}
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs font-semibold">
              {overview.expenseChangePct !== undefined ? (
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full font-mono text-xs font-bold ${
                    overview.expenseChangePct <= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  }`}
                >
                  {overview.expenseChangePct <= 0 ? (
                    <ArrowDownRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  ) : (
                    <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                  )}
                  {Math.abs(overview.expenseChangePct).toFixed(1)}% vs last mo
                </span>
              ) : (
                <span className="text-slate-400 dark:text-slate-500 font-medium">Outflow this period</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Net Cash Flow Card */}
      <div className="tilt-card glass-panel rounded-3xl p-6 border border-indigo-500/20 group shadow-xl">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Net Cash Flow
            </span>
            <div
              className={`w-10 h-10 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform ${
                isNetPositive
                  ? "bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-gradient-to-tr from-rose-500/20 to-red-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400"
              }`}
            >
              <Scale className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div
              className={`text-3xl sm:text-4xl font-black font-mono tracking-tight ${
                isNetPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              {formatMoney(overview.netCashFlowPaise, { showSign: true })}
            </div>
            <div className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              {isNetPositive ? "✨ Surplus retained in vault" : "⚠️ Outpacing current income"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Total Net Balance Card */}
      <div className="tilt-card glass-panel rounded-3xl p-6 border border-blue-500/20 group shadow-xl">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Total Net Worth
            </span>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
              <Wallet className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl font-black font-mono text-slate-900 dark:text-white tracking-tight">
              {formatMoney(overview.totalBalancePaise)}
            </div>
            <div className="mt-3 text-xs font-medium text-slate-500 dark:text-slate-400">
              Across active bank & cash vaults
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

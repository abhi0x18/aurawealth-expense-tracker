"use client";

import React from "react";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
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
  const isNetPositive = Number(overview.netCashFlowPaise) >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* 1. Total Income Card */}
      <div className="tilt-card animated-border-card p-6 border border-emerald-500/25 group shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Total Inflow
            </span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-emerald-500/25 to-teal-500/15 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-115 group-hover:rotate-6 transition-all duration-300">
              <TrendingUp className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black font-mono text-slate-900 dark:text-white tracking-tight leading-none">
              <AnimatedCounter valuePaise={overview.totalIncomePaise} />
            </div>
            <div className="flex items-center gap-2 mt-3.5 text-sm font-semibold">
              {overview.incomeChangePct !== undefined ? (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs font-black ${
                    overview.incomeChangePct >= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
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
                <span className="text-slate-600 dark:text-slate-300 font-semibold flex items-center gap-1.5 text-xs">
                  <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
                  Active inflow cycle
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 2. Total Expense Card */}
      <div className="tilt-card animated-border-card p-6 border border-rose-500/25 group shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Total Outflow
            </span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-500/25 to-red-500/15 border border-rose-500/35 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner group-hover:scale-115 group-hover:-rotate-6 transition-all duration-300">
              <TrendingDown className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black font-mono text-slate-900 dark:text-white tracking-tight leading-none">
              <AnimatedCounter valuePaise={overview.totalExpensePaise} />
            </div>
            <div className="flex items-center gap-2 mt-3.5 text-sm font-semibold">
              {overview.expenseChangePct !== undefined ? (
                <span
                  className={`inline-flex items-center gap-1 px-3 py-1 rounded-full font-mono text-xs font-black ${
                    overview.expenseChangePct <= 0
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25"
                      : "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25"
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
                <span className="text-slate-600 dark:text-slate-300 font-semibold text-xs">Outflow this period</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Net Cash Flow Card */}
      <div className="tilt-card animated-border-card p-6 border border-indigo-500/25 group shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Net Cash Flow
            </span>
            <div
              className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-inner group-hover:scale-115 transition-all duration-300 ${
                isNetPositive
                  ? "bg-gradient-to-tr from-emerald-500/25 to-teal-500/15 border border-emerald-500/35 text-emerald-600 dark:text-emerald-400"
                  : "bg-gradient-to-tr from-rose-500/25 to-red-500/15 border border-rose-500/35 text-rose-600 dark:text-rose-400"
              }`}
            >
              <Scale className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div
              className={`text-3xl sm:text-4xl lg:text-[2.5rem] font-black font-mono tracking-tight leading-none ${
                isNetPositive
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-rose-600 dark:text-rose-400"
              }`}
            >
              <AnimatedCounter valuePaise={overview.netCashFlowPaise} showSign />
            </div>
            <div className="mt-3.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              {isNetPositive ? "✨ Surplus retained in vault" : "⚠️ Outpacing current income"}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Total Net Balance Card */}
      <div className="tilt-card animated-border-card p-6 border border-blue-500/25 group shadow-xl hover:-translate-y-1.5 transition-all duration-300">
        <div className="tilt-glare" />
        <div className="tilt-inner relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-sm font-display font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Total Net Worth
            </span>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500/25 to-indigo-500/15 border border-blue-500/35 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-115 group-hover:rotate-12 transition-all duration-300">
              <Wallet className="w-5 h-5 drop-shadow" />
            </div>
          </div>

          <div className="mt-4">
            <div className="text-3xl sm:text-4xl lg:text-[2.5rem] font-black font-mono text-slate-900 dark:text-white tracking-tight leading-none">
              <AnimatedCounter valuePaise={overview.totalBalancePaise} />
            </div>
            <div className="mt-3.5 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">
              Across active bank & cash vaults
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

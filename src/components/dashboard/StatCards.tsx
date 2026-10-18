"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";
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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {/* 1. Total Income Card */}
      <Card hover glow="emerald" className="relative group p-6">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Total Income
          </span>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <TrendingUp className="w-5 h-5 drop-shadow" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-xs">
            {formatCurrency(overview.totalIncomePaise)}
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-xs">
            {overview.incomeChangePct !== undefined && overview.incomeChangePct !== 0 ? (
              <span
                className={`flex items-center font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                  overview.incomeChangePct > 0
                    ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                    : "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                }`}
              >
                {overview.incomeChangePct > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {Math.abs(overview.incomeChangePct)}%
              </span>
            ) : (
              <span className="text-slate-400 font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">0%</span>
            )}
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">vs last period</span>
          </div>
        </div>
      </Card>

      {/* 2. Total Expenses Card */}
      <Card hover glow="purple" className="relative group p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-rose-500/20 transition-all" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-pink-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <TrendingDown className="w-5 h-5 drop-shadow" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-xs">
            {formatCurrency(overview.totalExpensePaise)}
          </div>
          <div className="flex items-center gap-2 mt-2.5 text-xs">
            {overview.expenseChangePct !== undefined && overview.expenseChangePct !== 0 ? (
              <span
                className={`flex items-center font-bold px-2 py-0.5 rounded-lg text-[11px] ${
                  overview.expenseChangePct > 0
                    ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                    : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                }`}
              >
                {overview.expenseChangePct > 0 ? (
                  <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                ) : (
                  <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
                )}
                {Math.abs(overview.expenseChangePct)}%
              </span>
            ) : (
              <span className="text-slate-400 font-semibold px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px]">0%</span>
            )}
            <span className="text-slate-400 dark:text-slate-500 text-[11px]">vs last period</span>
          </div>
        </div>
      </Card>

      {/* 3. Net Cash Flow Card */}
      <Card hover glow={isNetPositive ? "emerald" : "purple"} className="relative group p-6">
        <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-2xl pointer-events-none transition-all ${isNetPositive ? "bg-emerald-500/10 group-hover:bg-emerald-500/20" : "bg-rose-500/10 group-hover:bg-rose-500/20"}`} />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Net Cash Flow
          </span>
          <div
            className={`w-10 h-10 rounded-2xl flex items-center justify-center border shadow-inner group-hover:scale-110 transition-transform ${
              isNetPositive
                ? "bg-gradient-to-tr from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-600 dark:text-emerald-400"
                : "bg-gradient-to-tr from-rose-500/20 to-pink-500/10 border-rose-500/30 text-rose-600 dark:text-rose-400"
            }`}
          >
            <Scale className="w-5 h-5 drop-shadow" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div
            className={`text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs ${
              isNetPositive ? "text-emerald-500 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
            }`}
          >
            {formatCurrency(overview.netCashFlowPaise, { showSign: true })}
          </div>
          <div className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${isNetPositive ? "bg-emerald-500" : "bg-rose-500"}`} />
            {isNetPositive ? "Surplus preserved in liquid assets" : "Deficit observed in period"}
          </div>
        </div>
      </Card>

      {/* 4. Total Liquid Assets Balance Card */}
      <Card hover glow="blue" className="relative group p-6">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/20 transition-all" />

        <div className="flex items-center justify-between relative z-10">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
            Total Net Balance
          </span>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/10 border border-blue-500/30 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform">
            <Wallet className="w-5 h-5 drop-shadow" />
          </div>
        </div>

        <div className="mt-4 relative z-10">
          <div className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight drop-shadow-xs">
            {formatCurrency(overview.totalBalancePaise)}
          </div>
          <div className="mt-2.5 text-xs text-slate-400 dark:text-slate-500 font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Combined balance of all accounts
          </div>
        </div>
      </Card>
    </div>
  );
}

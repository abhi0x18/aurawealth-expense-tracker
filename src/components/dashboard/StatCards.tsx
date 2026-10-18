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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. Total Income Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Income
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(overview.totalIncomePaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {overview.incomeChangePct !== undefined && overview.incomeChangePct !== 0 ? (
              <span
                className={`flex items-center font-semibold ${
                  overview.incomeChangePct > 0 ? "text-emerald-600" : "text-rose-600"
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
              <span className="text-slate-400 font-medium">0%</span>
            )}
            <span className="text-slate-400">vs prev period</span>
          </div>
        </div>
      </Card>

      {/* 2. Total Expenses Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(overview.totalExpensePaise)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {overview.expenseChangePct !== undefined && overview.expenseChangePct !== 0 ? (
              <span
                className={`flex items-center font-semibold ${
                  overview.expenseChangePct > 0 ? "text-rose-600" : "text-emerald-600"
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
              <span className="text-slate-400 font-medium">0%</span>
            )}
            <span className="text-slate-400">vs prev period</span>
          </div>
        </div>
      </Card>

      {/* 3. Net Cash Flow Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Net Cash Flow
          </span>
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isNetPositive
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                : "bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400"
            }`}
          >
            <Scale className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div
            className={`text-2xl font-black tracking-tight ${
              isNetPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            }`}
          >
            {formatCurrency(overview.netCashFlowPaise, { showSign: true })}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            {isNetPositive ? "Surplus preserved" : "Deficit this period"}
          </div>
        </div>
      </Card>

      {/* 4. Total Active Accounts Balance Card */}
      <Card hover className="relative overflow-hidden">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Total Net Balance
          </span>
          <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>

        <div className="mt-3">
          <div className="text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {formatCurrency(overview.totalBalancePaise)}
          </div>
          <div className="mt-2 text-xs text-slate-400">
            Across active bank & cash accounts
          </div>
        </div>
      </Card>
    </div>
  );
}

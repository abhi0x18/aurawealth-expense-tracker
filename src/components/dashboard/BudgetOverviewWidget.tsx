"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useCurrency } from "@/context/CurrencyContext";
import { AlertTriangle, ChevronRight, Target } from "lucide-react";

interface BudgetOverviewWidgetProps {
  budgets: any[];
}

export function BudgetOverviewWidget({ budgets }: BudgetOverviewWidgetProps) {
  const { formatMoney } = useCurrency();

  return (
    <Card className="flex flex-col h-full rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
            Budget Utilization
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Monthly allocation ceilings</p>
        </div>
        <Link
          href="/budgets"
          className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors"
        >
          <span>Manage</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-10 text-center">
          <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-3">
            <Target className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">No monthly budgets configured yet</p>
          <Link
            href="/budgets"
            className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Set a monthly budget
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {budgets.slice(0, 4).map((b) => {
            const isOver = b.isOverBudget;
            const isWarn = b.isWarning;

            return (
              <div key={b.id} className="space-y-2 p-3 rounded-2xl bg-slate-50/60 dark:bg-slate-800/30 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    {b.name}
                    {isOver && (
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-bold flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-500/10">
                        <AlertTriangle className="w-3.5 h-3.5" /> Over
                      </span>
                    )}
                    {isWarn && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-bold flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10">
                        <AlertTriangle className="w-3.5 h-3.5" /> High
                      </span>
                    )}
                  </span>
                  <span className="text-slate-600 dark:text-slate-300 font-mono font-bold text-xs">
                    {formatMoney(b.spentPaise)} / {formatMoney(b.budgetPaise)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2.5 bg-slate-200/80 dark:bg-slate-700/60 rounded-full overflow-hidden p-0.5">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? "bg-rose-500 shadow-sm shadow-rose-500/50"
                        : isWarn
                        ? "bg-amber-500 shadow-sm shadow-amber-500/50"
                        : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm shadow-emerald-500/50"
                    }`}
                    style={{ width: `${Math.min(b.percentage, 100)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

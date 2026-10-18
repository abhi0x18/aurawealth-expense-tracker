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
          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
            Budget Utilization
          </h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Monthly allocation ceilings
          </p>
        </div>
        <Link
          href="/budgets"
          className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors"
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
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">No monthly budgets configured yet</p>
          <Link
            href="/budgets"
            className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline"
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
              <div key={b.id} className="space-y-2 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-100 dark:border-white/5">
                <div className="flex items-center justify-between text-base">
                  <span className="font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                    {b.name}
                    {isOver && (
                      <span className="text-xs text-rose-600 dark:text-rose-400 font-black flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-rose-500/15 border border-rose-500/25">
                        <AlertTriangle className="w-3.5 h-3.5" /> Over
                      </span>
                    )}
                    {isWarn && (
                      <span className="text-xs text-amber-600 dark:text-amber-400 font-black flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 border border-amber-500/25">
                        <AlertTriangle className="w-3.5 h-3.5" /> High
                      </span>
                    )}
                  </span>
                  <span className="text-slate-800 dark:text-slate-200 font-mono font-black text-sm">
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

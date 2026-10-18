"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";
import { AlertTriangle, ChevronRight } from "lucide-react";

interface BudgetOverviewWidgetProps {
  budgets: any[];
}

export function BudgetOverviewWidget({ budgets }: BudgetOverviewWidgetProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Monthly Budget Utilization
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Spending limits this month</p>
        </div>
        <Link
          href="/budgets"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
        >
          Manage
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {budgets.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
          <p className="text-xs text-slate-400 mb-2">No monthly budgets configured yet</p>
          <Link
            href="/budgets"
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
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
              <div key={b.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                    {b.name}
                    {isOver && (
                      <span className="text-[10px] text-rose-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Over
                      </span>
                    )}
                    {isWarn && (
                      <span className="text-[10px] text-amber-600 font-bold flex items-center gap-0.5">
                        <AlertTriangle className="w-3 h-3" /> Nearing limit
                      </span>
                    )}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 font-medium">
                    {formatCurrency(b.spentPaise)} / {formatCurrency(b.budgetPaise)}
                  </span>
                </div>

                {/* Progress bar */}
                <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isOver
                        ? "bg-rose-500"
                        : isWarn
                        ? "bg-amber-500"
                        : "bg-emerald-500"
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

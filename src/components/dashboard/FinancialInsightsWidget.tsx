"use client";

import React from "react";
import { Card } from "@/components/ui/Card";
import { AlertTriangle, CheckCircle2, Info, Lightbulb } from "lucide-react";
import { FinancialInsight } from "@/lib/insights";

interface FinancialInsightsWidgetProps {
  insights: FinancialInsight[];
}

export function FinancialInsightsWidget({ insights }: FinancialInsightsWidgetProps) {
  if (!insights || insights.length === 0) {
    return (
      <Card className="flex items-center gap-3 p-4 bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200/60 dark:border-emerald-800/40">
        <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
          <Lightbulb className="w-4 h-4" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
            Smart Financial Insights
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            As you log income and expenses, rule-based cash flow alerts and budget warnings will appear here.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      {insights.map((insight) => {
        const isAlert = insight.type === "alert";
        const isWarning = insight.type === "warning";
        const isSuccess = insight.type === "success";

        return (
          <div
            key={insight.id}
            className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all ${
              isAlert
                ? "bg-rose-50/80 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900/60 text-rose-900 dark:text-rose-100"
                : isWarning
                ? "bg-amber-50/80 dark:bg-amber-950/30 border-amber-200 dark:border-amber-900/60 text-amber-900 dark:text-amber-100"
                : isSuccess
                ? "bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-900/60 text-emerald-900 dark:text-emerald-100"
                : "bg-sky-50/80 dark:bg-sky-950/30 border-sky-200 dark:border-sky-900/60 text-sky-900 dark:text-sky-100"
            }`}
          >
            <div
              className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                isAlert
                  ? "bg-rose-200/60 text-rose-700 dark:bg-rose-900/80 dark:text-rose-300"
                  : isWarning
                  ? "bg-amber-200/60 text-amber-700 dark:bg-amber-900/80 dark:text-amber-300"
                  : isSuccess
                  ? "bg-emerald-200/60 text-emerald-700 dark:bg-emerald-900/80 dark:text-emerald-300"
                  : "bg-sky-200/60 text-sky-700 dark:bg-sky-900/80 dark:text-sky-300"
              }`}
            >
              {isAlert && <AlertTriangle className="w-4 h-4" />}
              {isWarning && <AlertTriangle className="w-4 h-4" />}
              {isSuccess && <CheckCircle2 className="w-4 h-4" />}
              {!isAlert && !isWarning && !isSuccess && <Info className="w-4 h-4" />}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">{insight.title}</span>
                {insight.metric && (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-white/70 dark:bg-black/40 border border-black/5 dark:border-white/10">
                    {insight.metric}
                  </span>
                )}
              </div>
              <p className="text-xs opacity-90 mt-0.5 leading-relaxed">{insight.message}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

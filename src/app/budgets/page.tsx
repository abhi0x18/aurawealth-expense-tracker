"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BudgetModal } from "@/components/budgets/BudgetModal";
import { Target3DProp } from "@/components/ui/FinancialProps";
import { useCurrency } from "@/context/CurrencyContext";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { triggerConfetti } from "@/lib/confetti";
import { formatMonthYear } from "@/lib/date";
import {
  PieChart,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Edit2,
  Trash2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";

export default function BudgetsPage() {
  const { formatMoney } = useCurrency();
  const now = new Date();
  const currentMonthKey = format(now, "yyyy-MM");
  const [selectedMonth, setSelectedMonth] = useState(currentMonthKey);
  const [budgets, setBudgets] = useState<any[]>([]);
  const [totalExpense, setTotalExpense] = useState<bigint | number>(0);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<any>(null);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []));
  }, []);

  const fetchBudgets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/budgets?monthYear=${selectedMonth}`);
      const data = await res.json();
      setBudgets(data.budgets || []);
      setTotalExpense(data.totalMonthlyExpensePaise || 0);
    } catch (err) {
      console.error("Failed to fetch budgets:", err);
    } finally {
      setLoading(false);
    }
  }, [selectedMonth]);

  useEffect(() => {
    fetchBudgets();
  }, [fetchBudgets]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this budget limit?")) {
      try {
        await fetch(`/api/budgets/${id}`, { method: "DELETE" });
        fetchBudgets();
      } catch (err) {
        console.error("Failed to delete budget:", err);
      }
    }
  };

  const overallBudget = budgets.find((b) => b.categoryId === null);
  const categoryBudgets = budgets.filter((b) => b.categoryId !== null);

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Spending Budgets &amp; Caps
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/30">
                Guards Active
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Establish monthly spending guardrails with automatic threshold warnings at 80% utilization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Picker */}
            <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-sm font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer font-mono"
              />
            </div>

            <Button
              onClick={() => {
                setEditingBudget(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-2xl font-bold text-sm px-6 py-3 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Set Budget
            </Button>
          </div>
        </div>

        {/* Overall Monthly Budget 3D Card */}
        {overallBudget && (
          <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-700/60 shadow-2xl overflow-hidden animate-shimmer">
            <div
              className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl pointer-events-none ${
                overallBudget.isOverBudget
                  ? "bg-rose-500/20"
                  : overallBudget.isWarning
                  ? "bg-amber-500/20"
                  : "bg-emerald-500/20"
              }`}
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-xs font-mono font-extrabold uppercase tracking-widest text-slate-400">
                    Monthly Cap • {formatMonthYear(selectedMonth)}
                  </span>
                  {overallBudget.isOverBudget && (
                    <Badge variant="danger" size="sm" className="font-mono font-bold text-xs">
                      Limit Exceeded
                    </Badge>
                  )}
                  {overallBudget.isWarning && !overallBudget.isOverBudget && (
                    <Badge variant="warning" size="sm" className="font-mono font-bold text-xs">
                      Nearing Threshold
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-4">
                  <span className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight">
                    <AnimatedCounter valuePaise={overallBudget.spentPaise} />
                  </span>
                  <span className="text-lg text-slate-400 font-bold font-mono">
                    of {formatMoney(overallBudget.budgetPaise)}
                  </span>
                </div>

                <p className="text-sm text-slate-300 font-medium">
                  Remaining Allowance:{" "}
                  <span
                    className={`font-mono font-black ${
                      overallBudget.remainingPaise < 0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formatMoney(overallBudget.remainingPaise)}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-center">
                <Button
                  onClick={() => {
                    setEditingBudget(overallBudget);
                    setModalOpen(true);
                  }}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-white/20 text-white hover:bg-white/10 text-xs font-bold"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(overallBudget.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-rose-500/30 text-rose-300 hover:bg-rose-500/20 text-xs font-bold"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* 3D Glowing Progress bar */}
            <div className="w-full h-4 bg-slate-800/90 rounded-full overflow-hidden mt-8 p-0.5 border border-white/10 relative z-10 shadow-inner">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallBudget.isOverBudget
                    ? "bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.7)]"
                    : overallBudget.isWarning
                    ? "bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.7)]"
                    : "bg-gradient-to-r from-emerald-500 to-teal-400 shadow-[0_0_15px_rgba(16,185,129,0.7)]"
                }`}
                style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-slate-400 mt-2.5 font-semibold relative z-10">
              <span className="font-mono font-bold">{overallBudget.percentage}% consumed</span>
              <span>Guard threshold set at {overallBudget.alertThreshold}%</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && budgets.length === 0 && (
          <div className="text-center py-20 px-6 bg-white/80 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl">
            <Target3DProp className="w-28 h-28 mx-auto mb-5 animate-float" />
            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              No budgets established for {formatMonthYear(selectedMonth)}
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-8 leading-relaxed font-normal">
              Set spending caps on Groceries, Dining, or Utilities to receive smart warnings before overspending.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="lg"
              className="rounded-2xl font-bold text-base px-8 py-4 shadow-xl shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Configure Budget
            </Button>
          </div>
        )}

        {/* Category Budgets Grid */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-5">
            <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Spending Caps ({categoryBudgets.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoryBudgets.map((b) => {
                const isOver = b.isOverBudget;
                const isWarn = b.isWarning;

                return (
                  <Card key={b.id} hover className="flex flex-col justify-between p-6 group rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <span className="font-display font-extrabold text-base text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                          {b.categoryName}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => {
                              setEditingBudget(b);
                              setModalOpen(true);
                            }}
                            className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mb-2">
                        <span className="text-2xl font-mono font-black text-slate-900 dark:text-white">
                          {formatMoney(b.spentPaise)}
                        </span>
                        <span className="text-sm font-mono text-slate-500 dark:text-slate-400 font-semibold">
                          limit {formatMoney(b.budgetPaise)}
                        </span>
                      </div>

                      <div className="w-full h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5 shadow-inner">
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

                      <div className="flex items-center justify-between mt-2.5 text-xs font-semibold">
                        <span className={`font-mono font-bold ${isOver ? "text-rose-600 dark:text-rose-400" : isWarn ? "text-amber-600 dark:text-amber-400" : "text-slate-500 dark:text-slate-400"}`}>
                          {b.percentage}% utilized
                        </span>
                        <span className="font-mono text-slate-500 dark:text-slate-400">
                          {formatMoney(b.remainingPaise)} left
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <BudgetModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          triggerConfetti();
          fetchBudgets();
        }}
        categories={categories}
        monthYear={selectedMonth}
        initialData={editingBudget}
      />
    </AppShell>
  );
}

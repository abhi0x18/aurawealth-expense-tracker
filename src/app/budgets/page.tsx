"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BudgetModal } from "@/components/budgets/BudgetModal";
import { Target3DProp } from "@/components/ui/FinancialProps";
import { formatCurrency } from "@/lib/money";
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
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Spending Budgets &amp; Caps
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                Guards Active
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Establish monthly spending guardrails with automatic threshold warnings at 80% utilization.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Picker */}
            <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer font-mono"
              />
            </div>

            <Button
              onClick={() => {
                setEditingBudget(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-2xl font-bold shadow-lg shadow-emerald-500/25"
            >
              <Plus className="w-4 h-4" />
              Set Budget
            </Button>
          </div>
        </div>

        {/* Overall Monthly Budget 3D Card */}
        {overallBudget && (
          <div className="relative rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900 border border-slate-700/50 shadow-2xl overflow-hidden animate-shimmer">
            <div className={`absolute top-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none ${overallBudget.isOverBudget ? "bg-rose-500/15" : overallBudget.isWarning ? "bg-amber-500/15" : "bg-emerald-500/15"}`} />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold uppercase tracking-widest text-slate-400">
                    Monthly Cap • {formatMonthYear(selectedMonth)}
                  </span>
                  {overallBudget.isOverBudget && (
                    <Badge variant="danger" size="sm" className="shadow-xs">
                      Limit Exceeded
                    </Badge>
                  )}
                  {overallBudget.isWarning && !overallBudget.isOverBudget && (
                    <Badge variant="warning" size="sm" className="shadow-xs">
                      Nearing Threshold
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                    {formatCurrency(overallBudget.spentPaise)}
                  </span>
                  <span className="text-base text-slate-400 font-semibold">
                    of {formatCurrency(overallBudget.budgetPaise)}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  Remaining Allowance:{" "}
                  <span
                    className={`font-black ${
                      overallBudget.remainingPaise < 0
                        ? "text-rose-400"
                        : "text-emerald-400"
                    }`}
                  >
                    {formatCurrency(overallBudget.remainingPaise)}
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
                  className="rounded-xl border-white/20 text-white hover:bg-white/10"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(overallBudget.id)}
                  variant="outline"
                  size="sm"
                  className="rounded-xl border-rose-500/30 text-rose-300 hover:bg-rose-500/20"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* 3D Glowing Progress bar */}
            <div className="w-full h-3.5 bg-slate-800/80 rounded-full overflow-hidden mt-6 p-0.5 border border-white/10 relative z-10">
              <div
                className={`h-full rounded-full transition-all duration-700 ${
                  overallBudget.isOverBudget
                    ? "bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.6)]"
                    : overallBudget.isWarning
                    ? "bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]"
                    : "bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.6)]"
                }`}
                style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-slate-400 mt-2 font-semibold relative z-10">
              <span>{overallBudget.percentage}% consumed</span>
              <span>Guard threshold set at {overallBudget.alertThreshold}%</span>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && budgets.length === 0 && (
          <div className="text-center py-16 px-4 bg-white/70 dark:bg-slate-900/40 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-md">
            <Target3DProp className="w-24 h-24 mx-auto mb-4 animate-float" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">
              No budgets established for {formatMonthYear(selectedMonth)}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto mt-1 mb-6 leading-relaxed">
              Set spending caps on Groceries, Dining, or Utilities to receive smart warnings before overspending.
            </p>
            <Button
              onClick={() => setModalOpen(true)}
              variant="primary"
              size="md"
              className="rounded-2xl font-bold"
            >
              <Plus className="w-4 h-4" />
              Configure Budget
            </Button>
          </div>
        )}

        {/* Category Budgets Grid */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
              Category Spending Caps ({categoryBudgets.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {categoryBudgets.map((b) => {
                const isOver = b.isOverBudget;
                const isWarn = b.isWarning;

                return (
                  <Card key={b.id} hover className="flex flex-col justify-between p-6 group">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-extrabold text-sm text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                          {b.categoryName}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingBudget(b);
                              setModalOpen(true);
                            }}
                            className="p-1.5 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-3">
                        <span className="text-xl font-black text-slate-900 dark:text-white tracking-tight">
                          {formatCurrency(b.spentPaise)}
                        </span>
                        <span className="text-xs font-semibold text-slate-400">
                          of {formatCurrency(b.budgetPaise)}
                        </span>
                      </div>

                      {/* 3D Progress bar */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800/80 rounded-full overflow-hidden mt-2.5 p-0.5 border border-slate-200/80 dark:border-white/5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isOver
                              ? "bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"
                              : isWarn
                              ? "bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]"
                              : "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]"
                          }`}
                          style={{ width: `${Math.min(b.percentage, 100)}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 mt-2 font-semibold">
                        <span>{b.percentage}% used</span>
                        <span>
                          {b.remainingPaise >= 0 ? (
                            <span className="text-emerald-500 dark:text-emerald-400">
                              {formatCurrency(b.remainingPaise)} left
                            </span>
                          ) : (
                            <span className="text-rose-500">
                              {formatCurrency(Math.abs(Number(b.remainingPaise)))} over
                            </span>
                          )}
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
        onSuccess={fetchBudgets}
        monthYear={selectedMonth}
        categories={categories}
        initialData={editingBudget}
      />
    </AppShell>
  );
}

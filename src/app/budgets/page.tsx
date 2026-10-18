"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { BudgetModal } from "@/components/budgets/BudgetModal";
import { EmptyState } from "@/components/ui/EmptyState";
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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Monthly Budgets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set spending limits for categories to avoid overspending
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Month Picker */}
            <div className="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl">
              <Calendar className="w-4 h-4 text-slate-400 ml-2" />
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none pr-2 cursor-pointer"
              />
            </div>

            <Button
              onClick={() => {
                setEditingBudget(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-xl font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              Set Budget
            </Button>
          </div>
        </div>

        {/* Overall Monthly Budget Card (if set) */}
        {overallBudget && (
          <Card className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white rounded-2xl shadow-lg border-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Overall Monthly Budget • {formatMonthYear(selectedMonth)}
                  </span>
                  {overallBudget.isOverBudget && (
                    <Badge variant="danger" size="sm">
                      Over Limit
                    </Badge>
                  )}
                  {overallBudget.isWarning && (
                    <Badge variant="warning" size="sm">
                      Nearing Threshold
                    </Badge>
                  )}
                </div>

                <div className="flex items-baseline gap-3 mt-2">
                  <span className="text-3xl font-black tracking-tight">
                    {formatCurrency(overallBudget.spentPaise)}
                  </span>
                  <span className="text-sm text-slate-400">
                    of {formatCurrency(overallBudget.budgetPaise)}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mt-1">
                  Remaining:{" "}
                  <span
                    className={`font-bold ${
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
                  className="bg-white/10 hover:bg-white/20 text-white border-white/20"
                >
                  <Edit2 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button
                  onClick={() => handleDelete(overallBudget.id)}
                  variant="outline"
                  size="sm"
                  className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border-rose-500/30"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Progress bar */}
            <div className="w-full h-3 bg-slate-700/60 rounded-full overflow-hidden mt-4">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  overallBudget.isOverBudget
                    ? "bg-rose-500"
                    : overallBudget.isWarning
                    ? "bg-amber-500"
                    : "bg-emerald-500"
                }`}
                style={{ width: `${Math.min(overallBudget.percentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1.5 font-medium">
              <span>{overallBudget.percentage}% consumed</span>
              <span>Alert set at {overallBudget.alertThreshold}%</span>
            </div>
          </Card>
        )}

        {/* Empty State */}
        {!loading && budgets.length === 0 && (
          <EmptyState
            icon={PieChart}
            title={`No budgets set for ${formatMonthYear(selectedMonth)}`}
            description="Set a monthly spending limit overall or for specific categories like Groceries, Rent, or Dining to take control of your expenses."
            actionLabel="+ Set Your First Budget"
            onAction={() => setModalOpen(true)}
          />
        )}

        {/* Category Budgets Grid */}
        {categoryBudgets.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Category Budgets ({categoryBudgets.length})
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryBudgets.map((b) => {
                const isOver = b.isOverBudget;
                const isWarn = b.isWarning;

                return (
                  <Card key={b.id} hover className="flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {b.categoryName}
                        </span>
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setEditingBudget(b);
                              setModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(b.id)}
                            className="p-1 text-slate-400 hover:text-rose-600"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-baseline justify-between mt-2">
                        <span className="text-lg font-black text-slate-900 dark:text-slate-100">
                          {formatCurrency(b.spentPaise)}
                        </span>
                        <span className="text-xs text-slate-400">
                          of {formatCurrency(b.budgetPaise)}
                        </span>
                      </div>

                      {/* Progress bar */}
                      <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
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

                      <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2">
                        <span>{b.percentage}% used</span>
                        <span>
                          {b.remainingPaise >= 0 ? (
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                              {formatCurrency(b.remainingPaise)} left
                            </span>
                          ) : (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">
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

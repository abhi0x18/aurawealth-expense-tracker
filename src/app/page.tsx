"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { BudgetOverviewWidget } from "@/components/dashboard/BudgetOverviewWidget";
import { FinancialInsightsWidget } from "@/components/dashboard/FinancialInsightsWidget";
import { EmptyState } from "@/components/ui/EmptyState";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { Button } from "@/components/ui/Button";
import {
  Wallet,
  Calendar,
  Plus,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("this-month");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const [dashRes, meRes] = await Promise.all([
        fetch(`/api/dashboard?period=${period}`),
        fetch("/api/auth/me"),
      ]);

      const dashData = await dashRes.json();
      const meData = await meRes.json();

      setData(dashData);
      setUser(meData.user);
    } catch (err) {
      console.error("Failed to load dashboard data:", err);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchDashboard();

    const handleUpdate = () => fetchDashboard();
    window.addEventListener("transaction-updated", handleUpdate);
    return () => window.removeEventListener("transaction-updated", handleUpdate);
  }, [fetchDashboard]);

  const timePresets = [
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "this-year", label: "This Year" },
  ];

  return (
    <AppShell user={user}>
      <div className="space-y-6">
        {/* Top Header & Period Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Financial Overview
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Real-time cash flow, balances, and category spending
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Time Presets */}
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs">
              {timePresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                    period === p.value
                      ? "bg-emerald-50 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400 shadow-2xs"
                      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>

            <button
              onClick={fetchDashboard}
              title="Refresh dashboard"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {/* First-time User Empty State */}
        {!loading && data?.totalLifetimeTransactions === 0 && (
          <EmptyState
            icon={Wallet}
            title="Welcome to PaisaPilot!"
            description="Your personal finance dashboard is ready. Add your first income or expense transaction to see real cash flow and balance metrics come to life."
            actionLabel="+ Record Your First Transaction"
            onAction={() => setQuickAddOpen(true)}
          />
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* 1. Stat Cards Row */}
            <StatCards overview={data.overview} />

            {/* 2. Financial Insights Widget (Rule-based) */}
            {data.insights && data.insights.length > 0 && (
              <FinancialInsightsWidget insights={data.insights} />
            )}

            {/* 3. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <CashFlowChart data={data.monthlyTrend} />
              </div>
              <div>
                <CategoryExpenseChart categories={data.categoryBreakdown} />
              </div>
            </div>

            {/* 4. Bottom Row: Recent Transactions & Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <RecentTransactionsList
                  transactions={data.recentTransactions}
                  onOpenQuickAdd={() => setQuickAddOpen(true)}
                />
              </div>
              <div>
                <BudgetOverviewWidget budgets={data.budgetSummary} />
              </div>
            </div>
          </>
        )}
      </div>

      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={fetchDashboard}
      />
    </AppShell>
  );
}

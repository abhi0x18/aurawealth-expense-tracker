"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { BudgetOverviewWidget } from "@/components/dashboard/BudgetOverviewWidget";
import { FinancialInsightsWidget } from "@/components/dashboard/FinancialInsightsWidget";
import { Vault3DProp } from "@/components/ui/FinancialProps";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { Button } from "@/components/ui/Button";
import {
  Wallet,
  Calendar,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  ShieldCheck,
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
      <div className="space-y-8">
        {/* Top Header & Period Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Financial Dashboard
              </h1>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                Live Ledger
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Welcome back{user?.name ? `, ${user.name}` : ""}. Real-time cash flow and balance metrics.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Time Presets Bar */}
            <div className="flex items-center p-1 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-xs">
              {timePresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all ${
                    period === p.value
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-xs border border-emerald-500/30"
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
              className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl hover:border-emerald-500/40 transition-colors shadow-xs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* First-time User Empty State with 3D Vault Illustration */}
        {!loading && data?.totalLifetimeTransactions === 0 && (
          <div className="text-center py-16 px-4 bg-white/80 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-xl">
            <Vault3DProp className="w-28 h-28 mx-auto mb-4 animate-float" />
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Welcome to PaisaPilot!</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1.5 mb-6 leading-relaxed">
              Your institutional-grade personal ledger is ready. Record your first transaction or deposit opening balances to watch your financial metrics come to life.
            </p>
            <Button
              onClick={() => setQuickAddOpen(true)}
              variant="primary"
              size="lg"
              className="rounded-2xl font-bold shadow-lg shadow-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              Record First Transaction
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* 1. 3D Stat Cards Row */}
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

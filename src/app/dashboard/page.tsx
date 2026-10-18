"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { StatCards } from "@/components/dashboard/StatCards";
import { CashFlowChart } from "@/components/dashboard/CashFlowChart";
import { CategoryExpenseChart } from "@/components/dashboard/CategoryExpenseChart";
import { RecentTransactionsList } from "@/components/dashboard/RecentTransactionsList";
import { BudgetOverviewWidget } from "@/components/dashboard/BudgetOverviewWidget";
import { FinancialInsightsWidget } from "@/components/dashboard/FinancialInsightsWidget";
import { ThreeHeroScene } from "@/components/ui/ThreeHeroScene";
import { Vault3DProp } from "@/components/ui/FinancialProps";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { Button } from "@/components/ui/Button";
import { triggerConfetti } from "@/lib/confetti";
import { useCurrency } from "@/context/CurrencyContext";
import Link from "next/link";
import {
  Wallet,
  Calendar,
  Plus,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  ShieldCheck,
  Zap,
  BrainCircuit,
  Wifi,
  Play,
} from "lucide-react";

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<string>("this-month");
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [liveCounter, setLiveCounter] = useState(48219450);
  const { formatMoney } = useCurrency();

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

  // Live community savings counter ticker
  useEffect(() => {
    const timer = setInterval(() => {
      setLiveCounter((prev) => prev + Math.floor(Math.random() * 450) + 120);
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  const handleSimulateBonus = async () => {
    triggerConfetti();
    try {
      // Find first active account or fallback
      const accRes = await fetch("/api/accounts");
      const accounts = await accRes.json();
      const targetAcc = accounts[0]?.id;

      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "INCOME",
          amount: 50000,
          description: "Performance Bonus & Dividend Drop",
          date: new Date().toISOString(),
          accountId: targetAcc,
        }),
      });
      fetchDashboard();
    } catch (_) {}
  };

  const timePresets = [
    { value: "this-month", label: "This Month" },
    { value: "last-month", label: "Last Month" },
    { value: "last-30-days", label: "Last 30 Days" },
    { value: "this-year", label: "This Year" },
  ];

  return (
    <AppShell user={user}>
      <div className="space-y-12 pb-16">
        
        {/* ==================== AURAWEALTH 3D HERO SECTION ==================== */}
        <section className="relative pt-4 pb-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
            
            {/* Left Column: High-Impact Typography & Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left z-10">
              
              {/* Animated Live Savings Counter Badge */}
              <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full glass-panel border border-emerald-500/35 shadow-md animate-float-gentle">
                <span className="flex h-3 w-3 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </span>
                <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-700 dark:text-slate-200">
                  Live Global Savings:{" "}
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {formatMoney(liveCounter * 100)}
                  </span>
                </span>
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-mono font-bold">
                  v3.4 WebGL
                </span>
              </div>

              {/* Display Headline with animated flowing gradient */}
              <h1 className="font-display font-black text-4xl sm:text-5xl lg:text-6xl tracking-tight leading-[1.08] text-slate-900 dark:text-white">
                Master Your Money in <br className="hidden sm:inline" />
                <span className="animated-gradient-text drop-shadow-sm font-black">
                  Spatial 3D Clarity.
                </span>
              </h1>

              {/* Lead Copy with increased font size for readability */}
              <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
                Experience tactile financial control. AuraWealth transforms dull ledgers into an interactive 3D wealth cockpit—complete with instant AI categorization, live cashflow splines, and zero-lag ledger tracking right in your browser.
              </p>

              {/* Dual CTA Row */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 pt-2">
                <Button
                  onClick={() => setQuickAddOpen(true)}
                  size="lg"
                  className="rounded-2xl font-display font-bold text-base px-7 py-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 shadow-xl shadow-emerald-500/25 hover:shadow-indigo-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all text-white flex items-center gap-2.5"
                >
                  <Sparkles className="w-5 h-5" />
                  <span>Quick Add Transaction</span>
                </Button>
                
                <button
                  onClick={handleSimulateBonus}
                  className="inline-flex items-center gap-2.5 px-6 py-4 rounded-2xl font-display font-bold text-base text-slate-800 dark:text-white glass-panel hover:bg-white dark:hover:bg-slate-800/90 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-slate-300/80 dark:border-white/10 shadow-md"
                >
                  <Plus className="w-5 h-5 text-emerald-500 stroke-[2.5]" />
                  <span>Simulate Salary Drop</span>
                </button>

                <Link
                  href="/"
                  className="inline-flex items-center gap-2 px-6 py-4 rounded-2xl font-display font-bold text-base text-amber-700 dark:text-amber-300 glass-panel hover:bg-amber-500/10 hover:-translate-y-0.5 active:translate-y-0 transition-all border border-amber-400/40 shadow-md"
                >
                  <Play className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span>Cashflow Intro</span>
                </Link>
              </div>

              {/* Trust Micro-Metrics Row */}
              <div className="pt-4 grid grid-cols-3 gap-4 max-w-lg mx-auto lg:mx-0 border-t border-slate-200/80 dark:border-white/10">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
                    <Zap className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Zero-Lag Sync</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">60fps WebGL UI</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
                    <BrainCircuit className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">Smart AI Alerts</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Anomaly detection</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400 shrink-0">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">100% Private</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Local-first vault</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Three.js WebGL 3D Scene */}
            <div className="lg:col-span-5 relative">
              <ThreeHeroScene />
            </div>

          </div>
        </section>

        {/* ==================== PERIOD CONTROLS & SUBHEADER ==================== */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-white/10">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight">
                Financial Cockpit
              </h2>
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/30">
                Live Ledger
              </span>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium">
              Welcome back{user?.name ? `, ${user.name}` : ""}. Real-time cash flow & balance metrics.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Time Presets Bar */}
            <div className="flex items-center p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner">
              {timePresets.map((p) => (
                <button
                  key={p.value}
                  onClick={() => setPeriod(p.value)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-semibold rounded-xl transition-all ${
                    period === p.value
                      ? "bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/30 font-bold"
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
              className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl hover:border-emerald-500/40 transition-colors shadow-sm"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* First-time User Empty State with 3D Vault Illustration */}
        {!loading && data?.totalLifetimeTransactions === 0 && (
          <div className="text-center py-20 px-6 bg-white/80 dark:bg-slate-900/60 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-2xl">
            <Vault3DProp className="w-32 h-32 mx-auto mb-5 animate-float" />
            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              Welcome to AuraWealth 3D!
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-lg mx-auto mt-2 mb-8 leading-relaxed font-normal">
              Your institutional-grade personal ledger is ready. Record your first transaction or deposit opening balances to watch your financial metrics come to life.
            </p>
            <Button
              onClick={() => setQuickAddOpen(true)}
              variant="primary"
              size="lg"
              className="rounded-2xl font-display font-bold text-base px-8 py-4 shadow-xl shadow-emerald-500/30 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Record First Transaction
            </Button>
          </div>
        )}

        {/* Dashboard Content */}
        {data && (
          <>
            {/* 1. 3D Stat Cards Row */}
            <StatCards overview={data.overview} />

            {/* 2. Financial Insights Widget */}
            {data.insights && data.insights.length > 0 && (
              <FinancialInsightsWidget insights={data.insights} />
            )}

            {/* 3. Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <CashFlowChart data={data.monthlyTrend} />
              </div>
              <div>
                <CategoryExpenseChart categories={data.categoryBreakdown} />
              </div>
            </div>

            {/* 4. Bottom Row: Recent Transactions & Budget Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
        onSuccess={() => {
          triggerConfetti();
          fetchDashboard();
        }}
      />
    </AppShell>
  );
}

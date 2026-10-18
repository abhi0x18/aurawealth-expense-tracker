"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Analytics3DProp } from "@/components/ui/FinancialProps";
import { useCurrency } from "@/context/CurrencyContext";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { RefreshCw, TrendingUp, TrendingDown, Calendar, Sparkles } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

const PIE_COLORS = [
  "#10b981",
  "#3b82f6",
  "#8b5cf6",
  "#f59e0b",
  "#ec4899",
  "#06b6d4",
  "#f43f5e",
  "#6366f1",
  "#14b8a6",
  "#84cc16",
];

export default function ReportsPage() {
  const { formatMoney, currencySymbol } = useCurrency();
  const [reportData, setReportData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const now = new Date();
  const [startDate, setStartDate] = useState(format(startOfMonth(now), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(endOfMonth(now), "yyyy-MM-dd"));

  const fetchReport = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/reports?startDate=${startDate}&endDate=${endDate}`);
      const data = await res.json();
      setReportData(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const setRangePreset = (type: "this-month" | "last-month" | "last-90-days") => {
    const current = new Date();
    if (type === "this-month") {
      setStartDate(format(startOfMonth(current), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(current), "yyyy-MM-dd"));
    } else if (type === "last-month") {
      const prev = subMonths(current, 1);
      setStartDate(format(startOfMonth(prev), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(prev), "yyyy-MM-dd"));
    } else if (type === "last-90-days") {
      const prev3 = subMonths(current, 3);
      setStartDate(format(startOfMonth(prev3), "yyyy-MM-dd"));
      setEndDate(format(endOfMonth(current), "yyyy-MM-dd"));
    }
  };

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Financial Intelligence &amp; Analytics
              <span className="text-xs px-3 py-1 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 font-mono font-bold border border-purple-500/30">
                Insights Engine
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Visual breakdowns of category burn rates, payment channel velocity, and daily spending rhythms.
            </p>
          </div>

          {/* Date Range Selector Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center p-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-inner text-xs sm:text-sm">
              <button
                onClick={() => setRangePreset("this-month")}
                className="px-3.5 py-1.5 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                This Month
              </button>
              <button
                onClick={() => setRangePreset("last-month")}
                className="px-3.5 py-1.5 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                Last Month
              </button>
              <button
                onClick={() => setRangePreset("last-90-days")}
                className="px-3.5 py-1.5 font-bold rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                90 Days
              </button>
            </div>

            <div className="flex items-center gap-2 p-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl text-xs sm:text-sm font-medium">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none px-1 font-mono font-bold"
              />
              <span className="text-slate-400 font-medium">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-800 dark:text-slate-200 focus:outline-none px-1 font-mono font-bold"
              />
            </div>

            <button
              onClick={fetchReport}
              className="p-3 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/80 dark:border-white/10 rounded-2xl shadow-sm hover:border-emerald-500/40 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-500" : ""}`} />
            </button>
          </div>
        </div>

        {/* 3D Analytics Banner with Analytics3DProp */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-purple-950 via-slate-950 to-indigo-950 border border-purple-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-extrabold text-purple-400">
                <Sparkles className="w-4 h-4" />
                Comprehensive Financial Velocity
              </div>
              <h2 className="text-4xl sm:text-5xl font-mono font-black text-white tracking-tight drop-shadow-lg">
                Savings Rate: {reportData?.summary?.savingsRate || 0}%
              </h2>
              <p className="text-sm text-purple-200/90 font-medium">
                Retaining {reportData?.summary?.savingsRate || 0}% of net period income after accounting for all category expenses.
              </p>
            </div>

            {/* 3D Analytics Prop */}
            <div className="flex items-center justify-center sm:justify-end">
              <Analytics3DProp className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>

        {reportData && (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="tilt-card glass-panel rounded-3xl p-6 border border-emerald-500/20 shadow-xl">
                <div className="tilt-glare" />
                <div className="tilt-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Income
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-500 dark:text-emerald-400 mt-2.5 tracking-tight">
                    {formatMoney(reportData.summary.totalIncomePaise)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Earned in this window</p>
                </div>
              </div>

              <div className="tilt-card glass-panel rounded-3xl p-6 border border-rose-500/20 shadow-xl">
                <div className="tilt-glare" />
                <div className="tilt-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Total Expenses
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-rose-500 mt-2.5 tracking-tight">
                    {formatMoney(reportData.summary.totalExpensePaise)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Spent across categories</p>
                </div>
              </div>

              <div className="tilt-card glass-panel rounded-3xl p-6 border border-blue-500/20 shadow-xl">
                <div className="tilt-glare" />
                <div className="tilt-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Avg Daily Spend
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-slate-900 dark:text-white mt-2.5 tracking-tight">
                    {formatMoney(Math.round(reportData.summary.averageDailyExpenseRupees * 100))}
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">
                    Across {reportData.summary.daysInPeriod} active day{reportData.summary.daysInPeriod > 1 ? "s" : ""}
                  </p>
                </div>
              </div>

              <div className="tilt-card glass-panel rounded-3xl p-6 border border-emerald-500/20 shadow-xl">
                <div className="tilt-glare" />
                <div className="tilt-inner">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Period Savings Rate
                  </span>
                  <div className="text-3xl sm:text-4xl font-mono font-black text-emerald-500 dark:text-emerald-400 mt-2.5 tracking-tight">
                    {reportData.summary.savingsRate}%
                  </div>
                  <p className="text-xs text-slate-400 mt-1.5 font-medium">Surplus retained in capital</p>
                </div>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Category Breakdown Bar Chart */}
              <Card className="flex flex-col p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                      Spending by Category
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Ranked by total outflow</p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.categoryChart}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.1} />
                      <XAxis type="number" tickFormatter={(v) => `${currencySymbol}${v}`} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 12, fill: "#94a3b8" }}
                        width={100}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                          backdropFilter: "blur(12px)",
                          fontSize: "13px",
                        }}
                        formatter={(val: any) => [`${currencySymbol}${val}`, "Expense"]}
                      />
                      <Bar dataKey="amount" fill="#10b981" radius={[0, 8, 8, 0]} maxBarSize={24} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Payment Methods Distribution */}
              <Card className="flex flex-col p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                      Payment Channels
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">UPI, Cards, Cash, Net Banking</p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(15, 23, 42, 0.9)",
                          borderRadius: "16px",
                          border: "1px solid rgba(255, 255, 255, 0.1)",
                          backdropFilter: "blur(12px)",
                          fontSize: "13px",
                        }}
                        formatter={(val: any) => [`${currencySymbol}${val}`, "Volume"]}
                      />
                      <Pie
                        data={reportData.paymentMethodChart}
                        dataKey="amount"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={95}
                        paddingAngle={5}
                      >
                        {reportData.paymentMethodChart.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                            stroke="rgba(0,0,0,0.2)"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 12, paddingTop: 16 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Daily Expense Trend Line Chart */}
            <Card className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                    Daily Spending Velocity
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Day-by-day continuous ledger curve</p>
                </div>
              </div>

              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData.dailyTrend}
                    margin={{ top: 10, right: 20, left: -10, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.1} />
                    <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(v) => `${currencySymbol}${v}`} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "rgba(15, 23, 42, 0.9)",
                        borderRadius: "16px",
                        border: "1px solid rgba(255, 255, 255, 0.1)",
                        backdropFilter: "blur(12px)",
                        fontSize: "13px",
                      }}
                      formatter={(v: any) => [`${currencySymbol}${v}`, "Disbursed"]}
                    />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={3.5}
                      dot={{ r: 4, fill: "#10b981", strokeWidth: 2, stroke: "#047857" }}
                      activeDot={{ r: 7, fill: "#34d399" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Merchants Grid */}
            {reportData.topMerchants && reportData.topMerchants.length > 0 && (
              <Card className="p-7 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                  <div>
                    <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
                      Top Outflow Merchants &amp; Payees
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Entities receiving the largest cumulative transfers</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {reportData.topMerchants.map((m: any, i: number) => (
                    <div
                      key={m.merchant}
                      className="p-4 bg-slate-50/80 dark:bg-slate-950/60 rounded-2xl border border-slate-200/80 dark:border-white/5 flex items-center justify-between hover:border-emerald-500/30 transition-all shadow-xs"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-mono font-black flex items-center justify-center border border-emerald-500/20">
                          {i + 1}
                        </span>
                        <span className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate max-w-[130px]">
                          {m.merchant}
                        </span>
                      </div>
                      <span className="text-sm font-mono font-extrabold text-rose-500">
                        {formatMoney(Math.round(m.amount * 100))}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}

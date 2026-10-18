"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";
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
import { RefreshCw } from "lucide-react";
import { startOfMonth, endOfMonth, subMonths, format } from "date-fns";

const PIE_COLORS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#ef4444",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#14b8a6",
];

export default function ReportsPage() {
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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Financial Reports & Analytics
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Deep dive into category distribution, daily burn rates, and savings trends
            </p>
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xs text-xs">
              <button
                onClick={() => setRangePreset("this-month")}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                This Month
              </button>
              <button
                onClick={() => setRangePreset("last-month")}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Last Month
              </button>
              <button
                onClick={() => setRangePreset("last-90-days")}
                className="px-2.5 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                90 Days
              </button>
            </div>

            <div className="flex items-center gap-1.5 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none px-1"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="bg-transparent text-slate-700 dark:text-slate-300 focus:outline-none px-1"
              />
            </div>

            <button
              onClick={fetchReport}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-600" : ""}`} />
            </button>
          </div>
        </div>

        {reportData && (
          <>
            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Income
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {formatCurrency(reportData.summary.totalIncomePaise)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Earned in this window</p>
              </Card>

              <Card>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Total Expenses
                </span>
                <div className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
                  {formatCurrency(reportData.summary.totalExpensePaise)}
                </div>
                <p className="text-xs text-slate-400 mt-1">Spent across categories</p>
              </Card>

              <Card>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Average Daily Spend
                </span>
                <div className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
                  ₹{reportData.summary.averageDailyExpenseRupees}
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  Over {reportData.summary.daysInPeriod} day{reportData.summary.daysInPeriod > 1 ? "s" : ""}
                </p>
              </Card>

              <Card>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Period Savings Rate
                </span>
                <div className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
                  {reportData.summary.savingsRate}%
                </div>
                <p className="text-xs text-slate-400 mt-1">Income retained</p>
              </Card>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Category Breakdown Bar Chart */}
              <Card className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Spending by Category
                </h3>
                <p className="text-xs text-slate-400 mb-4">Total amount per category</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={reportData.categoryChart}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 40, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
                      <XAxis type="number" tickFormatter={(v) => `₹${v}`} />
                      <YAxis
                        type="category"
                        dataKey="name"
                        tick={{ fontSize: 11 }}
                        width={90}
                      />
                      <Tooltip
                        formatter={(val: any) => [`₹${val}`, "Expense"]}
                      />
                      <Bar dataKey="amount" fill="#3b82f6" radius={[0, 4, 4, 0]} maxBarSize={20} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Payment Methods Share */}
              <Card className="flex flex-col">
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Payment Method Distribution
                </h3>
                <p className="text-xs text-slate-400 mb-4">UPI, Cards, Cash, Net Banking</p>

                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Tooltip formatter={(val: any) => [`₹${val}`, "Amount"]} />
                      <Pie
                        data={reportData.paymentMethodChart}
                        dataKey="amount"
                        nameKey="method"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={4}
                      >
                        {reportData.paymentMethodChart.map((entry: any, index: number) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="bottom"
                        iconType="circle"
                        wrapperStyle={{ fontSize: 11 }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </div>

            {/* Daily Expense Trend Line Chart */}
            <Card>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                Daily Spending Rhythm
              </h3>
              <p className="text-xs text-slate-400 mb-4">Day-by-day expense totals</p>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={reportData.dailyTrend}
                    margin={{ top: 10, right: 20, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
                    <XAxis dataKey="date" tickLine={false} tick={{ fontSize: 11 }} />
                    <YAxis tickLine={false} tick={{ fontSize: 11 }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(v: any) => [`₹${v}`, "Spent"]} />
                    <Line
                      type="monotone"
                      dataKey="amount"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={{ r: 3, fill: "#10b981" }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Merchants Table */}
            {reportData.topMerchants && reportData.topMerchants.length > 0 && (
              <Card>
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">
                  Top Payees & Merchants
                </h3>
                <p className="text-xs text-slate-400 mb-4">Vendors where you spend the most</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {reportData.topMerchants.map((m: any, i: number) => (
                    <div
                      key={m.merchant}
                      className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200/60 dark:border-slate-800 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-[10px] font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate max-w-[110px]">
                          {m.merchant}
                        </span>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400">
                        ₹{m.amount.toFixed(2)}
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

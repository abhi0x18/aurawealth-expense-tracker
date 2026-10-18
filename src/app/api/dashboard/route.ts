import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAccountsWithBalances } from "@/lib/account-balance";
import { generateFinancialInsights } from "@/lib/insights";
import { processDueRecurringRules } from "@/lib/recurring";
import {
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  startOfYear,
  endOfYear,
  format,
} from "date-fns";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Process any due recurring transactions first
  await processDueRecurringRules(user.id);

  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") || "this-month";
  const customStart = searchParams.get("startDate");
  const customEnd = searchParams.get("endDate");

  const now = new Date();
  let startDate: Date;
  let endDate: Date;
  let prevStartDate: Date;
  let prevEndDate: Date;
  let periodLabel = "This Month";

  if (customStart && customEnd) {
    startDate = new Date(customStart);
    endDate = new Date(customEnd);
    endDate.setHours(23, 59, 59, 999);
    const duration = endDate.getTime() - startDate.getTime();
    prevEndDate = new Date(startDate.getTime() - 1);
    prevStartDate = new Date(prevEndDate.getTime() - duration);
    periodLabel = "Custom Range";
  } else {
    switch (period) {
      case "last-month": {
        const prev = subMonths(now, 1);
        startDate = startOfMonth(prev);
        endDate = endOfMonth(prev);
        const twoMonthsAgo = subMonths(now, 2);
        prevStartDate = startOfMonth(twoMonthsAgo);
        prevEndDate = endOfMonth(twoMonthsAgo);
        periodLabel = "Last Month";
        break;
      }
      case "last-30-days":
        startDate = subDays(now, 30);
        endDate = now;
        prevStartDate = subDays(now, 60);
        prevEndDate = subDays(now, 31);
        periodLabel = "Last 30 Days";
        break;
      case "this-year":
        startDate = startOfYear(now);
        endDate = endOfYear(now);
        const prevYear = new Date(now.getFullYear() - 1, 0, 1);
        prevStartDate = startOfYear(prevYear);
        prevEndDate = endOfYear(prevYear);
        periodLabel = "This Year";
        break;
      case "this-month":
      default:
        startDate = startOfMonth(now);
        endDate = endOfMonth(now);
        const prevMonth = subMonths(now, 1);
        prevStartDate = startOfMonth(prevMonth);
        prevEndDate = endOfMonth(prevMonth);
        periodLabel = "This Month";
        break;
    }
  }

  // 1. Current Period Transactions
  const currentPeriodTxs = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: startDate, lte: endDate },
    },
    include: {
      category: true,
      account: true,
    },
  });

  // 2. Previous Period Transactions for Comparison
  const prevPeriodTxs = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: prevStartDate, lte: prevEndDate },
    },
    select: {
      type: true,
      amountPaise: true,
    },
  });

  // Calculate totals (transfers strictly excluded from income & expense totals)
  let totalIncomePaise = BigInt(0);
  let totalExpensePaise = BigInt(0);
  const categorySpendingMap = new Map<
    string,
    { name: string; color: string; amountPaise: bigint; count: number }
  >();

  for (const t of currentPeriodTxs) {
    if (t.type === "INCOME") {
      totalIncomePaise += t.amountPaise;
    } else if (t.type === "EXPENSE") {
      totalExpensePaise += t.amountPaise;
      const catName = t.category?.name || "Uncategorized";
      const catColor = t.category?.color || "#64748b";
      const existing = categorySpendingMap.get(catName) || {
        name: catName,
        color: catColor,
        amountPaise: BigInt(0),
        count: 0,
      };
      existing.amountPaise += t.amountPaise;
      existing.count += 1;
      categorySpendingMap.set(catName, existing);
    }
  }

  let prevIncomePaise = BigInt(0);
  let prevExpensePaise = BigInt(0);
  for (const t of prevPeriodTxs) {
    if (t.type === "INCOME") prevIncomePaise += t.amountPaise;
    if (t.type === "EXPENSE") prevExpensePaise += t.amountPaise;
  }

  const netCashFlowPaise = totalIncomePaise - totalExpensePaise;
  const prevNetCashFlowPaise = prevIncomePaise - prevExpensePaise;

  // Percentage changes vs previous period
  const calculateChange = (cur: bigint, prev: bigint) => {
    if (prev === BigInt(0)) return cur > BigInt(0) ? 100 : 0;
    return Math.round(((Number(cur) - Number(prev)) / Number(prev)) * 100);
  };

  const incomeChangePct = calculateChange(totalIncomePaise, prevIncomePaise);
  const expenseChangePct = calculateChange(totalExpensePaise, prevExpensePaise);

  // Category breakdown formatted for Recharts
  const categoryBreakdown = Array.from(categorySpendingMap.values())
    .map((c) => ({
      name: c.name,
      amount: Number(c.amountPaise) / 100,
      amountPaise: c.amountPaise,
      color: c.color,
      count: c.count,
    }))
    .sort((a, b) => b.amount - a.amount);

  // 3. Accounts & Total Net Worth / Balance
  const accounts = await getAccountsWithBalances(user.id);
  const activeAccounts = accounts.filter((a) => !a.isArchived);
  let totalBalancePaise = BigInt(0);
  for (const a of activeAccounts) {
    totalBalancePaise += a.currentBalancePaise;
  }

  // 4. Monthly Cashflow Trend (Past 6 Months)
  const sixMonthsAgo = startOfMonth(subMonths(now, 5));
  const past6MonthsTxs = await db.transaction.findMany({
    where: {
      userId: user.id,
      date: { gte: sixMonthsAgo, lte: now },
    },
    select: {
      date: true,
      type: true,
      amountPaise: true,
    },
  });

  const monthTrendMap = new Map<string, { month: string; income: number; expense: number }>();
  for (let i = 5; i >= 0; i--) {
    const m = subMonths(now, i);
    const key = format(m, "yyyy-MM");
    const displayMonth = format(m, "MMM yyyy");
    monthTrendMap.set(key, { month: displayMonth, income: 0, expense: 0 });
  }

  for (const t of past6MonthsTxs) {
    const key = format(t.date, "yyyy-MM");
    const item = monthTrendMap.get(key);
    if (item) {
      if (t.type === "INCOME") item.income += Number(t.amountPaise) / 100;
      if (t.type === "EXPENSE") item.expense += Number(t.amountPaise) / 100;
    }
  }

  const monthlyTrend = Array.from(monthTrendMap.values());

  // 5. Recent Transactions
  const recentTransactions = await db.transaction.findMany({
    where: { userId: user.id },
    include: {
      account: { select: { name: true, color: true } },
      toAccount: { select: { name: true, color: true } },
      category: { select: { name: true, color: true, icon: true } },
    },
    orderBy: { date: "desc" },
    take: 6,
  });

  // 6. Savings Goals Summary
  const savingsGoals = await db.savingsGoal.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  // 7. Budget Status for Current Month
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budgets = await db.budget.findMany({
    where: { userId: user.id, monthYear: currentMonthKey },
    include: { category: true },
  });

  const budgetSummary = budgets.map((b) => {
    let spent = BigInt(0);
    if (b.categoryId) {
      const match = currentPeriodTxs.filter((t) => t.categoryId === b.categoryId && t.type === "EXPENSE");
      spent = match.reduce((sum, t) => sum + t.amountPaise, BigInt(0));
    } else {
      spent = totalExpensePaise;
    }
    const percentage = b.amountPaise > BigInt(0) ? Math.round((Number(spent) / Number(b.amountPaise)) * 100) : 0;
    return {
      id: b.id,
      name: b.category?.name || "Overall Monthly Budget",
      budgetPaise: b.amountPaise,
      spentPaise: spent,
      percentage,
      isOverBudget: spent > b.amountPaise,
      isWarning: percentage >= b.alertThreshold && spent <= b.amountPaise,
    };
  });

  // 8. Rule-based Financial Insights
  const insights = await generateFinancialInsights(user.id);

  // Check total lifetime transactions to detect empty state
  const totalLifetimeTransactions = await db.transaction.count({
    where: { userId: user.id },
  });

  return NextResponse.json({
    periodLabel,
    totalLifetimeTransactions,
    overview: {
      totalIncomePaise,
      totalExpensePaise,
      netCashFlowPaise,
      totalBalancePaise,
      incomeChangePct,
      expenseChangePct,
    },
    categoryBreakdown,
    monthlyTrend,
    recentTransactions,
    accounts: activeAccounts,
    savingsGoals,
    budgetSummary,
    insights,
  });
}

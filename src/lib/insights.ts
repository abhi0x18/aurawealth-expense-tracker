import { db } from "@/lib/db";
import { startOfMonth, endOfMonth, subMonths } from "date-fns";
import { formatCurrency } from "./money";

export interface FinancialInsight {
  id: string;
  type: "warning" | "success" | "info" | "alert";
  title: string;
  message: string;
  metric?: string;
}

export async function generateFinancialInsights(userId: string): Promise<FinancialInsight[]> {
  const insights: FinancialInsight[] = [];
  const now = new Date();

  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);

  const prevMonthDate = subMonths(now, 1);
  const prevMonthStart = startOfMonth(prevMonthDate);
  const prevMonthEnd = endOfMonth(prevMonthDate);

  // 1. Current month income and expenses
  const currentTxs = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: currentMonthStart, lte: currentMonthEnd },
    },
    include: { category: true },
  });

  const prevTxs = await db.transaction.findMany({
    where: {
      userId,
      date: { gte: prevMonthStart, lte: prevMonthEnd },
    },
    include: { category: true },
  });

  let currentIncome = BigInt(0);
  let currentExpense = BigInt(0);
  const currentCategoryExpense = new Map<string, { name: string; amount: bigint }>();

  for (const t of currentTxs) {
    if (t.type === "INCOME") currentIncome += t.amountPaise;
    if (t.type === "EXPENSE") {
      currentExpense += t.amountPaise;
      const catName = t.category?.name || "Uncategorized";
      const existing = currentCategoryExpense.get(catName) || { name: catName, amount: BigInt(0) };
      existing.amount += t.amountPaise;
      currentCategoryExpense.set(catName, existing);
    }
  }

  const prevCategoryExpense = new Map<string, bigint>();
  for (const t of prevTxs) {
    if (t.type === "EXPENSE") {
      const catName = t.category?.name || "Uncategorized";
      prevCategoryExpense.set(catName, (prevCategoryExpense.get(catName) || BigInt(0)) + t.amountPaise);
    }
  }

  // Insight 1: Expenses exceed Income check
  if (currentExpense > currentIncome && currentExpense > BigInt(0)) {
    const deficit = currentExpense - currentIncome;
    insights.push({
      id: "deficit-alert",
      type: "alert",
      title: "Expenses Exceed Income",
      message: `Your expenses exceed your income by ${formatCurrency(deficit)} this month. Keep an eye on non-essential purchases.`,
      metric: `-${formatCurrency(deficit)}`,
    });
  } else if (currentIncome > BigInt(0) && currentExpense > BigInt(0)) {
    const savings = currentIncome - currentExpense;
    const savingsRate = Math.round((Number(savings) / Number(currentIncome)) * 100);
    if (savingsRate >= 20) {
      insights.push({
        id: "healthy-savings",
        type: "success",
        title: "Healthy Savings Rate",
        message: `You've preserved ${savingsRate}% of your income this month (${formatCurrency(savings)}). Great financial discipline!`,
        metric: `${savingsRate}% savings rate`,
      });
    }
  }

  // Insight 2: Top spending category
  let topCategory: { name: string; amount: bigint } | null = null;
  for (const cat of Array.from(currentCategoryExpense.values())) {
    if (!topCategory || cat.amount > topCategory.amount) {
      topCategory = cat;
    }
  }

  if (topCategory && currentExpense > BigInt(0)) {
    const catPercent = Math.round((Number(topCategory.amount) / Number(currentExpense)) * 100);
    insights.push({
      id: "top-spending-cat",
      type: "info",
      title: "Top Spending Area",
      message: `${topCategory.name} is your largest expense this month at ${formatCurrency(topCategory.amount)} (${catPercent}% of total expenses).`,
      metric: `${catPercent}% of spend`,
    });
  }

  // Insight 3: Category spending surge vs last month
  for (const [catName, cur] of Array.from(currentCategoryExpense.entries())) {
    const prevAmount = prevCategoryExpense.get(catName) || BigInt(0);
    if (prevAmount > BigInt(0) && cur.amount > prevAmount) {
      const diff = cur.amount - prevAmount;
      const pctIncrease = Math.round((Number(diff) / Number(prevAmount)) * 100);
      if (pctIncrease >= 30 && diff > BigInt(100000)) { // > ₹1,000 increase and >= 30%
        insights.push({
          id: `surge-${catName}`,
          type: "warning",
          title: `Spending Surge: ${catName}`,
          message: `Spending on ${catName} increased by ${pctIncrease}% (${formatCurrency(diff)}) compared to last month.`,
          metric: `+${pctIncrease}%`,
        });
        break; // Show only the most prominent surge
      }
    }
  }

  // Insight 4: Active Budgets Utilization
  const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const budgets = await db.budget.findMany({
    where: { userId, monthYear: currentMonthKey },
    include: { category: true },
  });

  for (const b of budgets) {
    let spent = BigInt(0);
    if (b.categoryId) {
      spent = currentCategoryExpense.get(b.category?.name || "")?.amount || BigInt(0);
    } else {
      spent = currentExpense;
    }

    if (b.amountPaise > BigInt(0)) {
      const pct = Math.round((Number(spent) / Number(b.amountPaise)) * 100);
      const budgetName = b.category ? b.category.name : "Total Overall Budget";
      if (pct >= 100) {
        insights.push({
          id: `budget-exceeded-${b.id}`,
          type: "alert",
          title: `Over Budget: ${budgetName}`,
          message: `You've exceeded the ${budgetName} budget (${formatCurrency(spent)} of ${formatCurrency(b.amountPaise)}).`,
          metric: `${pct}% used`,
        });
      } else if (pct >= b.alertThreshold) {
        insights.push({
          id: `budget-warning-${b.id}`,
          type: "warning",
          title: `Budget Alert: ${budgetName}`,
          message: `${budgetName} is at ${pct}% of its limit (${formatCurrency(spent)} / ${formatCurrency(b.amountPaise)}).`,
          metric: `${pct}% used`,
        });
      }
    }
  }

  // Insight 5: Recurring bills due soon
  const upcomingBills = await db.recurringRule.findMany({
    where: {
      userId,
      isActive: true,
      nextDueDate: {
        gte: now,
        lte: new Date(now.getTime() + 7 * 24 * 3600 * 1000), // Next 7 days
      },
    },
  });

  if (upcomingBills.length > 0) {
    const totalDue = upcomingBills.reduce((acc, r) => acc + r.amountPaise, BigInt(0));
    insights.push({
      id: "upcoming-bills",
      type: "info",
      title: "Upcoming Scheduled Bills",
      message: `You have ${upcomingBills.length} recurring payment${upcomingBills.length > 1 ? "s" : ""} totaling ${formatCurrency(totalDue)} scheduled in the next 7 days.`,
      metric: formatCurrency(totalDue),
    });
  }

  return insights;
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, differenceInDays } from "date-fns";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const startDateStr = searchParams.get("startDate");
  const endDateStr = searchParams.get("endDate");
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");

  const now = new Date();
  const startDate = startDateStr ? new Date(startDateStr) : startOfMonth(now);
  const endDate = endDateStr ? new Date(endDateStr) : endOfMonth(now);
  endDate.setHours(23, 59, 59, 999);

  const whereClause: any = {
    userId: user.id,
    date: { gte: startDate, lte: endDate },
  };

  if (accountId) {
    whereClause.OR = [{ accountId }, { toAccountId: accountId }];
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
    include: {
      account: true,
      category: true,
    },
    orderBy: { date: "asc" },
  });

  let totalIncomePaise = BigInt(0);
  let totalExpensePaise = BigInt(0);
  let totalTransferPaise = BigInt(0);

  const categoryMap = new Map<string, { name: string; color: string; amount: number; count: number }>();
  const paymentMethodMap = new Map<string, number>();
  const merchantMap = new Map<string, number>();
  const dailySpendMap = new Map<string, number>();

  for (const t of transactions) {
    const amountRupees = Number(t.amountPaise) / 100;
    const dayKey = format(t.date, "yyyy-MM-dd");

    if (t.type === "INCOME") {
      totalIncomePaise += t.amountPaise;
    } else if (t.type === "EXPENSE") {
      totalExpensePaise += t.amountPaise;

      // Category breakdown
      const catName = t.category?.name || "Uncategorized";
      const catColor = t.category?.color || "#64748b";
      const catItem = categoryMap.get(catName) || { name: catName, color: catColor, amount: 0, count: 0 };
      catItem.amount += amountRupees;
      catItem.count += 1;
      categoryMap.set(catName, catItem);

      // Payment method breakdown
      const method = t.paymentMethod || "OTHER";
      paymentMethodMap.set(method, (paymentMethodMap.get(method) || 0) + amountRupees);

      // Merchant breakdown
      if (t.merchant) {
        merchantMap.set(t.merchant, (merchantMap.get(t.merchant) || 0) + amountRupees);
      }

      // Daily spend
      dailySpendMap.set(dayKey, (dailySpendMap.get(dayKey) || 0) + amountRupees);
    } else if (t.type === "TRANSFER") {
      totalTransferPaise += t.amountPaise;
    }
  }

  // Calculate daily average
  const dayCount = Math.max(1, differenceInDays(endDate, startDate) + 1);
  const averageDailyExpenseRupees = Math.round((Number(totalExpensePaise) / 100 / dayCount) * 100) / 100;

  // Savings rate
  const netSavingsPaise = totalIncomePaise - totalExpensePaise;
  const savingsRate =
    totalIncomePaise > BigInt(0)
      ? Math.round((Number(netSavingsPaise) / Number(totalIncomePaise)) * 100)
      : 0;

  // Formatted data arrays for charts
  const categoryChart = Array.from(categoryMap.values()).sort((a, b) => b.amount - a.amount);
  const paymentMethodChart = Array.from(paymentMethodMap.entries()).map(([method, amount]) => ({
    method,
    amount,
  }));
  const topMerchants = Array.from(merchantMap.entries())
    .map(([merchant, amount]) => ({ merchant, amount }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 8);

  const dailyTrend = Array.from(dailySpendMap.entries())
    .map(([date, amount]) => ({
      date: format(new Date(date), "dd MMM"),
      amount,
    }));

  return NextResponse.json({
    summary: {
      totalIncomePaise,
      totalExpensePaise,
      netSavingsPaise,
      totalTransferPaise,
      averageDailyExpenseRupees,
      savingsRate,
      transactionCount: transactions.length,
      daysInPeriod: dayCount,
    },
    categoryChart,
    paymentMethodChart,
    topMerchants,
    dailyTrend,
  });
}

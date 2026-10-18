import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateBudgetSchema } from "@/lib/validations/budget";
import { rupeesToPaise } from "@/lib/money";
import { parseISO, startOfMonth, endOfMonth } from "date-fns";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const now = new Date();
  const defaultMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  const monthYear = searchParams.get("monthYear") || defaultMonth;

  // Month date range for expense calculations
  const [yearStr, monthStr] = monthYear.split("-");
  const monthDate = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10) - 1, 1);
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);

  // Fetch budgets for this month
  const budgets = await db.budget.findMany({
    where: { userId: user.id, monthYear },
    include: { category: true },
    orderBy: { createdAt: "asc" },
  });

  // Fetch expense transactions in this month
  const monthlyExpenses = await db.transaction.findMany({
    where: {
      userId: user.id,
      type: "EXPENSE",
      isExcludedFromBudget: false,
      date: { gte: start, lte: end },
    },
    select: {
      categoryId: true,
      amountPaise: true,
    },
  });

  // Calculate total monthly expense
  let totalMonthlyExpensePaise = 0n;
  const categoryExpenseMap = new Map<string, bigint>();

  for (const exp of monthlyExpenses) {
    totalMonthlyExpensePaise += exp.amountPaise;
    if (exp.categoryId) {
      const prev = categoryExpenseMap.get(exp.categoryId) || 0n;
      categoryExpenseMap.set(exp.categoryId, prev + exp.amountPaise);
    }
  }

  // Format budget items with live spending, remaining, and percentage
  const budgetItems = budgets.map((b) => {
    const spentPaise = b.categoryId
      ? categoryExpenseMap.get(b.categoryId) || 0n
      : totalMonthlyExpensePaise;

    const remainingPaise = b.amountPaise - spentPaise;
    const percentage =
      b.amountPaise > 0n
        ? Math.round((Number(spentPaise) / Number(b.amountPaise)) * 100)
        : 0;

    const isOverBudget = spentPaise > b.amountPaise;
    const isWarning = percentage >= b.alertThreshold && !isOverBudget;

    return {
      id: b.id,
      monthYear: b.monthYear,
      categoryId: b.categoryId,
      categoryName: b.category?.name || "Overall Monthly Budget",
      categoryColor: b.category?.color || "#10b981",
      categoryIcon: b.category?.icon || "PiggyBank",
      budgetPaise: b.amountPaise,
      spentPaise,
      remainingPaise,
      percentage,
      alertThreshold: b.alertThreshold,
      isOverBudget,
      isWarning,
    };
  });

  return NextResponse.json({
    monthYear,
    budgets: budgetItems,
    totalMonthlyExpensePaise,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateBudgetSchema.parse(body);

    const budget = await db.budget.upsert({
      where: {
        userId_categoryId_monthYear: {
          userId: user.id,
          categoryId: validated.categoryId || "",
          monthYear: validated.monthYear,
        },
      },
      update: {
        amountPaise: rupeesToPaise(validated.amount),
        alertThreshold: validated.alertThreshold,
      },
      create: {
        userId: user.id,
        categoryId: validated.categoryId || null,
        monthYear: validated.monthYear,
        amountPaise: rupeesToPaise(validated.amount),
        alertThreshold: validated.alertThreshold,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, budget }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to set budget" }, { status: 500 });
  }
}

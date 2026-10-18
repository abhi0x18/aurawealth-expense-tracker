import { db } from "@/lib/db";
import { APP_CONFIG } from "@/config/app";

export interface BackupData {
  version: string;
  exportedAt: string;
  app: string;
  user: {
    name: string;
    email: string;
    currency: string;
    currencySymbol: string;
    timezone: string;
    budgetAlertThreshold: number;
  };
  accounts: {
    name: string;
    type: string;
    openingBalancePaise: string;
    isArchived: boolean;
    color?: string | null;
    notes?: string | null;
  }[];
  categories: {
    name: string;
    type: string;
    icon?: string | null;
    color?: string | null;
    isDefault: boolean;
    isArchived: boolean;
  }[];
  transactions: {
    type: string;
    amountPaise: string;
    date: string;
    accountName: string;
    toAccountName?: string | null;
    categoryName?: string | null;
    merchant?: string | null;
    paymentMethod?: string | null;
    notes?: string | null;
    tags?: string | null;
    isExcludedFromBudget: boolean;
  }[];
  budgets: {
    categoryName?: string | null;
    monthYear: string;
    amountPaise: string;
    alertThreshold: number;
  }[];
  recurringRules: {
    type: string;
    amountPaise: string;
    frequency: string;
    startDate: string;
    endDate?: string | null;
    accountName: string;
    categoryName?: string | null;
    merchant?: string | null;
    description?: string | null;
    isActive: boolean;
  }[];
  savingsGoals: {
    name: string;
    targetAmountPaise: string;
    currentAmountPaise: string;
    targetDate?: string | null;
    description?: string | null;
    color?: string | null;
    status: string;
    contributions: {
      amountPaise: string;
      date: string;
      notes?: string | null;
      accountName?: string | null;
    }[];
  }[];
}

export async function createFullBackup(userId: string): Promise<BackupData> {
  const user = await db.user.findUniqueOrThrow({ where: { id: userId } });
  const accounts = await db.account.findMany({ where: { userId } });
  const categories = await db.category.findMany({ where: { userId } });
  const transactions = await db.transaction.findMany({
    where: { userId },
    include: { account: true, toAccount: true, category: true },
  });
  const budgets = await db.budget.findMany({
    where: { userId },
    include: { category: true },
  });
  const recurringRules = await db.recurringRule.findMany({
    where: { userId },
    include: { account: true, category: true },
  });
  const savingsGoals = await db.savingsGoal.findMany({
    where: { userId },
    include: {
      contributions: {
        include: { account: true },
      },
    },
  });

  return {
    version: "1.0.0",
    exportedAt: new Date().toISOString(),
    app: APP_CONFIG.name,
    user: {
      name: user.name,
      email: user.email,
      currency: user.currency,
      currencySymbol: user.currencySymbol,
      timezone: user.timezone,
      budgetAlertThreshold: user.budgetAlertThreshold,
    },
    accounts: accounts.map((a) => ({
      name: a.name,
      type: a.type,
      openingBalancePaise: a.openingBalancePaise.toString(),
      isArchived: a.isArchived,
      color: a.color,
      notes: a.notes,
    })),
    categories: categories.map((c) => ({
      name: c.name,
      type: c.type,
      icon: c.icon,
      color: c.color,
      isDefault: c.isDefault,
      isArchived: c.isArchived,
    })),
    transactions: transactions.map((t) => ({
      type: t.type,
      amountPaise: t.amountPaise.toString(),
      date: t.date.toISOString(),
      accountName: t.account.name,
      toAccountName: t.toAccount ? t.toAccount.name : null,
      categoryName: t.category ? t.category.name : null,
      merchant: t.merchant,
      paymentMethod: t.paymentMethod,
      notes: t.notes,
      tags: t.tags,
      isExcludedFromBudget: t.isExcludedFromBudget,
    })),
    budgets: budgets.map((b) => ({
      categoryName: b.category ? b.category.name : null,
      monthYear: b.monthYear,
      amountPaise: b.amountPaise.toString(),
      alertThreshold: b.alertThreshold,
    })),
    recurringRules: recurringRules.map((r) => ({
      type: r.type,
      amountPaise: r.amountPaise.toString(),
      frequency: r.frequency,
      startDate: r.startDate.toISOString(),
      endDate: r.endDate ? r.endDate.toISOString() : null,
      accountName: r.account.name,
      categoryName: r.category ? r.category.name : null,
      merchant: r.merchant,
      description: r.description,
      isActive: r.isActive,
    })),
    savingsGoals: savingsGoals.map((g) => ({
      name: g.name,
      targetAmountPaise: g.targetAmountPaise.toString(),
      currentAmountPaise: g.currentAmountPaise.toString(),
      targetDate: g.targetDate ? g.targetDate.toISOString() : null,
      description: g.description,
      color: g.color,
      status: g.status,
      contributions: g.contributions.map((c) => ({
        amountPaise: c.amountPaise.toString(),
        date: c.date.toISOString(),
        notes: c.notes,
        accountName: c.account ? c.account.name : null,
      })),
    })),
  };
}

export async function restoreFullBackup(
  userId: string,
  backup: BackupData,
  mode: "REPLACE" | "MERGE" = "REPLACE"
) {
  if (!backup || !backup.accounts || !backup.transactions) {
    throw new Error("Invalid backup structure. Missing required financial entities.");
  }

  // Execute restore inside transaction to ensure atomic execution
  return await db.$transaction(async (tx) => {
    if (mode === "REPLACE") {
      // Clear dependent child entities first
      await tx.savingsContribution.deleteMany({ where: { goal: { userId } } });
      await tx.savingsGoal.deleteMany({ where: { userId } });
      await tx.transaction.deleteMany({ where: { userId } });
      await tx.recurringRule.deleteMany({ where: { userId } });
      await tx.budget.deleteMany({ where: { userId } });
      await tx.category.deleteMany({ where: { userId } });
      await tx.account.deleteMany({ where: { userId } });
    }

    // Restore Accounts
    const accountMap = new Map<string, string>();
    for (const a of backup.accounts) {
      let acc = await tx.account.findFirst({
        where: { userId, name: a.name },
      });
      if (!acc) {
        acc = await tx.account.create({
          data: {
            userId,
            name: a.name,
            type: a.type,
            openingBalancePaise: BigInt(a.openingBalancePaise),
            isArchived: a.isArchived ?? false,
            color: a.color,
            notes: a.notes,
          },
        });
      }
      accountMap.set(a.name, acc.id);
    }

    // Restore Categories
    const categoryMap = new Map<string, string>();
    for (const c of backup.categories) {
      let cat = await tx.category.findFirst({
        where: { userId, name: c.name, type: c.type },
      });
      if (!cat) {
        cat = await tx.category.create({
          data: {
            userId,
            name: c.name,
            type: c.type,
            icon: c.icon,
            color: c.color,
            isDefault: c.isDefault ?? false,
            isArchived: c.isArchived ?? false,
          },
        });
      }
      categoryMap.set(`${c.name}_${c.type}`, cat.id);
    }

    // Restore Transactions
    for (const t of backup.transactions) {
      const accountId = accountMap.get(t.accountName);
      if (!accountId) continue;
      const toAccountId = t.toAccountName ? accountMap.get(t.toAccountName) : null;
      const categoryId = t.categoryName
        ? categoryMap.get(`${t.categoryName}_${t.type}`)
        : null;

      await tx.transaction.create({
        data: {
          userId,
          type: t.type,
          amountPaise: BigInt(t.amountPaise),
          date: new Date(t.date),
          accountId,
          toAccountId,
          categoryId,
          merchant: t.merchant,
          paymentMethod: t.paymentMethod,
          notes: t.notes,
          tags: t.tags,
          isExcludedFromBudget: t.isExcludedFromBudget ?? false,
        },
      });
    }

    // Restore Budgets
    if (backup.budgets) {
      for (const b of backup.budgets) {
        const categoryId = b.categoryName
          ? categoryMap.get(`${b.categoryName}_EXPENSE`)
          : null;
        await tx.budget.upsert({
          where: {
            userId_categoryId_monthYear: {
              userId,
              categoryId: categoryId || "",
              monthYear: b.monthYear,
            },
          },
          update: {
            amountPaise: BigInt(b.amountPaise),
            alertThreshold: b.alertThreshold ?? 80,
          },
          create: {
            userId,
            categoryId: categoryId || null,
            monthYear: b.monthYear,
            amountPaise: BigInt(b.amountPaise),
            alertThreshold: b.alertThreshold ?? 80,
          },
        });
      }
    }

    // Restore Savings Goals
    if (backup.savingsGoals) {
      for (const g of backup.savingsGoals) {
        const goal = await tx.savingsGoal.create({
          data: {
            userId,
            name: g.name,
            targetAmountPaise: BigInt(g.targetAmountPaise),
            currentAmountPaise: BigInt(g.currentAmountPaise),
            targetDate: g.targetDate ? new Date(g.targetDate) : null,
            description: g.description,
            color: g.color,
            status: g.status,
          },
        });

        if (g.contributions) {
          for (const c of g.contributions) {
            const accId = c.accountName ? accountMap.get(c.accountName) : null;
            await tx.savingsContribution.create({
              data: {
                goalId: goal.id,
                amountPaise: BigInt(c.amountPaise),
                date: new Date(c.date),
                notes: c.notes,
                accountId: accId,
              },
            });
          }
        }
      }
    }

    return { success: true };
  });
}

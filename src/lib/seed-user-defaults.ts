import { db } from "@/lib/db";
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from "@/config/app";

export async function seedUserDefaults(userId: string) {
  // 1. Seed Expense Categories idempotently
  for (const cat of DEFAULT_EXPENSE_CATEGORIES) {
    await db.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: cat.name,
          type: "EXPENSE",
        },
      },
      update: {},
      create: {
        userId,
        name: cat.name,
        type: "EXPENSE",
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  // 2. Seed Income Categories idempotently
  for (const cat of DEFAULT_INCOME_CATEGORIES) {
    await db.category.upsert({
      where: {
        userId_name_type: {
          userId,
          name: cat.name,
          type: "INCOME",
        },
      },
      update: {},
      create: {
        userId,
        name: cat.name,
        type: "INCOME",
        icon: cat.icon,
        color: cat.color,
        isDefault: true,
      },
    });
  }

  // 3. Create default primary accounts if user has none
  const accountCount = await db.account.count({ where: { userId } });
  if (accountCount === 0) {
    await db.account.createMany({
      data: [
        {
          userId,
          name: "Main Bank Account",
          type: "BANK",
          openingBalancePaise: BigInt(0),
          color: "#3b82f6",
          notes: "Primary checking / salary account",
        },
        {
          userId,
          name: "Cash Wallet",
          type: "CASH",
          openingBalancePaise: BigInt(0),
          color: "#10b981",
          notes: "Physical cash in hand",
        },
        {
          userId,
          name: "UPI Wallet",
          type: "UPI_WALLET",
          openingBalancePaise: BigInt(0),
          color: "#8b5cf6",
          notes: "GPay / PhonePe / Paytm",
        },
      ],
    });
  }
}

import { db } from "@/lib/db";

export interface AccountWithBalance {
  id: string;
  name: string;
  type: string;
  openingBalancePaise: bigint;
  currentBalancePaise: bigint;
  isArchived: boolean;
  color: string | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Calculates current balance for all accounts belonging to the user.
 */
export async function getAccountsWithBalances(userId: string): Promise<AccountWithBalance[]> {
  const accounts = await db.account.findMany({
    where: { userId },
    orderBy: { createdAt: "asc" },
  });

  const transactions = await db.transaction.findMany({
    where: { userId },
    select: {
      accountId: true,
      toAccountId: true,
      type: true,
      amountPaise: true,
    },
  });

  const contributions = await db.savingsContribution.findMany({
    where: {
      account: { userId },
    },
    select: {
      accountId: true,
      amountPaise: true,
    },
  });

  return accounts.map((acc) => {
    let balance = acc.openingBalancePaise;

    for (const tx of transactions) {
      if (tx.accountId === acc.id) {
        if (tx.type === "INCOME") {
          balance += tx.amountPaise;
        } else if (tx.type === "EXPENSE") {
          balance -= tx.amountPaise;
        } else if (tx.type === "TRANSFER") {
          balance -= tx.amountPaise;
        }
      }
      if (tx.type === "TRANSFER" && tx.toAccountId === acc.id) {
        balance += tx.amountPaise;
      }
    }

    // Account deduction for savings goal contribution if account was linked
    for (const contrib of contributions) {
      if (contrib.accountId === acc.id) {
        balance -= contrib.amountPaise;
      }
    }

    return {
      ...acc,
      currentBalancePaise: balance,
    };
  });
}

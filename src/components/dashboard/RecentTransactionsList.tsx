"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/date";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ChevronRight,
} from "lucide-react";

interface RecentTransactionsListProps {
  transactions: any[];
  onOpenQuickAdd: () => void;
}

export function RecentTransactionsList({
  transactions,
  onOpenQuickAdd,
}: RecentTransactionsListProps) {
  return (
    <Card className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
            Recent Transactions
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Latest activity across accounts</p>
        </div>
        <Link
          href="/transactions"
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 flex items-center gap-1"
        >
          View all
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-8 text-center">
          <p className="text-xs text-slate-400 mb-3">No transactions recorded yet</p>
          <button
            onClick={onOpenQuickAdd}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Record your first transaction
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {transactions.map((tx) => {
            const isExpense = tx.type === "EXPENSE";
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            return (
              <div
                key={tx.id}
                className="py-3 flex items-center justify-between hover:bg-slate-50/50 dark:hover:bg-slate-800/30 px-1 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      isExpense
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/50 dark:text-rose-400"
                        : isIncome
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400"
                        : "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/50 dark:text-indigo-400"
                    }`}
                  >
                    {isExpense && <ArrowUpRight className="w-4 h-4" />}
                    {isIncome && <ArrowDownLeft className="w-4 h-4" />}
                    {isTransfer && <ArrowLeftRight className="w-4 h-4" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                      {tx.merchant ||
                        (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                    </p>
                    <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span>{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate">{tx.account?.name}</span>
                      {isTransfer && tx.toAccount && (
                        <span>→ {tx.toAccount.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-2">
                  <span
                    className={`text-xs font-bold ${
                      isExpense
                        ? "text-rose-600 dark:text-rose-400"
                        : isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isExpense ? "-" : isIncome ? "+" : ""}
                    {formatCurrency(tx.amountPaise)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}

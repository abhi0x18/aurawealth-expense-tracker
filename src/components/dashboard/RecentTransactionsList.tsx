"use client";

import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { useCurrency } from "@/context/CurrencyContext";
import { formatDate } from "@/lib/date";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  ChevronRight,
  Sparkles,
} from "lucide-react";

interface RecentTransactionsListProps {
  transactions: any[];
  onOpenQuickAdd: () => void;
}

export function RecentTransactionsList({
  transactions,
  onOpenQuickAdd,
}: RecentTransactionsListProps) {
  const { formatMoney } = useCurrency();

  return (
    <Card className="flex flex-col h-full rounded-3xl p-6 border border-slate-200/80 dark:border-white/10 shadow-xl">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h3 className="text-lg font-display font-extrabold text-slate-900 dark:text-white">
            Recent Ledger Activity
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time synced flow across all accounts
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors"
        >
          <span>View all</span>
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>

      {transactions.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3">
            <Sparkles className="w-6 h-6" />
          </div>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-2">No transactions recorded yet</p>
          <button
            onClick={onOpenQuickAdd}
            className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline"
          >
            + Record your first entry
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
          {transactions.map((tx) => {
            const isExpense = tx.type === "EXPENSE";
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            return (
              <div
                key={tx.id}
                className="py-3.5 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-2 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
                      isExpense
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                        : isIncome
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                        : "bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20"
                    }`}
                  >
                    {isExpense && <ArrowUpRight className="w-5 h-5 stroke-[2.5]" />}
                    {isIncome && <ArrowDownLeft className="w-5 h-5 stroke-[2.5]" />}
                    {isTransfer && <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />}
                  </div>

                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-100 truncate">
                      {tx.merchant ||
                        (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-2 mt-0.5">
                      <span className="font-medium">{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate font-semibold text-slate-600 dark:text-slate-300">{tx.account?.name}</span>
                      {isTransfer && tx.toAccount && (
                        <span>→ {tx.toAccount.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`text-base font-mono font-extrabold tracking-tight ${
                      isExpense
                        ? "text-rose-600 dark:text-rose-400"
                        : isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-700 dark:text-slate-300"
                    }`}
                  >
                    {isExpense ? "-" : isIncome ? "+" : ""}
                    {formatMoney(tx.amountPaise)}
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

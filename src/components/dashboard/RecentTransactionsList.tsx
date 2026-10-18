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
          <h3 className="text-xl font-display font-black text-slate-900 dark:text-white">
            Recent Ledger Activity
          </h3>
          <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mt-1">
            Real-time synced flow across all accounts
          </p>
        </div>
        <Link
          href="/transactions"
          className="text-sm sm:text-base font-bold text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl hover:bg-emerald-500/10 transition-colors"
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
          <p className="text-base font-bold text-slate-700 dark:text-slate-200 mb-2">No transactions recorded yet</p>
          <button
            onClick={onOpenQuickAdd}
            className="text-base font-extrabold text-emerald-600 dark:text-emerald-400 hover:underline"
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
                className="py-4 flex items-center justify-between hover:bg-slate-50/70 dark:hover:bg-slate-800/40 px-3 rounded-2xl transition-all"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${
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
                    <p className="text-base font-extrabold text-slate-900 dark:text-white truncate">
                      {tx.merchant ||
                        (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-2 mt-0.5">
                      <span className="font-semibold">{formatDate(tx.date)}</span>
                      <span>•</span>
                      <span className="truncate font-bold text-slate-700 dark:text-slate-200">{tx.account?.name}</span>
                      {isTransfer && tx.toAccount && (
                        <span>→ {tx.toAccount.name}</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0 pl-3">
                  <span
                    className={`text-lg font-mono font-black tracking-tight ${
                      isExpense
                        ? "text-rose-600 dark:text-rose-400"
                        : isIncome
                        ? "text-emerald-600 dark:text-emerald-400"
                        : "text-slate-800 dark:text-slate-200"
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

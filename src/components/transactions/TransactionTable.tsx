"use client";

import React, { useState } from "react";
import { useCurrency } from "@/context/CurrencyContext";
import { formatDate } from "@/lib/date";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  Edit2,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Download,
  Upload,
} from "lucide-react";

interface TransactionTableProps {
  transactions: any[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
  };
  onPageChange: (newPage: number) => void;
  onEdit: (tx: any) => void;
  onDelete: (id: string) => void;
  onExport: () => void;
  onImport: () => void;
}

export function TransactionTable({
  transactions,
  pagination,
  onPageChange,
  onEdit,
  onDelete,
  onExport,
  onImport,
}: TransactionTableProps) {
  const { formatMoney } = useCurrency();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const confirmDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this transaction? This will update your account balance.")) {
      setDeletingId(id);
      try {
        await onDelete(id);
      } finally {
        setDeletingId(null);
      }
    }
  };

  return (
    <div className="glass-panel rounded-3xl overflow-hidden border border-slate-200/80 dark:border-white/10 shadow-xl">
      {/* Header action bar */}
      <div className="p-5 border-b border-slate-200/70 dark:border-white/10 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-semibold text-slate-600 dark:text-slate-300">
          Showing <span className="font-mono font-bold text-slate-900 dark:text-white">{transactions.length}</span> of{" "}
          <span className="font-mono font-bold text-slate-900 dark:text-white">{pagination.totalCount}</span> ledger entries
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={onImport} variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-2">
            <Upload className="w-4 h-4 text-emerald-500" />
            Import CSV
          </Button>
          <Button onClick={onExport} variant="outline" size="sm" className="rounded-xl font-bold text-xs gap-2">
            <Download className="w-4 h-4 text-indigo-500" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-900/60 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-200/70 dark:border-white/10">
              <th className="py-4 px-5">Type</th>
              <th className="py-4 px-5">Date</th>
              <th className="py-4 px-5">Description / Merchant</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Account</th>
              <th className="py-4 px-5 text-right">Amount</th>
              <th className="py-4 px-5 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-sm">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-16 text-center text-slate-400 text-sm font-medium">
                  No transactions found matching your criteria.
                </td>
              </tr>
            ) : (
              transactions.map((tx) => {
                const isExpense = tx.type === "EXPENSE";
                const isIncome = tx.type === "INCOME";
                const isTransfer = tx.type === "TRANSFER";

                return (
                  <tr
                    key={tx.id}
                    className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Type Badge */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {isExpense && (
                        <Badge variant="danger" size="sm" className="font-mono font-bold text-xs px-2.5 py-1">
                          <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          Expense
                        </Badge>
                      )}
                      {isIncome && (
                        <Badge variant="success" size="sm" className="font-mono font-bold text-xs px-2.5 py-1">
                          <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                          Income
                        </Badge>
                      )}
                      {isTransfer && (
                        <Badge variant="info" size="sm" className="font-mono font-bold text-xs px-2.5 py-1">
                          <ArrowLeftRight className="w-3.5 h-3.5 stroke-[2.5]" />
                          Transfer
                        </Badge>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-4 px-5 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {formatDate(tx.date)}
                    </td>

                    {/* Merchant / Description */}
                    <td className="py-4 px-5 max-w-xs truncate">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {tx.merchant || (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                      </span>
                      {tx.notes && (
                        <p className="text-xs text-slate-400 truncate mt-0.5">{tx.notes}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 text-xs font-semibold">
                          {tx.category.color && (
                            <span
                              className="w-2.5 h-2.5 rounded-full"
                              style={{ backgroundColor: tx.category.color }}
                            />
                          )}
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">
                          {isTransfer ? "—" : "Uncategorized"}
                        </span>
                      )}
                    </td>

                    {/* Account */}
                    <td className="py-4 px-5 whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300 font-semibold">
                        {tx.account?.name}
                        {isTransfer && tx.toAccount && (
                          <span className="text-slate-400 font-normal"> → {tx.toAccount.name}</span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-5 text-right whitespace-nowrap">
                      <span
                        className={`font-mono font-black text-base tracking-tight ${
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
                    </td>

                    {/* Action buttons */}
                    <td className="py-4 px-5 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => confirmDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          title="Delete transaction"
                          className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination.totalPages > 1 && (
        <div className="p-5 border-t border-slate-200/70 dark:border-white/10 flex items-center justify-between text-sm text-slate-500">
          <span>
            Page <span className="font-mono font-bold text-slate-900 dark:text-white">{pagination.page}</span> of{" "}
            <span className="font-mono font-bold text-slate-900 dark:text-white">{pagination.totalPages}</span>
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

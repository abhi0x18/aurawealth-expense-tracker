"use client";

import React, { useState } from "react";
import { formatCurrency } from "@/lib/money";
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
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
      {/* Header action bar */}
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Showing {transactions.length} of {pagination.totalCount} transactions
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={onImport} variant="outline" size="sm">
            <Upload className="w-3.5 h-3.5" />
            Import CSV
          </Button>
          <Button onClick={onExport} variant="outline" size="sm">
            <Download className="w-3.5 h-3.5" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Table view */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/75 dark:bg-slate-800/40 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Merchant / Note</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Account</th>
              <th className="py-3 px-4 text-right">Amount</th>
              <th className="py-3 px-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
            {transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-400">
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
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    {/* Type Badge */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {isExpense && (
                        <Badge variant="danger" size="sm">
                          <ArrowUpRight className="w-3 h-3" />
                          Expense
                        </Badge>
                      )}
                      {isIncome && (
                        <Badge variant="success" size="sm">
                          <ArrowDownLeft className="w-3 h-3" />
                          Income
                        </Badge>
                      )}
                      {isTransfer && (
                        <Badge variant="info" size="sm">
                          <ArrowLeftRight className="w-3 h-3" />
                          Transfer
                        </Badge>
                      )}
                    </td>

                    {/* Date */}
                    <td className="py-3 px-4 whitespace-nowrap font-medium text-slate-600 dark:text-slate-300">
                      {formatDate(tx.date)}
                    </td>

                    {/* Merchant / Description */}
                    <td className="py-3 px-4 max-w-xs truncate">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {tx.merchant || (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                      </span>
                      {tx.notes && (
                        <p className="text-[11px] text-slate-400 truncate mt-0.5">{tx.notes}</p>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      {tx.category ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-medium">
                          {tx.category.color && (
                            <span
                              className="w-2 h-2 rounded-full"
                              style={{ backgroundColor: tx.category.color }}
                            />
                          )}
                          {tx.category.name}
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[11px]">
                          {isTransfer ? "—" : "Uncategorized"}
                        </span>
                      )}
                    </td>

                    {/* Account */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <div className="text-slate-700 dark:text-slate-300 font-medium">
                        {tx.account?.name}
                        {isTransfer && tx.toAccount && (
                          <span className="text-slate-400"> → {tx.toAccount.name}</span>
                        )}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <span
                        className={`font-bold ${
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
                    </td>

                    {/* Action buttons */}
                    <td className="py-3 px-4 whitespace-nowrap text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => onEdit(tx)}
                          title="Edit transaction"
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => confirmDelete(tx.id)}
                          disabled={deletingId === tx.id}
                          title="Delete transaction"
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
          <span>
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Search, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Calendar, Tag } from "lucide-react";
import { formatCurrency } from "@/lib/money";
import { formatDate } from "@/lib/date";

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTransaction?: (tx: any) => void;
}

export function GlobalSearchModal({
  isOpen,
  onClose,
  onSelectTransaction,
}: GlobalSearchModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSearchTerm("");
      setResults([]);
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?search=${encodeURIComponent(searchTerm)}&limit=10`);
        const data = await res.json();
        setResults(data.transactions || []);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Global Transaction Search" maxWidth="lg">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by merchant, note, tag, category, account..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
          />
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto space-y-2 pr-1">
          {loading && (
            <div className="py-8 text-center text-xs text-slate-400">
              Searching transactions...
            </div>
          )}

          {!loading && searchTerm.trim() && results.length === 0 && (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions match &ldquo;{searchTerm}&rdquo;
            </div>
          )}

          {!loading && !searchTerm.trim() && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type keywords, amounts, payee names, or tags to find records
            </div>
          )}

          {results.map((tx) => {
            const isExpense = tx.type === "EXPENSE";
            const isIncome = tx.type === "INCOME";
            const isTransfer = tx.type === "TRANSFER";

            return (
              <div
                key={tx.id}
                onClick={() => {
                  if (onSelectTransaction) onSelectTransaction(tx);
                  onClose();
                }}
                className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-lg flex items-center justify-center ${
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

                  <div>
                    <div className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      {tx.merchant || (isTransfer ? "Account Transfer" : tx.category?.name || "Transaction")}
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(tx.date)}
                      </span>
                      <span>•</span>
                      <span>{tx.account?.name}</span>
                      {tx.category && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Tag className="w-3 h-3" />
                            {tx.category.name}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="text-right">
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
      </div>
    </Modal>
  );
}

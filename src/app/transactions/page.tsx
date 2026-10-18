"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { TransactionTable } from "@/components/transactions/TransactionTable";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { CsvImportModal } from "@/components/settings/CsvImportModal";
import { Button } from "@/components/ui/Button";
import { Plus, Search, RotateCcw, Download, Upload, Filter, Sparkles } from "lucide-react";

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalCount: 0,
    totalPages: 1,
  });

  const [search, setSearch] = useState("");
  const [type, setType] = useState("ALL");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);

  // Fetch accounts & categories for filter dropdowns
  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([accData, catData]) => {
      setAccounts(accData.accounts || []);
      setCategories(catData.categories || []);
    });
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (type !== "ALL") params.set("type", type);
      if (accountId) params.set("accountId", accountId);
      if (categoryId) params.set("categoryId", categoryId);
      if (startDate) params.set("startDate", startDate);
      if (endDate) params.set("endDate", endDate);
      params.set("page", pagination.page.toString());
      params.set("limit", pagination.limit.toString());
      params.set("sortBy", sortBy);
      params.set("sortOrder", sortOrder);

      const res = await fetch(`/api/transactions?${params.toString()}`);
      const data = await res.json();
      setTransactions(data.transactions || []);
      setPagination(data.pagination || { page: 1, limit: 20, totalCount: 0, totalPages: 1 });
    } catch (err) {
      console.error("Failed to fetch transactions:", err);
    } finally {
      setLoading(false);
    }
  }, [search, type, accountId, categoryId, startDate, endDate, pagination.page, pagination.limit, sortBy, sortOrder]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  const handleResetFilters = () => {
    setSearch("");
    setType("ALL");
    setAccountId("");
    setCategoryId("");
    setStartDate("");
    setEndDate("");
    setSortBy("date");
    setSortOrder("desc");
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (type !== "ALL") params.set("type", type);
    if (accountId) params.set("accountId", accountId);
    if (categoryId) params.set("categoryId", categoryId);
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);

    window.open(`/api/transactions/export?${params.toString()}`, "_blank");
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchTransactions();
      }
    } catch (err) {
      console.error("Failed to delete transaction:", err);
    }
  };

  return (
    <AppShell>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              Financial Ledger &amp; Journal
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold border border-emerald-500/30">
                {pagination.totalCount} Entries
              </span>
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Search, filter, categorize, and audit transactions with full CSV portability.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => setImportModalOpen(true)}
              variant="outline"
              size="md"
              className="rounded-2xl font-bold border-slate-200 dark:border-white/10"
            >
              <Upload className="w-4 h-4" />
              Import CSV
            </Button>

            <Button
              onClick={handleExportCsv}
              variant="outline"
              size="md"
              className="rounded-2xl font-bold border-slate-200 dark:border-white/10"
            >
              <Download className="w-4 h-4" />
              Export
            </Button>

            <Button
              onClick={() => {
                setEditingTransaction(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="shadow-lg shadow-emerald-500/25 font-bold rounded-2xl"
            >
              <Plus className="w-4 h-4" />
              Add Transaction
            </Button>
          </div>
        </div>

        {/* 3D Glass Filter Controls Bar */}
        <div className="p-5 bg-white/80 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200/80 dark:border-white/10 rounded-3xl shadow-xl space-y-4 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search merchant, notes, tags..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white"
              />
            </div>

            {/* Type Selector */}
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="ALL">All Types (Income, Expense, Transfer)</option>
              <option value="EXPENSE">Expenses Only</option>
              <option value="INCOME">Income Only</option>
              <option value="TRANSFER">Transfers Only</option>
            </select>

            {/* Account Selector */}
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="">All Accounts</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>

            {/* Category Selector */}
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 text-slate-900 dark:text-white cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.type})
                </option>
              ))}
            </select>
          </div>

          {/* Date range & Sort options */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-white/5 text-xs font-medium">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-slate-400 font-semibold">Calendar:</span>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 font-mono"
              />
              <span className="text-slate-400">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="px-3 py-1.5 text-xs bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300 font-mono"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400 font-semibold">Order:</span>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [by, ord] = e.target.value.split("-");
                  setSortBy(by);
                  setSortOrder(ord as "asc" | "desc");
                }}
                className="px-3 py-1.5 text-xs font-semibold bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-white/10 rounded-xl text-slate-700 dark:text-slate-300"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="amount-desc">Highest Amount</option>
                <option value="amount-asc">Lowest Amount</option>
              </select>

              {(search || type !== "ALL" || accountId || categoryId || startDate || endDate) && (
                <button
                  onClick={handleResetFilters}
                  className="flex items-center gap-1.5 text-xs font-bold text-emerald-500 hover:text-emerald-400 transition-colors ml-3"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Transactions Table Container */}
        <TransactionTable
          transactions={transactions}
          pagination={pagination}
          onPageChange={(page) => setPagination((prev) => ({ ...prev, page }))}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setModalOpen(true);
          }}
          onDelete={handleDelete}
          onExport={handleExportCsv}
          onImport={() => setImportModalOpen(true)}
        />
      </div>

      {/* Transaction Modal (Create & Edit) */}
      <TransactionModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={fetchTransactions}
        initialData={editingTransaction}
      />

      {/* CSV Import Modal */}
      <CsvImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </AppShell>
  );
}

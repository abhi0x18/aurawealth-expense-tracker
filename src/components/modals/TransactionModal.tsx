"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { PAYMENT_METHODS } from "@/config/app";
import { format } from "date-fns";

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any; // If provided, edit mode
}

export function TransactionModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: TransactionModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME" | "TRANSFER">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [accountId, setAccountId] = useState("");
  const [toAccountId, setToAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("UPI");
  const [notes, setNotes] = useState("");
  const [tags, setTags] = useState("");
  const [isExcludedFromBudget, setIsExcludedFromBudget] = useState(false);

  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [fetchingOptions, setFetchingOptions] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch accounts and categories on open
  useEffect(() => {
    if (isOpen) {
      setError(null);
      setFetchingOptions(true);
      Promise.all([
        fetch("/api/accounts").then((r) => r.json()),
        fetch("/api/categories").then((r) => r.json()),
      ])
        .then(([accData, catData]) => {
          const accs = accData.accounts || [];
          setAccounts(accs);
          const cats = catData.categories || [];
          setCategories(cats);

          if (initialData) {
            setType(initialData.type);
            setAmount((Number(initialData.amountPaise) / 100).toString());
            setDate(format(new Date(initialData.date), "yyyy-MM-dd"));
            setAccountId(initialData.accountId);
            setToAccountId(initialData.toAccountId || "");
            setCategoryId(initialData.categoryId || "");
            setMerchant(initialData.merchant || "");
            setPaymentMethod(initialData.paymentMethod || "UPI");
            setNotes(initialData.notes || "");
            setTags(initialData.tags || "");
            setIsExcludedFromBudget(Boolean(initialData.isExcludedFromBudget));
          } else {
            // Default first account
            if (accs.length > 0) setAccountId(accs[0].id);
            if (accs.length > 1) setToAccountId(accs[1].id);
            setAmount("");
            setDate(format(new Date(), "yyyy-MM-dd"));
            setMerchant("");
            setNotes("");
            setTags("");
            setIsExcludedFromBudget(false);
          }
        })
        .finally(() => setFetchingOptions(false));
    }
  }, [isOpen, initialData]);

  // Filter categories by selected transaction type
  const availableCategories = categories.filter((c) => c.type === type);

  // Auto-select category if not selected or invalid for current type
  useEffect(() => {
    if (type !== "TRANSFER" && availableCategories.length > 0) {
      const match = availableCategories.some((c) => c.id === categoryId);
      if (!match) {
        setCategoryId(availableCategories[0].id);
      }
    }
  }, [type, availableCategories, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setError("Please enter a valid amount greater than ₹0");
      return;
    }

    if (!accountId) {
      setError("Please select an account");
      return;
    }

    if (type === "TRANSFER") {
      if (!toAccountId) {
        setError("Please select a destination account for transfer");
        return;
      }
      if (toAccountId === accountId) {
        setError("Source and destination accounts must be different");
        return;
      }
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount: parsedAmount,
        date: new Date(date).toISOString(),
        accountId,
        toAccountId: type === "TRANSFER" ? toAccountId : null,
        categoryId: type !== "TRANSFER" ? categoryId || null : null,
        merchant: merchant.trim() || null,
        paymentMethod,
        notes: notes.trim() || null,
        tags: tags.trim() || null,
        isExcludedFromBudget,
      };

      const url = initialData ? `/api/transactions/${initialData.id}` : "/api/transactions";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save transaction");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save transaction");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Transaction" : "Record New Transaction"}
      description="Enter accurate transaction details for your accounts and analytics"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Transaction Type Segmented Switch */}
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Expense (-)
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Income (+)
          </button>
          <button
            type="button"
            onClick={() => setType("TRANSFER")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === "TRANSFER"
                ? "bg-indigo-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
            }`}
          >
            Transfer (⇄)
          </button>
        </div>

        {/* Amount Input */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Amount (INR ₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-lg font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Date and Account Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              {type === "TRANSFER" ? "From Account" : "Account"}
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>
                Select Account
              </option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.type.replace("_", " ")})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Transfer Destination Account */}
        {type === "TRANSFER" && (
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              To Destination Account
            </label>
            <select
              required
              value={toAccountId}
              onChange={(e) => setToAccountId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-500 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>
                Select Destination Account
              </option>
              {accounts
                .filter((a) => a.id !== accountId)
                .map((acc) => (
                  <option key={acc.id} value={acc.id}>
                    {acc.name} ({acc.type.replace("_", " ")})
                  </option>
                ))}
            </select>
          </div>
        )}

        {/* Category & Payment Method (if not transfer) */}
        {type !== "TRANSFER" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
              >
                <option value="">Uncategorized</option>
                {availableCategories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
              >
                {PAYMENT_METHODS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Merchant / Payee */}
        <Input
          label={type === "INCOME" ? "Source / Payer" : type === "TRANSFER" ? "Transfer Note" : "Merchant / Payee"}
          placeholder={type === "INCOME" ? "e.g. Acme Corp / Client" : "e.g. Swiggy, Amazon, Metro, Electricity Bill"}
          value={merchant}
          onChange={(e) => setMerchant(e.target.value)}
        />

        {/* Notes & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Notes (Optional)"
            placeholder="Dinner with team, monthly groceries..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
          <Input
            label="Tags (Optional)"
            placeholder="vacation, emergency, office..."
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </div>

        {/* Exclude from budget checkbox */}
        {type === "EXPENSE" && (
          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isExcludedFromBudget}
              onChange={(e) => setIsExcludedFromBudget(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            <span className="text-xs text-slate-600 dark:text-slate-400">
              Exclude this transaction from monthly budget spending limits
            </span>
          </label>
        )}

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="md"
            loading={loading}
            disabled={fetchingOptions}
          >
            {initialData ? "Save Changes" : "Save Transaction"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

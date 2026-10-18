"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { RECURRING_FREQUENCIES } from "@/config/app";
import { format } from "date-fns";

interface RecurringRuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  accounts: any[];
  categories: any[];
  initialData?: any;
}

export function RecurringRuleModal({
  isOpen,
  onClose,
  onSuccess,
  accounts,
  categories,
  initialData,
}: RecurringRuleModalProps) {
  const [type, setType] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("MONTHLY");
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState("");
  const [accountId, setAccountId] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [merchant, setMerchant] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setType(initialData.type || "EXPENSE");
        const amt = initialData.amountPaise != null ? Number(initialData.amountPaise) / 100 : "";
        setAmount(amt ? amt.toString() : "");
        setFrequency(initialData.frequency || "MONTHLY");
        setStartDate(initialData.startDate ? format(new Date(initialData.startDate), "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd"));
        setEndDate(initialData.endDate ? format(new Date(initialData.endDate), "yyyy-MM-dd") : "");
        setAccountId(initialData.accountId || (accounts.length > 0 ? accounts[0].id : ""));
        setCategoryId(initialData.categoryId || "");
        setMerchant(initialData.merchant || "");
        setDescription(initialData.description || "");
      } else {
        setType("EXPENSE");
        setAmount("");
        setFrequency("MONTHLY");
        setStartDate(format(new Date(), "yyyy-MM-dd"));
        setEndDate("");
        setAccountId(accounts.length > 0 ? accounts[0].id : "");
        setCategoryId("");
        setMerchant("");
        setDescription("");
      }
    }
  }, [isOpen, initialData]);

  // Auto-select first account if accounts loaded after modal opened
  useEffect(() => {
    if (isOpen && !accountId && accounts.length > 0) {
      setAccountId(accounts[0].id);
    }
  }, [isOpen, accounts, accountId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid recurring amount greater than ₹0");
      return;
    }

    if (!accountId) {
      setError("Please select an account for this recurring payment");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        type,
        amount: val,
        frequency,
        startDate: new Date(startDate).toISOString(),
        endDate: endDate ? new Date(endDate).toISOString() : null,
        accountId,
        categoryId: categoryId || null,
        merchant: merchant.trim() || null,
        description: description.trim() || null,
      };

      const url = initialData ? `/api/recurring/${initialData.id}` : "/api/recurring";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save recurring rule");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save recurring rule");
    } finally {
      setLoading(false);
    }
  };

  const availableCategories = categories.filter((c) => c.type === type);

  // Auto-switch category when switching between EXPENSE and INCOME
  useEffect(() => {
    if (availableCategories.length > 0 && categoryId) {
      const match = availableCategories.some((c) => c.id === categoryId);
      if (!match) {
        setCategoryId(availableCategories[0].id);
      }
    }
  }, [type, availableCategories, categoryId]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Recurring Rule" : "Create Recurring Rule"}
      description="Automate recurring bills (rent, subscriptions) or income (salary, dividends)"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Type toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
          <button
            type="button"
            onClick={() => setType("EXPENSE")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === "EXPENSE"
                ? "bg-rose-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Recurring Expense
          </button>
          <button
            type="button"
            onClick={() => setType("INCOME")}
            className={`py-2 text-xs font-bold rounded-lg transition-all ${
              type === "INCOME"
                ? "bg-emerald-600 text-white shadow-sm"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Recurring Income
          </button>
        </div>

        {/* Amount */}
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

        {/* Frequency & Account */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Frequency
            </label>
            <select
              value={frequency}
              onChange={(e) => setFrequency(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            >
              {RECURRING_FREQUENCIES.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
              Account
            </label>
            <select
              required
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            >
              <option value="" disabled>Select Account</option>
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id}>
                  {acc.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Category & Merchant */}
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

          <Input
            label="Merchant / Payee"
            placeholder="e.g. Netflix, Rent, Employer"
            value={merchant}
            onChange={(e) => setMerchant(e.target.value)}
          />
        </div>

        {/* Start Date & End Date */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Start Date"
            type="date"
            required
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date (Optional)"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            helperText="Leave empty for indefinite recurring"
          />
        </div>

        <Input
          label="Description / Note"
          placeholder="e.g. Monthly broadband subscription"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            {initialData ? "Save Changes" : "Create Recurring Rule"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  monthYear: string;
  categories: any[];
  initialData?: any;
}

export function BudgetModal({
  isOpen,
  onClose,
  onSuccess,
  monthYear,
  categories,
  initialData,
}: BudgetModalProps) {
  const [categoryId, setCategoryId] = useState("");
  const [amount, setAmount] = useState("");
  const [alertThreshold, setAlertThreshold] = useState("80");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setCategoryId(initialData.categoryId || "");
        setAmount((Number(initialData.budgetPaise || initialData.amountPaise) / 100).toString());
        setAlertThreshold(initialData.alertThreshold?.toString() || "80");
      } else {
        setCategoryId("");
        setAmount("");
        setAlertThreshold("80");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const val = parseFloat(amount);
    if (isNaN(val) || val <= 0) {
      setError("Please enter a valid monthly budget amount greater than ₹0");
      return;
    }

    const threshold = parseInt(alertThreshold, 10);
    if (isNaN(threshold) || threshold < 10 || threshold > 100) {
      setError("Alert threshold must be between 10% and 100%");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        monthYear,
        categoryId: categoryId || null,
        amount: val,
        alertThreshold: threshold,
      };

      const url = initialData ? `/api/budgets/${initialData.id}` : "/api/budgets";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save budget");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };

  const expenseCategories = categories.filter((c) => c.type === "EXPENSE");

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Budget Limit" : "Set Monthly Budget"}
      description={`Spending limit for ${monthYear}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Budget Scope
          </label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            disabled={!!initialData}
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100 disabled:opacity-60"
          >
            <option value="">Overall Total Monthly Budget</option>
            {expenseCategories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            {categoryId
              ? "Applies to expense transactions under this specific category."
              : "Applies to the sum of all monthly expense transactions combined."}
          </p>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Monthly Limit (INR ₹)
          </label>
          <div className="relative">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-base font-bold text-slate-400">
              ₹
            </span>
            <input
              type="number"
              step="1"
              min="1"
              required
              placeholder="e.g. 15000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full pl-8 pr-4 py-2.5 text-lg font-bold bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        <Input
          label="Warning Threshold (%)"
          type="number"
          min="10"
          max="100"
          required
          value={alertThreshold}
          onChange={(e) => setAlertThreshold(e.target.value)}
          helperText="Receive an alert on the dashboard when spending exceeds this percentage (default 80%)"
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            {initialData ? "Update Budget" : "Create Budget"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

"use client";

import React, { useState, useEffect } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { ACCOUNT_TYPES } from "@/config/app";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialData?: any;
}

const PRESET_COLORS = [
  "#3b82f6", // Blue
  "#10b981", // Emerald
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f43f5e", // Rose
  "#eab308", // Yellow
  "#f97316", // Orange
  "#64748b", // Slate
];

export function AccountModal({
  isOpen,
  onClose,
  onSuccess,
  initialData,
}: AccountModalProps) {
  const [name, setName] = useState("");
  const [type, setType] = useState<string>("BANK");
  const [openingBalance, setOpeningBalance] = useState("0");
  const [color, setColor] = useState("#3b82f6");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setError(null);
      if (initialData) {
        setName(initialData.name);
        setType(initialData.type);
        setOpeningBalance((Number(initialData.openingBalancePaise) / 100).toString());
        setColor(initialData.color || "#3b82f6");
        setNotes(initialData.notes || "");
      } else {
        setName("");
        setType("BANK");
        setOpeningBalance("0");
        setColor("#3b82f6");
        setNotes("");
      }
    }
  }, [isOpen, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Account name is required");
      return;
    }

    const parsedBalance = parseFloat(openingBalance);
    if (isNaN(parsedBalance)) {
      setError("Please enter a valid numeric opening balance");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        name: name.trim(),
        type,
        openingBalance: parsedBalance,
        color,
        notes: notes.trim() || null,
      };

      const url = initialData ? `/api/accounts/${initialData.id}` : "/api/accounts";
      const method = initialData ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save account");
        return;
      }

      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to save account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialData ? "Edit Account" : "Add New Account"}
      description="Configure accounts (cash, bank, UPI, savings, cards) to track your balances"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        <Input
          label="Account Name"
          placeholder="e.g. HDFC Salary, SBI Savings, Cash in Wallet"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Account Type
          </label>
          <select
            value={type}
            onChange={(e) => setType(e.target.value)}
            disabled={!!initialData} // Preserve type consistency for existing accounts
            className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500 text-slate-900 dark:text-slate-100 disabled:opacity-50"
          >
            {ACCOUNT_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
        </div>

        <Input
          label="Opening Balance (INR ₹)"
          type="number"
          step="0.01"
          placeholder="0.00"
          value={openingBalance}
          onChange={(e) => setOpeningBalance(e.target.value)}
          helperText="Starting balance when you started using PaisaPilot"
        />

        {/* Color picker */}
        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Color Accent
          </label>
          <div className="flex items-center gap-2">
            {PRESET_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`w-7 h-7 rounded-full transition-transform ${
                  color === c ? "ring-2 ring-offset-2 ring-emerald-500 scale-110" : "hover:scale-105"
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <Input
          label="Notes (Optional)"
          placeholder="Account number last 4 digits, branch, or usage note"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="md" loading={loading}>
            {initialData ? "Save Changes" : "Create Account"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

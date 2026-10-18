"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RecurringRuleModal } from "@/components/recurring/RecurringRuleModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { useCurrency } from "@/context/CurrencyContext";
import { triggerConfetti } from "@/lib/confetti";
import { formatDate } from "@/lib/date";
import {
  Repeat,
  Plus,
  Play,
  Pause,
  Edit2,
  Trash2,
  Calendar,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Sparkles,
} from "lucide-react";

export default function RecurringPage() {
  const { formatMoney } = useCurrency();
  const [rules, setRules] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/accounts").then((r) => r.json()),
      fetch("/api/categories").then((r) => r.json()),
    ]).then(([accData, catData]) => {
      setAccounts(accData.accounts || []);
      setCategories(catData.categories || []);
    });
  }, []);

  const fetchRules = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/recurring");
      const data = await res.json();
      setRules(data.rules || []);
    } catch (err) {
      console.error("Failed to fetch recurring rules:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleToggleActive = async (rule: any) => {
    try {
      await fetch(`/api/recurring/${rule.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !rule.isActive }),
      });
      fetchRules();
    } catch (err) {
      console.error("Failed to toggle status:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this recurring rule? Previously generated transactions will remain safe.")) {
      try {
        await fetch(`/api/recurring/${id}`, { method: "DELETE" });
        fetchRules();
      } catch (err) {
        console.error("Failed to delete rule:", err);
      }
    }
  };

  const handleRunProcessing = async () => {
    setProcessing(true);
    try {
      await fetch("/api/recurring");
      await fetchRules();
      triggerConfetti();
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Recurring &amp; Bills
              <span className="text-xs px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 font-mono font-bold border border-indigo-500/30">
                Automated Ledger
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Scheduled subscriptions, rent, insurance, and salary with automated idempotent posting.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={handleRunProcessing}
              variant="outline"
              size="md"
              className="rounded-2xl font-bold text-sm px-5 py-3 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 shadow-sm"
              loading={processing}
            >
              <RefreshCw className="w-4 h-4 text-emerald-500" />
              Check Due Now
            </Button>

            <Button
              onClick={() => {
                setEditingRule(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-2xl font-bold text-sm px-6 py-3 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              New Rule
            </Button>
          </div>
        </div>

        {/* Empty State */}
        {!loading && rules.length === 0 && (
          <EmptyState
            icon={Repeat}
            title="No recurring rules scheduled"
            description="Automate repetitive expenses (Netflix, Rent, Gym, SIP) or regular income (Salary) so they automatically log when due."
            actionLabel="+ Create Your First Recurring Rule"
            onAction={() => setModalOpen(true)}
          />
        )}

        {/* Rules List */}
        {rules.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rules.map((rule) => {
              const isExpense = rule.type === "EXPENSE";

              return (
                <Card
                  key={rule.id}
                  hover
                  className={`flex flex-col justify-between p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl ${
                    !rule.isActive ? "opacity-60 bg-slate-50 dark:bg-slate-900/40" : ""
                  }`}
                >
                  <div>
                    {/* Header: Type, Status, Actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isExpense ? (
                          <Badge variant="danger" size="sm" className="font-mono font-bold text-xs">
                            <ArrowUpRight className="w-3.5 h-3.5 stroke-[2.5]" />
                            Expense
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm" className="font-mono font-bold text-xs">
                            <ArrowDownLeft className="w-3.5 h-3.5 stroke-[2.5]" />
                            Income
                          </Badge>
                        )}
                        <Badge variant="neutral" size="sm" className="font-mono font-bold text-xs uppercase">
                          {rule.frequency}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          title={rule.isActive ? "Pause rule" : "Resume rule"}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          {rule.isActive ? (
                            <Pause className="w-4 h-4 text-amber-500" />
                          ) : (
                            <Play className="w-4 h-4 text-emerald-500" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Merchant & Amount */}
                    <div className="mt-4">
                      <h4 className="text-base font-display font-extrabold text-slate-900 dark:text-white">
                        {rule.merchant || rule.category?.name || "Recurring Item"}
                      </h4>
                      {rule.description && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-medium">{rule.description}</p>
                      )}
                      <div
                        className={`text-2xl font-mono font-black tracking-tight mt-3 ${
                          isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatMoney(rule.amountPaise)}
                      </div>
                    </div>
                  </div>

                  {/* Footer details: Next due date & account */}
                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 text-xs sm:text-sm text-slate-500 dark:text-slate-400 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        Next Due:
                      </span>
                      <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                        {formatDate(rule.nextDueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Account:</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-200">
                        {rule.account?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 pt-1 font-medium">
                      <span>Status: {rule.isActive ? "Active" : "Paused"}</span>
                      <span>{rule._count?.generatedTransactions || 0} posted</span>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <RecurringRuleModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          triggerConfetti();
          fetchRules();
        }}
        accounts={accounts}
        categories={categories}
        initialData={editingRule}
      />
    </AppShell>
  );
}

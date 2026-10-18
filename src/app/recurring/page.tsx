"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { RecurringRuleModal } from "@/components/recurring/RecurringRuleModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency } from "@/lib/money";
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
  CheckCircle2,
} from "lucide-react";

export default function RecurringPage() {
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
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Recurring Transactions & Bills
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Scheduled subscriptions, rent, insurance, and salary with automated idempotent posting
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={handleRunProcessing}
              variant="outline"
              size="md"
              className="rounded-xl font-semibold"
              loading={processing}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Check Due Now
            </Button>

            <Button
              onClick={() => {
                setEditingRule(null);
                setModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-xl font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {rules.map((rule) => {
              const isExpense = rule.type === "EXPENSE";

              return (
                <Card
                  key={rule.id}
                  hover
                  className={`flex flex-col justify-between ${
                    !rule.isActive ? "opacity-60 bg-slate-50 dark:bg-slate-900/40" : ""
                  }`}
                >
                  <div>
                    {/* Header: Type, Status, Actions */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {isExpense ? (
                          <Badge variant="danger" size="sm">
                            <ArrowUpRight className="w-3 h-3" />
                            Expense
                          </Badge>
                        ) : (
                          <Badge variant="success" size="sm">
                            <ArrowDownLeft className="w-3 h-3" />
                            Income
                          </Badge>
                        )}
                        <Badge variant="neutral" size="sm">
                          {rule.frequency}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleToggleActive(rule)}
                          title={rule.isActive ? "Pause rule" : "Resume rule"}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                        >
                          {rule.isActive ? (
                            <Pause className="w-3.5 h-3.5" />
                          ) : (
                            <Play className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setEditingRule(rule);
                            setModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(rule.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Merchant & Amount */}
                    <div className="mt-3">
                      <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                        {rule.merchant || rule.category?.name || "Recurring Item"}
                      </h4>
                      {rule.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{rule.description}</p>
                      )}
                      <div
                        className={`text-xl font-black tracking-tight mt-2 ${
                          isExpense ? "text-rose-600 dark:text-rose-400" : "text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {formatCurrency(rule.amountPaise)}
                      </div>
                    </div>
                  </div>

                  {/* Footer details: Next due date & account */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        Next Due:
                      </span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {formatDate(rule.nextDueDate)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Account:</span>
                      <span className="font-medium text-slate-700 dark:text-slate-300">
                        {rule.account?.name}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
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
        onSuccess={fetchRules}
        accounts={accounts}
        categories={categories}
        initialData={editingRule}
      />
    </AppShell>
  );
}

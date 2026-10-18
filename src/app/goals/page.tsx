"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoalModal } from "@/components/goals/GoalModal";
import { ContributionModal } from "@/components/goals/ContributionModal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatCurrency, calculatePercentage } from "@/lib/money";
import { formatDate } from "@/lib/date";
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  Edit2,
  Trash2,
  History,
} from "lucide-react";

export default function GoalsPage() {
  const [goals, setGoals] = useState<any[]>([]);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [goalModalOpen, setGoalModalOpen] = useState(false);
  const [contributionModalOpen, setContributionModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<any>(null);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [activeHistoryGoalId, setActiveHistoryGoalId] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((data) => setAccounts(data.accounts || []));
  }, []);

  const fetchGoals = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/goals");
      const data = await res.json();
      setGoals(data.goals || []);
    } catch (err) {
      console.error("Failed to fetch goals:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to remove this savings goal?")) {
      try {
        await fetch(`/api/goals/${id}`, { method: "DELETE" });
        fetchGoals();
      } catch (err) {
        console.error("Failed to delete goal:", err);
      }
    }
  };

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Savings Goals
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Set financial milestones and track deposits towards what matters most
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingGoal(null);
              setGoalModalOpen(true);
            }}
            variant="primary"
            size="md"
            className="rounded-xl font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            New Savings Goal
          </Button>
        </div>

        {/* Empty State */}
        {!loading && goals.length === 0 && (
          <EmptyState
            icon={PiggyBank}
            title="No savings goals yet"
            description="Create dedicated targets for your emergency cushion, annual insurance, holidays, or major purchases to stay motivated."
            actionLabel="+ Create Your First Goal"
            onAction={() => setGoalModalOpen(true)}
          />
        )}

        {/* Goals Grid */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {goals.map((goal) => {
              const current = BigInt(goal.currentAmountPaise || 0);
              const target = BigInt(goal.targetAmountPaise || 1);
              const pct = calculatePercentage(current, target);
              const remaining = target > current ? target - current : BigInt(0);
              const isCompleted = goal.status === "COMPLETED" || current >= target;
              const isShowingHistory = activeHistoryGoalId === goal.id;

              return (
                <Card key={goal.id} hover className="flex flex-col justify-between">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                          style={{ backgroundColor: goal.color || "#10b981" }}
                        >
                          <Target className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                            {goal.name}
                          </h4>
                          {isCompleted ? (
                            <Badge variant="success" size="sm" className="mt-0.5">
                              <CheckCircle2 className="w-3 h-3" />
                              Goal Completed!
                            </Badge>
                          ) : (
                            <Badge variant="info" size="sm" className="mt-0.5">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                            setGoalModalOpen(true);
                          }}
                          className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Figures */}
                    <div className="mt-4">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl font-black text-slate-900 dark:text-slate-100">
                          {formatCurrency(current)}
                        </span>
                        <span className="text-xs text-slate-400">
                          of {formatCurrency(target)}
                        </span>
                      </div>

                      {/* Progress Bar */}
                      <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: goal.color || "#10b981",
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs text-slate-500 mt-2 font-medium">
                        <span>{pct}% achieved</span>
                        <span>{formatCurrency(remaining)} remaining</span>
                      </div>
                    </div>

                    {/* Target Date */}
                    {goal.targetDate && (
                      <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-3">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>Target: {formatDate(goal.targetDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons & Contribution History Toggle */}
                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setContributionModalOpen(true);
                        }}
                        variant="primary"
                        size="sm"
                        className="flex-1 font-semibold"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        Add Savings
                      </Button>

                      {goal.contributions && goal.contributions.length > 0 && (
                        <Button
                          onClick={() =>
                            setActiveHistoryGoalId(
                              isShowingHistory ? null : goal.id
                            )
                          }
                          variant="outline"
                          size="sm"
                        >
                          <History className="w-3.5 h-3.5" />
                          {goal.contributions.length}
                        </Button>
                      )}
                    </div>

                    {/* Expandable Contribution History */}
                    {isShowingHistory && goal.contributions && (
                      <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl space-y-1.5 max-h-36 overflow-y-auto text-xs animate-in fade-in duration-150">
                        <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          Contribution Log
                        </div>
                        {goal.contributions.map((c: any) => (
                          <div
                            key={c.id}
                            className="flex items-center justify-between py-1 border-b border-slate-200/50 dark:border-slate-700/50 last:border-0"
                          >
                            <div>
                              <span className="font-semibold text-slate-700 dark:text-slate-300">
                                {formatCurrency(c.amountPaise)}
                              </span>
                              {c.account && (
                                <span className="text-[10px] text-slate-400 ml-1">
                                  via {c.account.name}
                                </span>
                              )}
                            </div>
                            <span className="text-[10px] text-slate-400">
                              {formatDate(c.date)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSuccess={fetchGoals}
        initialData={editingGoal}
      />

      <ContributionModal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        onSuccess={fetchGoals}
        goal={selectedGoal}
        accounts={accounts}
      />
    </AppShell>
  );
}

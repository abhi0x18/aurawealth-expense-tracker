"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { GoalModal } from "@/components/goals/GoalModal";
import { ContributionModal } from "@/components/goals/ContributionModal";
import { Target3DProp } from "@/components/ui/FinancialProps";
import { useCurrency } from "@/context/CurrencyContext";
import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { triggerConfetti, triggerGoalCelebration } from "@/lib/confetti";
import { calculatePercentage } from "@/lib/money";
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
  Sparkles,
  ArrowUpRight,
} from "lucide-react";

export default function GoalsPage() {
  const { formatMoney } = useCurrency();
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

  const totalSavedPaise = goals.reduce((acc, g) => acc + BigInt(g.currentAmountPaise || 0), BigInt(0));
  const totalTargetPaise = goals.reduce((acc, g) => acc + BigInt(g.targetAmountPaise || 0), BigInt(0));
  const overallProgressPct = totalTargetPaise > BigInt(0) ? calculatePercentage(totalSavedPaise, totalTargetPaise) : 0;

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Savings Targets &amp; Milestones
              <span className="text-xs px-3 py-1 rounded-full bg-blue-500/15 text-blue-600 dark:text-blue-400 font-mono font-bold border border-blue-500/30">
                Wealth Vault
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Commit funds toward vacations, investments, and life milestones with linked account allocations.
            </p>
          </div>

          <Button
            onClick={() => {
              setEditingGoal(null);
              setGoalModalOpen(true);
            }}
            variant="primary"
            size="md"
            className="rounded-2xl font-bold text-sm px-6 py-3 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
            New Savings Goal
          </Button>
        </div>

        {/* 3D Milestone Overview Banner with Target3DProp */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-blue-950 via-indigo-950 to-slate-950 border border-blue-500/30 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-extrabold text-blue-400">
                <Sparkles className="w-4 h-4" />
                Aggregated Savings Progress
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black text-white tracking-tight drop-shadow-lg">
                <AnimatedCounter valuePaise={totalSavedPaise} />
                <span className="text-xl sm:text-2xl font-bold text-slate-400 ml-3">
                  / {formatMoney(totalTargetPaise)}
                </span>
              </h2>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-56 h-3 bg-slate-800 rounded-full overflow-hidden border border-white/10 p-0.5">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-400 rounded-full transition-all duration-700 shadow-md"
                    style={{ width: `${Math.min(overallProgressPct, 100)}%` }}
                  />
                </div>
                <span className="text-sm font-mono font-bold text-emerald-400">{overallProgressPct}% Achieved</span>
              </div>
            </div>

            {/* 3D Target Graphic Prop */}
            <div className="flex items-center justify-center sm:justify-end">
              <Target3DProp className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>

        {/* Empty State */}
        {!loading && goals.length === 0 && (
          <div className="text-center py-20 px-6 bg-white/80 dark:bg-slate-900/50 rounded-3xl border border-slate-200/80 dark:border-white/10 backdrop-blur-xl shadow-xl">
            <Target3DProp className="w-28 h-28 mx-auto mb-5 animate-float" />
            <h3 className="text-2xl font-display font-extrabold text-slate-900 dark:text-white">
              No savings goals created yet
            </h3>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-2 mb-8 leading-relaxed font-normal">
              Create dedicated goals for emergency funds, vacations, or gadget upgrades to watch your net worth grow.
            </p>
            <Button
              onClick={() => setGoalModalOpen(true)}
              variant="primary"
              size="lg"
              className="rounded-2xl font-bold text-base px-8 py-4 shadow-xl shadow-emerald-500/25"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              Set Your First Goal
            </Button>
          </div>
        )}

        {/* Goals Grid */}
        {goals.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {goals.map((goal) => {
              const current = BigInt(goal.currentAmountPaise || 0);
              const target = BigInt(goal.targetAmountPaise || 1);
              const pct = calculatePercentage(current, target);
              const remaining = target > current ? target - current : BigInt(0);
              const isCompleted = goal.status === "COMPLETED" || current >= target;
              const isShowingHistory = activeHistoryGoalId === goal.id;

              return (
                <Card key={goal.id} hover className="flex flex-col justify-between p-7 relative overflow-hidden group rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl">
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3.5">
                        <div
                          className="w-13 h-13 p-3 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-105 transition-transform"
                          style={{ backgroundColor: goal.color || "#10b981" }}
                        >
                          <Target className="w-6 h-6 drop-shadow" />
                        </div>
                        <div>
                          <h4 className="text-base font-display font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                            {goal.name}
                          </h4>
                          {isCompleted ? (
                            <Badge variant="success" size="sm" className="mt-1 font-mono font-bold text-xs shadow-xs">
                              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                              Goal Completed!
                            </Badge>
                          ) : (
                            <Badge variant="info" size="sm" className="mt-1 font-mono font-bold text-xs">
                              In Progress
                            </Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => {
                            setEditingGoal(goal);
                            setGoalModalOpen(true);
                          }}
                          className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(goal.id)}
                          className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {goal.description && (
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-3.5 leading-relaxed font-normal">
                        {goal.description}
                      </p>
                    )}

                    {/* Progress Numbers */}
                    <div className="mt-6">
                      <div className="flex items-baseline justify-between">
                        <span className="text-2xl sm:text-3xl font-mono font-black text-slate-900 dark:text-white tracking-tight">
                          {formatMoney(current)}
                        </span>
                        <span className="text-sm font-mono font-bold text-slate-400">
                          of {formatMoney(target)}
                        </span>
                      </div>

                      {/* 3D Glowing Progress Bar */}
                      <div className="w-full h-3.5 bg-slate-100 dark:bg-slate-800/90 rounded-full overflow-hidden mt-3 p-0.5 border border-slate-200/80 dark:border-white/5">
                        <div
                          className="h-full rounded-full transition-all duration-700 shadow-md"
                          style={{
                            width: `${Math.min(pct, 100)}%`,
                            backgroundColor: goal.color || "#10b981",
                            boxShadow: `0 0 14px ${goal.color || "#10b981"}70`,
                          }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2.5 font-semibold">
                        <span className="text-emerald-500 dark:text-emerald-400 font-mono font-bold">{pct}% reached</span>
                        <span className="font-mono">{formatMoney(remaining)} left</span>
                      </div>
                    </div>

                    {/* Target Date */}
                    {goal.targetDate && (
                      <div className="flex items-center gap-2 text-xs sm:text-sm text-slate-400 mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 font-medium">
                        <Calendar className="w-4 h-4 text-blue-400" />
                        <span>Target: {formatDate(goal.targetDate)}</span>
                      </div>
                    )}
                  </div>

                  {/* Actions & Contribution Button */}
                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-white/10 space-y-2.5">
                    <div className="flex items-center gap-2.5">
                      <Button
                        onClick={() => {
                          setSelectedGoal(goal);
                          setContributionModalOpen(true);
                        }}
                        variant="primary"
                        size="sm"
                        className="flex-1 font-bold rounded-2xl shadow-lg shadow-emerald-500/20 text-xs py-2.5"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        Deposit Funds
                      </Button>

                      <Button
                        onClick={() =>
                          setActiveHistoryGoalId(
                            isShowingHistory ? null : goal.id
                          )
                        }
                        variant="outline"
                        size="sm"
                        className="rounded-2xl border-slate-200 dark:border-white/10 text-slate-500 hover:text-slate-800 dark:hover:text-white p-2.5"
                      >
                        <History className="w-4 h-4" />
                      </Button>
                    </div>

                    {/* Expanded Contribution History */}
                    {isShowingHistory && (
                      <div className="mt-3 p-3.5 bg-slate-50 dark:bg-slate-950/70 rounded-2xl border border-slate-200/80 dark:border-white/5 space-y-2 max-h-48 overflow-y-auto">
                        <div className="text-xs uppercase font-mono font-bold text-slate-400 tracking-wider">
                          Recent Contributions
                        </div>
                        {(!goal.contributions || goal.contributions.length === 0) ? (
                          <p className="text-xs text-slate-400 py-1">No deposits logged yet.</p>
                        ) : (
                          goal.contributions.map((c: any) => (
                            <div
                              key={c.id}
                              className="flex items-center justify-between text-xs py-1.5 border-b border-slate-100 dark:border-white/5 last:border-0"
                            >
                              <div>
                                <span className="font-mono font-bold text-slate-800 dark:text-slate-100">
                                  {formatMoney(c.amountPaise)}
                                </span>
                                {c.notes && (
                                  <span className="text-[11px] text-slate-400 block">
                                    {c.notes}
                                  </span>
                                )}
                              </div>
                              <span className="text-xs text-slate-400">
                                {formatDate(c.date)}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Goal Modal */}
      <GoalModal
        isOpen={goalModalOpen}
        onClose={() => setGoalModalOpen(false)}
        onSuccess={() => {
          triggerConfetti();
          fetchGoals();
        }}
        initialData={editingGoal}
      />

      {/* Contribution Modal */}
      <ContributionModal
        isOpen={contributionModalOpen}
        onClose={() => setContributionModalOpen(false)}
        onSuccess={() => {
          triggerGoalCelebration();
          fetchGoals();
        }}
        goal={selectedGoal}
        accounts={accounts}
      />
    </AppShell>
  );
}

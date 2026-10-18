"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AccountModal } from "@/components/accounts/AccountModal";
import { TransferModal } from "@/components/accounts/TransferModal";
import { CreditCardVisualizer } from "@/components/ui/CreditCardVisualizer";
import { Vault3DProp } from "@/components/ui/FinancialProps";
import { useCurrency } from "@/context/CurrencyContext";
import { triggerConfetti } from "@/lib/confetti";
import {
  Landmark,
  Banknote,
  Smartphone,
  PiggyBank,
  CreditCard,
  Coins,
  Plus,
  ArrowLeftRight,
  Edit2,
  Trash2,
  Archive,
  AlertCircle,
  Sparkles,
} from "lucide-react";

export default function AccountsPage() {
  const { formatMoney } = useCurrency();
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [accountModalOpen, setAccountModalOpen] = useState(false);
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<any>(null);
  const [sourceAccountId, setSourceAccountId] = useState<string>("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchAccounts = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/accounts");
      const data = await res.json();
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error("Failed to fetch accounts:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const getAccountIcon = (type: string) => {
    switch (type) {
      case "BANK":
        return Landmark;
      case "CASH":
        return Banknote;
      case "UPI_WALLET":
        return Smartphone;
      case "SAVINGS":
        return PiggyBank;
      case "CREDIT_CARD":
        return CreditCard;
      default:
        return Coins;
    }
  };

  const getThemeForIndex = (index: number): "emerald" | "obsidian" | "sapphire" | "amethyst" => {
    const themes: ("emerald" | "obsidian" | "sapphire" | "amethyst")[] = [
      "emerald",
      "sapphire",
      "obsidian",
      "amethyst",
    ];
    return themes[index % themes.length];
  };

  const handleArchiveToggle = async (account: any) => {
    const action = account.isArchived ? "unarchive" : "archive";
    if (confirm(`Are you sure you want to ${action} ${account.name}?`)) {
      try {
        await fetch(`/api/accounts/${account.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isArchived: !account.isArchived }),
        });
        fetchAccounts();
      } catch (err) {
        console.error("Failed to toggle archive:", err);
      }
    }
  };

  const handleDelete = async (id: string) => {
    setErrorMessage(null);
    if (confirm("Are you sure you want to delete this account? Only accounts with no transaction history can be deleted.")) {
      try {
        const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          setErrorMessage(data.error || "Failed to delete account");
          return;
        }
        fetchAccounts();
      } catch (err: any) {
        setErrorMessage(err.message || "Failed to delete account");
      }
    }
  };

  const activeAccounts = accounts.filter((a) => !a.isArchived);
  const archivedAccounts = accounts.filter((a) => a.isArchived);

  const totalBalance = activeAccounts.reduce(
    (sum, a) => sum + BigInt(a.currentBalancePaise || 0),
    BigInt(0)
  );

  return (
    <AppShell>
      <div className="space-y-10 pb-16">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
              Accounts &amp; 3D Deck
              <span className="text-xs px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-mono font-bold border border-emerald-500/30">
                Interactive
              </span>
            </h1>
            <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1 font-normal">
              Hover over cards to trigger 3D perspective tilt. Execute seamless double-entry transfers.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              onClick={() => {
                setSourceAccountId(activeAccounts[0]?.id || "");
                setTransferModalOpen(true);
              }}
              variant="outline"
              size="md"
              className="rounded-2xl font-bold text-sm px-5 py-3 border-slate-200 dark:border-white/10 hover:border-emerald-500/50 shadow-sm"
              disabled={activeAccounts.length < 2}
            >
              <ArrowLeftRight className="w-4 h-4 text-emerald-500 stroke-[2.5]" />
              Transfer Money
            </Button>

            <Button
              onClick={() => {
                setEditingAccount(null);
                setAccountModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-2xl font-bold text-sm px-6 py-3 shadow-xl shadow-emerald-500/25 hover:scale-105 active:scale-95 transition-all"
            >
              <Plus className="w-5 h-5 stroke-[2.5]" />
              New Account
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-2xl text-sm text-rose-700 dark:text-rose-300 flex items-center gap-3 font-semibold">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* 3D Total Net Balance Banner with Vault Prop */}
        <div className="relative rounded-3xl p-8 sm:p-10 bg-gradient-to-r from-emerald-950 via-teal-950 to-slate-950 border border-emerald-500/30 shadow-2xl overflow-hidden animate-shimmer">
          {/* Ambient Glow Orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-xs uppercase tracking-widest font-mono font-extrabold text-emerald-400">
                <Sparkles className="w-4 h-4" />
                Total Liquid Net Worth
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-mono font-black text-white tracking-tight drop-shadow-lg">
                {formatMoney(totalBalance)}
              </h2>
              <p className="text-sm text-emerald-200/90 font-medium">
                Aggregated in real-time across {activeAccounts.length} active account{activeAccounts.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* 3D Vault Illustration Graphic */}
            <div className="flex items-center justify-center sm:justify-end">
              <Vault3DProp className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-2xl animate-float" />
            </div>
          </div>
        </div>

        {/* 3D Interactive Cards Showcase */}
        {activeAccounts.length > 0 && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2.5">
                <span>3D Visualizer Deck</span>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              </h3>
              <span className="text-xs font-mono text-slate-400">Tilt with your cursor</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {activeAccounts.map((account, index) => (
                <CreditCardVisualizer
                  key={account.id}
                  id={account.id}
                  name={account.name}
                  type={account.type}
                  balancePaise={account.currentBalancePaise}
                  theme={getThemeForIndex(index)}
                  onTransferClick={() => {
                    setSourceAccountId(account.id);
                    setTransferModalOpen(true);
                  }}
                  onAddTransactionClick={() => {
                    setEditingAccount(account);
                    setAccountModalOpen(true);
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Detailed Accounts Table / List */}
        <div className="space-y-5">
          <h3 className="text-base font-display font-extrabold text-slate-900 dark:text-white uppercase tracking-wider">
            Ledger Accounts ({activeAccounts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeAccounts.map((account) => {
              const Icon = getAccountIcon(account.type);
              const isNegative = Number(account.currentBalancePaise) < 0;

              return (
                <Card
                  key={account.id}
                  hover
                  className="flex flex-col justify-between p-6 relative overflow-hidden group rounded-3xl border border-slate-200/80 dark:border-white/10 shadow-xl"
                >
                  <div className="flex items-start justify-between relative z-10">
                    <div className="flex items-center gap-4">
                      <div
                        className="w-13 h-13 p-3 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-black/20 group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: account.color || "#10b981" }}
                      >
                        <Icon className="w-6 h-6 drop-shadow" />
                      </div>
                      <div>
                        <h4 className="text-base font-display font-extrabold text-slate-900 dark:text-white group-hover:text-emerald-400 transition-colors">
                          {account.name}
                        </h4>
                        <Badge variant="neutral" size="sm" className="mt-1 font-mono font-bold text-xs">
                          {account.type.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setEditingAccount(account);
                          setAccountModalOpen(true);
                        }}
                        title="Edit account"
                        className="p-2 text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(account)}
                        title="Archive account"
                        className="p-2 text-slate-400 hover:text-amber-500 rounded-xl hover:bg-amber-50 dark:hover:bg-amber-950/40 transition-colors"
                      >
                        <Archive className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        title="Delete account"
                        className="p-2 text-slate-400 hover:text-rose-500 rounded-xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-6 pt-5 border-t border-slate-100 dark:border-white/10 flex items-end justify-between relative z-10">
                    <div>
                      <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
                        Available Balance
                      </span>
                      <div
                        className={`text-2xl font-mono font-black tracking-tight ${
                          isNegative ? "text-rose-500" : "text-slate-900 dark:text-white"
                        }`}
                      >
                        {formatMoney(account.currentBalancePaise)}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSourceAccountId(account.id);
                        setTransferModalOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 font-bold px-3 py-1.5 rounded-xl"
                    >
                      Transfer
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Archived Accounts */}
        {archivedAccounts.length > 0 && (
          <div className="pt-8">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-4">
              Archived Accounts ({archivedAccounts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 opacity-70">
              {archivedAccounts.map((account) => (
                <Card key={account.id} className="p-5 bg-slate-100/50 dark:bg-slate-900/30 rounded-2xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-slate-700 dark:text-slate-300">
                        {account.name}
                      </h4>
                      <p className="text-sm font-mono text-slate-400 mt-1">
                        Balance: {formatMoney(account.currentBalancePaise)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleArchiveToggle(account)}
                      variant="outline"
                      size="sm"
                      className="rounded-xl text-xs font-bold"
                    >
                      Unarchive
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Account Modal */}
      <AccountModal
        isOpen={accountModalOpen}
        onClose={() => setAccountModalOpen(false)}
        onSuccess={() => {
          triggerConfetti();
          fetchAccounts();
        }}
        initialData={editingAccount}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={() => {
          triggerConfetti();
          fetchAccounts();
        }}
        defaultSourceAccountId={sourceAccountId}
        accounts={activeAccounts}
      />
    </AppShell>
  );
}

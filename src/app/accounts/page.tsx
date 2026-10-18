"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { AccountModal } from "@/components/accounts/AccountModal";
import { TransferModal } from "@/components/accounts/TransferModal";
import { formatCurrency } from "@/lib/money";
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
} from "lucide-react";

export default function AccountsPage() {
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
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Accounts & Wallets
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Manage cash, bank balances, cards, and execute inter-account transfers
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <Button
              onClick={() => {
                setSourceAccountId(activeAccounts[0]?.id || "");
                setTransferModalOpen(true);
              }}
              variant="outline"
              size="md"
              className="rounded-xl font-semibold"
              disabled={activeAccounts.length < 2}
            >
              <ArrowLeftRight className="w-4 h-4" />
              Transfer Money
            </Button>

            <Button
              onClick={() => {
                setEditingAccount(null);
                setAccountModalOpen(true);
              }}
              variant="primary"
              size="md"
              className="rounded-xl font-semibold shadow-sm"
            >
              <Plus className="w-4 h-4" />
              New Account
            </Button>
          </div>
        </div>

        {errorMessage && (
          <div className="p-3.5 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Total Net Balance Banner */}
        <Card className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 rounded-2xl shadow-lg shadow-emerald-600/10 border-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-wider font-bold text-emerald-100">
                Total Available Net Worth
              </p>
              <h2 className="text-3xl font-black tracking-tight mt-1">
                {formatCurrency(totalBalance)}
              </h2>
              <p className="text-xs text-emerald-100/90 mt-1">
                Calculated across {activeAccounts.length} active account{activeAccounts.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  setSourceAccountId(activeAccounts[0]?.id || "");
                  setTransferModalOpen(true);
                }}
                variant="secondary"
                size="sm"
                className="bg-white/10 hover:bg-white/20 text-white border-0 backdrop-blur-md"
                disabled={activeAccounts.length < 2}
              >
                <ArrowLeftRight className="w-3.5 h-3.5" />
                Inter-Account Transfer
              </Button>
            </div>
          </div>
        </Card>

        {/* Active Accounts Grid */}
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
            Active Accounts ({activeAccounts.length})
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeAccounts.map((account) => {
              const Icon = getAccountIcon(account.type);
              const isNegative = Number(account.currentBalancePaise) < 0;

              return (
                <Card
                  key={account.id}
                  hover
                  className="flex flex-col justify-between relative overflow-hidden"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: account.color || "#3b82f6" }}
                      >
                        <Icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                          {account.name}
                        </h4>
                        <Badge variant="neutral" size="sm" className="mt-0.5">
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
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleArchiveToggle(account)}
                        title="Archive account"
                        className="p-1.5 text-slate-400 hover:text-amber-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Archive className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDelete(account.id)}
                        title="Delete account"
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-end justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400">
                        Current Balance
                      </span>
                      <div
                        className={`text-xl font-black tracking-tight ${
                          isNegative ? "text-rose-600 dark:text-rose-400" : "text-slate-900 dark:text-slate-100"
                        }`}
                      >
                        {formatCurrency(account.currentBalancePaise)}
                      </div>
                    </div>

                    <Button
                      onClick={() => {
                        setSourceAccountId(account.id);
                        setTransferModalOpen(true);
                      }}
                      variant="ghost"
                      size="sm"
                      className="text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 px-2 py-1"
                    >
                      Transfer
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Archived Accounts (if any) */}
        {archivedAccounts.length > 0 && (
          <div className="pt-4">
            <h3 className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-3">
              Archived Accounts ({archivedAccounts.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 opacity-70">
              {archivedAccounts.map((account) => (
                <Card key={account.id} className="bg-slate-50 dark:bg-slate-800/40">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                        {account.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        Balance: {formatCurrency(account.currentBalancePaise)}
                      </p>
                    </div>
                    <Button
                      onClick={() => handleArchiveToggle(account)}
                      variant="outline"
                      size="sm"
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
        onSuccess={fetchAccounts}
        initialData={editingAccount}
      />

      {/* Transfer Modal */}
      <TransferModal
        isOpen={transferModalOpen}
        onClose={() => setTransferModalOpen(false)}
        onSuccess={fetchAccounts}
        defaultSourceAccountId={sourceAccountId}
        accounts={activeAccounts}
      />
    </AppShell>
  );
}

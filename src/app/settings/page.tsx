"use client";

import React, { useState, useEffect } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  User,
  KeyRound,
  Download,
  Upload,
  Trash2,
  ShieldAlert,
  CheckCircle2,
} from "lucide-react";

export default function SettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [name, setName] = useState("");
  const [budgetThreshold, setBudgetThreshold] = useState("80");
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordMsg, setPasswordMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Data reset state
  const [resetPassword, setResetPassword] = useState("");
  const [resetting, setResetting] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ text: string; error: boolean } | null>(null);

  // Backup restore state
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restoring, setRestoring] = useState(false);
  const [restoreMsg, setRestoreMsg] = useState<{ text: string; error: boolean } | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (data.user) {
          setUser(data.user);
          setName(data.user.name || "");
          setBudgetThreshold(data.user.budgetAlertThreshold?.toString() || "80");
        }
      });
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setProfileSaving(true);
    setProfileSuccess(false);

    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          currency: "INR",
          budgetAlertThreshold: parseInt(budgetThreshold, 10),
        }),
      });

      if (res.ok) {
        setProfileSuccess(true);
        setTimeout(() => setProfileSuccess(false), 3000);
      }
    } finally {
      setProfileSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordSaving(true);
    setPasswordMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "CHANGE_PASSWORD",
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setPasswordMsg({ text: data.error || "Password change failed", error: true });
      } else {
        setPasswordMsg({ text: "Password successfully changed!", error: false });
        setCurrentPassword("");
        setNewPassword("");
      }
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleDownloadBackup = () => {
    window.open("/api/backup", "_blank");
  };

  const handleRestoreBackup = async () => {
    if (!restoreFile) return;

    if (!confirm("Restoring this backup will replace current financial data with the backup file records. Proceed?")) {
      return;
    }

    setRestoring(true);
    setRestoreMsg(null);

    try {
      const text = await restoreFile.text();
      const backupData = JSON.parse(text);

      const res = await fetch("/api/backup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ backupData, mode: "REPLACE" }),
      });

      const data = await res.json();
      if (!res.ok) {
        setRestoreMsg({ text: data.error || "Failed to restore backup", error: true });
      } else {
        setRestoreMsg({ text: "Database restored successfully!", error: false });
        setRestoreFile(null);
      }
    } catch (err: any) {
      setRestoreMsg({ text: "Invalid JSON backup file", error: true });
    } finally {
      setRestoring(false);
    }
  };

  const handleResetData = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetPassword) return;

    if (!confirm("WARNING: This will permanently delete all transactions, budgets, goals, and recurring rules. Your account login will remain. Proceed?")) {
      return;
    }

    setResetting(true);
    setResetMsg(null);

    try {
      const res = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "RESET_DATA",
          confirmPassword: resetPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setResetMsg({ text: data.error || "Failed to reset data", error: true });
      } else {
        setResetMsg({ text: "All transactions and financial data have been cleared.", error: false });
        setResetPassword("");
      }
    } finally {
      setResetting(false);
    }
  };

  return (
    <AppShell user={user}>
      <div className="space-y-6 max-w-4xl">
        {/* Top Header */}
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            Settings & Security
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your personal profile, security credentials, data portability, and backups
          </p>
        </div>

        {/* 1. Profile Settings */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Personal Profile
              </h3>
              <p className="text-xs text-slate-400">Account identity and alert preferences</p>
            </div>
          </div>

          <form onSubmit={handleUpdateProfile} className="space-y-4 max-w-lg">
            {profileSuccess && (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4" />
                Profile preferences saved!
              </div>
            )}

            <Input
              label="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Email Address"
              value={user?.email || ""}
              disabled
              helperText="Email cannot be altered once initial setup is finalized"
            />

            <Input
              label="Default Budget Warning Threshold (%)"
              type="number"
              min="10"
              max="100"
              value={budgetThreshold}
              onChange={(e) => setBudgetThreshold(e.target.value)}
              helperText="Dashboard alerts trigger when spending hits this percentage"
            />

            <Button type="submit" variant="primary" size="md" loading={profileSaving}>
              Save Profile Preferences
            </Button>
          </form>
        </Card>

        {/* 2. Security: Password Change */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Change Password
              </h3>
              <p className="text-xs text-slate-400">Update your local master authentication password</p>
            </div>
          </div>

          <form onSubmit={handleChangePassword} className="space-y-4 max-w-lg">
            {passwordMsg && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  passwordMsg.error
                    ? "bg-rose-50 dark:bg-rose-950/40 border-rose-200 text-rose-700"
                    : "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-700"
                }`}
              >
                {passwordMsg.text}
              </div>
            )}

            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />

            <Input
              label="New Password"
              type="password"
              required
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />

            <Button type="submit" variant="secondary" size="md" loading={passwordSaving}>
              Update Password
            </Button>
          </form>
        </Card>

        {/* 3. Data Portability & Backup */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-sky-50 dark:bg-sky-950/50 text-sky-600 dark:text-sky-400 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Complete Data Backup & Restore
              </h3>
              <p className="text-xs text-slate-400">Export or restore all financial records in portable JSON format</p>
            </div>
          </div>

          <div className="space-y-6 max-w-lg">
            {/* Download Backup */}
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Full JSON Backup
                </h4>
                <p className="text-[11px] text-slate-400">
                  Accounts, categories, transactions, budgets, goals, and rules.
                </p>
              </div>
              <Button onClick={handleDownloadBackup} variant="outline" size="sm">
                <Download className="w-3.5 h-3.5" />
                Download
              </Button>
            </div>

            {/* Restore Backup */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800 rounded-xl space-y-3">
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  Restore from JSON Backup
                </h4>
                <p className="text-[11px] text-slate-400">
                  Upload a previously generated PaisaPilot backup JSON file.
                </p>
              </div>

              {restoreMsg && (
                <div
                  className={`p-2.5 rounded-lg border text-xs ${
                    restoreMsg.error
                      ? "bg-rose-50 border-rose-200 text-rose-700"
                      : "bg-emerald-50 border-emerald-200 text-emerald-700"
                  }`}
                >
                  {restoreMsg.text}
                </div>
              )}

              <input
                type="file"
                accept=".json"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setRestoreFile(e.target.files[0]);
                  }
                }}
                className="text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 dark:file:bg-sky-950 dark:file:text-sky-300"
              />

              {restoreFile && (
                <div className="pt-2">
                  <Button
                    onClick={handleRestoreBackup}
                    variant="primary"
                    size="sm"
                    loading={restoring}
                  >
                    <Upload className="w-3.5 h-3.5 mr-1" />
                    Execute Restore
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 4. Danger Zone: Data Reset */}
        <Card className="p-6 border-rose-200 dark:border-rose-900/40">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-700 dark:text-rose-400">
                Danger Zone • Reset Financial Records
              </h3>
              <p className="text-xs text-slate-400">Permanently erase transactions and start clean</p>
            </div>
          </div>

          <form onSubmit={handleResetData} className="space-y-4 max-w-lg">
            {resetMsg && (
              <div
                className={`p-3 rounded-xl border text-xs ${
                  resetMsg.error
                    ? "bg-rose-50 border-rose-200 text-rose-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700"
                }`}
              >
                {resetMsg.text}
              </div>
            )}

            <p className="text-xs text-slate-500 leading-relaxed">
              This will permanently delete all recorded transactions, monthly budgets, savings contributions, and recurring rules. Account definitions and login credentials will be kept.
            </p>

            <Input
              label="Confirm Master Password"
              type="password"
              placeholder="Enter password to confirm wipe"
              required
              value={resetPassword}
              onChange={(e) => setResetPassword(e.target.value)}
            />

            <Button type="submit" variant="danger" size="md" loading={resetting}>
              <Trash2 className="w-4 h-4 mr-1" />
              Wipe All Transactions
            </Button>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}

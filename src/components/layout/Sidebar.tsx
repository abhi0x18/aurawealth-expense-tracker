"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Landmark,
  PieChart,
  Repeat,
  PiggyBank,
  BarChart3,
  Tags,
  Settings,
  X,
  Compass,
  Sparkles,
} from "lucide-react";
import { APP_CONFIG } from "@/config/app";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/accounts", label: "Accounts & Cards", icon: Landmark },
  { href: "/budgets", label: "Budgets", icon: PieChart },
  { href: "/recurring", label: "Recurring & Bills", icon: Repeat },
  { href: "/goals", label: "Savings Goals", icon: PiggyBank },
  { href: "/reports", label: "Reports & Analytics", icon: BarChart3 },
  { href: "/categories", label: "Categories & Tags", icon: Tags },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Glassmorphic Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white/80 dark:bg-slate-950/75 backdrop-blur-2xl border-r border-slate-200/80 dark:border-white/10 flex flex-col transition-all duration-300 ease-in-out lg:translate-x-0 shadow-2xl ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Ambient Top Glow in Sidebar */}
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200/60 dark:border-white/10 relative z-10">
          <Link href="/" className="flex items-center gap-3 group" onClick={onClose}>
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-emerald-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/30 transition-transform group-hover:scale-105 group-hover:rotate-6">
              <Compass className="w-5 h-5 drop-shadow" />
            </div>
            <div>
              <span className="font-black text-base tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-1">
                {APP_CONFIG.name}
              </span>
              <span className="block text-[10px] text-emerald-600 dark:text-emerald-400 font-bold tracking-wider uppercase -mt-0.5">
                Financial OS
              </span>
            </div>
          </Link>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-xl lg:hidden hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-5 space-y-1.5 overflow-y-auto relative z-10">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onClose}
                className={`relative flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition-all group ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/15 to-teal-500/10 dark:from-emerald-500/20 dark:to-teal-500/10 text-emerald-700 dark:text-emerald-300 shadow-sm border border-emerald-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100/70 dark:hover:bg-slate-800/50"
                }`}
              >
                {/* Active Left Indicator Bar */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1.5 bg-gradient-to-b from-emerald-400 to-teal-500 rounded-r-full shadow-sm shadow-emerald-500/50" />
                )}

                <div className={`p-1.5 rounded-xl transition-colors ${isActive ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200"}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Local-first Badge / Footer */}
        <div className="p-4 border-t border-slate-200/60 dark:border-white/10 relative z-10">
          <div className="p-3.5 bg-slate-100/80 dark:bg-slate-900/60 rounded-2xl border border-slate-200/80 dark:border-white/10 backdrop-blur-md shadow-inner">
            <div className="flex items-center justify-between text-xs font-bold text-slate-800 dark:text-slate-200">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400 animate-pulse" />
                Offline-First SQLite
              </span>
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
              100% private ledger. Zero cloud trackers.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
}

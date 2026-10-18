"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Menu,
  Plus,
  Search,
  Sun,
  Moon,
  LogOut,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useCurrency, CurrencyCode } from "@/context/CurrencyContext";

interface HeaderProps {
  onOpenMobileMenu: () => void;
  onOpenQuickAdd: () => void;
  onOpenSearch: () => void;
  userName?: string;
}

export function Header({
  onOpenMobileMenu,
  onOpenQuickAdd,
  onOpenSearch,
  userName = "User",
}: HeaderProps) {
  const router = useRouter();
  const { currency, setCurrency } = useCurrency();
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [loggingOut, setLoggingOut] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
      setTheme("light");
    }
  };

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
    }
  };

  return (
    <header className="h-18 bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 sm:px-6 lg:px-8 shadow-sm">
      {/* Mobile Menu & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger with 3D glass effect */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-4 py-2.5 text-sm sm:text-base text-slate-400 bg-slate-100/90 dark:bg-slate-900/90 hover:bg-slate-200/80 dark:hover:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-white/10 transition-all shadow-inner w-52 sm:w-80 group"
        >
          <Search className="w-4 h-4 text-slate-400 group-hover:text-emerald-400 transition-colors shrink-0" />
          <span className="flex-1 text-left truncate text-slate-600 dark:text-slate-200 font-semibold">Search ledger...</span>
          <kbd className="hidden sm:inline-block px-2.5 py-0.5 text-xs font-mono font-bold text-slate-500 dark:text-slate-300 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Action Controls: Currency Switcher, Theme, Quick Add, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Currency Switcher Pill Group */}
        <div
          className="flex items-center bg-slate-100 dark:bg-slate-900/90 p-1 rounded-full border border-slate-200/80 dark:border-white/10 shadow-inner"
          role="group"
          aria-label="Currency Selector"
        >
          {(["INR", "USD", "EUR"] as CurrencyCode[]).map((c) => {
            const symbols: Record<CurrencyCode, string> = { INR: "₹ INR", USD: "$ USD", EUR: "€ EUR" };
            const isActive = currency === c;
            return (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`px-3 py-1.5 rounded-full text-xs font-mono font-black transition-all ${
                  isActive
                    ? "bg-white dark:bg-slate-800 text-emerald-600 dark:text-emerald-400 shadow-sm ring-1 ring-emerald-500/30"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {symbols[c]}
              </button>
            );
          })}
        </div>

        {/* Quick Add Button with 3D gradient & shadow */}
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="sm"
          className="shadow-lg shadow-emerald-500/25 font-extrabold text-sm sm:text-base px-5 py-2.5 rounded-2xl transition-all hover:scale-105 active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="w-10 h-10 rounded-2xl flex items-center justify-center bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-amber-400 hover:scale-105 active:scale-95 transition-all border border-slate-200/80 dark:border-white/10"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
        </button>

        {/* User Badge with 3D Avatar gradient & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80 dark:border-white/10">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-indigo-600 p-0.5 shadow-md shadow-emerald-500/20 hidden sm:flex items-center justify-center">
            <div className="w-full h-full rounded-[14px] bg-slate-900 flex items-center justify-center text-sm font-black text-emerald-400">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
              {userName}
            </span>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              Pro Vault
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out of AuraWealth"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

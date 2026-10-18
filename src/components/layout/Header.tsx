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
    <header className="h-16 bg-white/70 dark:bg-slate-950/70 backdrop-blur-2xl border-b border-slate-200/80 dark:border-white/10 sticky top-0 z-30 flex items-center justify-between px-4 lg:px-8 shadow-xs">
      {/* Mobile Menu & Search trigger */}
      <div className="flex items-center gap-3">
        <button
          onClick={onOpenMobileMenu}
          className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 lg:hidden rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Global Search Bar Trigger with 3D glass effect */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-2.5 px-3.5 py-1.5 text-xs text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-white/10 transition-all shadow-xs w-44 sm:w-72 group"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span className="flex-1 text-left truncate text-slate-500 dark:text-slate-400">Search transactions...</span>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono font-bold text-slate-400 bg-white/80 dark:bg-slate-800/80 rounded-lg border border-slate-200/80 dark:border-white/10 shadow-2xs">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Action Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Add Button with 3D shadow */}
        <Button
          onClick={onOpenQuickAdd}
          variant="primary"
          size="sm"
          className="shadow-lg shadow-emerald-500/25 font-bold rounded-2xl transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </Button>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-all"
        >
          {theme === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4 text-amber-400" />}
        </button>

        {/* User Badge with 3D Avatar gradient & Logout */}
        <div className="flex items-center gap-2.5 pl-3 border-l border-slate-200/80 dark:border-white/10">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-md shadow-emerald-500/20 hidden sm:flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-slate-900 flex items-center justify-center text-[11px] font-black text-emerald-400">
              {userName.charAt(0).toUpperCase()}
            </div>
          </div>

          <div className="hidden sm:flex flex-col text-left">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {userName}
            </span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5">
              <Sparkles className="w-2.5 h-2.5" />
              Pro Plan
            </span>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out of PaisaPilot"
            className="p-2 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 rounded-2xl hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors ml-1"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}

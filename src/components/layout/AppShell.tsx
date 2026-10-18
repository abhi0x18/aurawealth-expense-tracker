"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { GlobalSearchModal } from "@/components/modals/GlobalSearchModal";

interface AppShellProps {
  children: React.ReactNode;
  user?: {
    name: string;
    email: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K opens search, '+' opens quick add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input or textarea
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.isContentEditable
      ) {
        return;
      }

      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      } else if (e.key === "+" || (e.shiftKey && e.key === "=")) {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#030712] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row relative overflow-x-hidden bg-grid-pattern">
      {/* Dynamic 3D Ambient Glowing Mesh Orbs */}
      <div className="fixed top-[-10%] left-[20%] w-[500px] h-[500px] rounded-full bg-emerald-500/10 dark:bg-emerald-500/8 blur-[120px] pointer-events-none" />
      <div className="fixed bottom-[-10%] right-[10%] w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/6 blur-[140px] pointer-events-none" />
      <div className="fixed top-[40%] right-[30%] w-[350px] h-[350px] rounded-full bg-purple-500/5 dark:bg-purple-500/5 blur-[100px] pointer-events-none" />

      {/* Sidebar */}
      <Sidebar
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0 min-h-screen relative z-10">
        <Header
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
          onOpenQuickAdd={() => setQuickAddOpen(true)}
          onOpenSearch={() => setSearchOpen(true)}
          userName={user?.name || "User"}
        />

        <main className="flex-1 p-4 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSuccess={() => {
          window.dispatchEvent(new Event("transaction-updated"));
        }}
      />

      {/* Global Search Modal */}
      <GlobalSearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
      />
    </div>
  );
}

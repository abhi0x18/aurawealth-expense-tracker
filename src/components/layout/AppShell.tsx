"use client";

import React, { useState, useEffect } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { TransactionModal } from "@/components/modals/TransactionModal";
import { GlobalSearchModal } from "@/components/modals/GlobalSearchModal";
import { CurrencyProvider } from "@/context/CurrencyContext";

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

  // Mouse move listener for 3D tilt glare specular coordinates across all tilt cards
  useEffect(() => {
    const handlePointerMove = (e: MouseEvent) => {
      const cards = document.querySelectorAll<HTMLElement>(".tilt-card");
      cards.forEach((card) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        card.style.setProperty("--mouse-x", `${x}px`);
        card.style.setProperty("--mouse-y", `${y}px`);
      });
    };

    window.addEventListener("pointermove", handlePointerMove);
    return () => window.removeEventListener("pointermove", handlePointerMove);
  }, []);

  // Keyboard shortcut listener: Ctrl+K or Cmd+K opens search, '+' opens quick add
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
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
    <CurrencyProvider>
      <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row relative overflow-x-hidden">
        {/* Ambient Spatial Mesh Gradient Glow */}
        <div className="ambient-mesh" />

        {/* Sidebar */}
        <Sidebar
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
        />

        {/* Main Content Area */}
        <div className="flex-1 lg:pl-72 flex flex-col min-w-0 min-h-screen relative z-10">
          <Header
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenQuickAdd={() => setQuickAddOpen(true)}
            onOpenSearch={() => setSearchOpen(true)}
            userName={user?.name || "User"}
          />

          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
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
    </CurrencyProvider>
  );
}

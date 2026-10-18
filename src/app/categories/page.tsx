"use client";

import React, { useState, useEffect, useCallback } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Plus, Tag, Edit2, Trash2, AlertCircle } from "lucide-react";

const CATEGORY_COLORS = [
  "#f97316",
  "#3b82f6",
  "#8b5cf6",
  "#eab308",
  "#ec4899",
  "#ef4444",
  "#6366f1",
  "#a855f7",
  "#06b6d4",
  "#14b8a6",
  "#10b981",
  "#64748b",
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [name, setName] = useState("");
  const [color, setColor] = useState("#f97316");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      setCategories(data.categories || []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleOpenModal = (cat?: any) => {
    setError(null);
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setColor(cat.color || "#f97316");
    } else {
      setEditingCategory(null);
      setName("");
      setColor(activeTab === "EXPENSE" ? "#f97316" : "#10b981");
    }
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        type: editingCategory ? editingCategory.type : activeTab,
        color,
      };

      const url = editingCategory ? `/api/categories/${editingCategory.id}` : "/api/categories";
      const method = editingCategory ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save category");
        return;
      }

      setModalOpen(false);
      fetchCategories();
    } catch (err: any) {
      setError(err.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    setError(null);
    if (confirm("Are you sure you want to delete this category?")) {
      try {
        const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
        const data = await res.json();
        if (!res.ok) {
          alert(data.error || "Failed to delete category");
          return;
        }
        fetchCategories();
      } catch (err: any) {
        alert(err.message || "Failed to delete category");
      }
    }
  };

  const currentCategories = categories.filter((c) => c.type === activeTab);

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
              Categories & Tags
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Organize your income and expenses with customizable colors and labels
            </p>
          </div>

          <Button
            onClick={() => handleOpenModal()}
            variant="primary"
            size="md"
            className="rounded-xl font-semibold shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </Button>
        </div>

        {/* Expense vs Income Tabs */}
        <div className="flex items-center gap-2 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl max-w-xs">
          <button
            onClick={() => setActiveTab("EXPENSE")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "EXPENSE"
                ? "bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Expense Categories
          </button>
          <button
            onClick={() => setActiveTab("INCOME")}
            className={`flex-1 py-1.5 text-xs font-bold rounded-lg transition-colors ${
              activeTab === "INCOME"
                ? "bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400"
            }`}
          >
            Income Categories
          </button>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {currentCategories.map((c) => (
            <Card key={c.id} hover className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <span
                  className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                  style={{ backgroundColor: c.color || "#64748b" }}
                />
                <div>
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {c.name}
                  </span>
                  {c.isDefault && (
                    <span className="block text-[10px] text-slate-400">Default Category</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleOpenModal(c)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Category Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? "Edit Category" : `Add ${activeTab.toLowerCase()} Category`}
        maxWidth="sm"
      >
        <form onSubmit={handleSave} className="space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
              {error}
            </div>
          )}

          <Input
            label="Category Name"
            placeholder="e.g. Subscriptions, Freelancing, Fuel"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-2">
              Color Accent
            </label>
            <div className="flex flex-wrap gap-2">
              {CATEGORY_COLORS.map((clr) => (
                <button
                  key={clr}
                  type="button"
                  onClick={() => setColor(clr)}
                  className={`w-7 h-7 rounded-full transition-transform ${
                    color === clr ? "ring-2 ring-offset-2 ring-emerald-500 scale-110" : "hover:scale-105"
                  }`}
                  style={{ backgroundColor: clr }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="outline" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" loading={submitting}>
              {editingCategory ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        </form>
      </Modal>
    </AppShell>
  );
}

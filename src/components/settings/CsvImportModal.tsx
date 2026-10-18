"use client";

import React, { useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Upload, CheckCircle2, FileText } from "lucide-react";

interface CsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function CsvImportModal({ isOpen, onClose, onSuccess }: CsvImportModalProps) {
  const [step, setStep] = useState<"UPLOAD" | "PREVIEW" | "SUCCESS">("UPLOAD");
  const [file, setFile] = useState<File | null>(null);
  const [previewRows, setPreviewRows] = useState<any[]>([]);
  const [importSummary, setImportSummary] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setError(null);
    }
  };

  const handlePreview = async () => {
    if (!file) {
      setError("Please select a CSV file first");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const text = await file.text();
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "PREVIEW", csvContent: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to parse CSV");
        return;
      }

      setPreviewRows(data.preview || []);
      setStep("PREVIEW");
    } catch (err: any) {
      setError(err.message || "Failed to process CSV file");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/transactions/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "COMMIT",
          previewRows,
          fileName: file?.name || "import.csv",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to import records");
        return;
      }

      setImportSummary(data.result);
      setStep("SUCCESS");
      onSuccess();
    } catch (err: any) {
      setError(err.message || "Failed to complete import");
    } finally {
      setLoading(false);
    }
  };

  const validCount = previewRows.filter((r) => r.status === "VALID").length;
  const duplicateCount = previewRows.filter((r) => r.status === "DUPLICATE").length;
  const invalidCount = previewRows.filter((r) => r.status === "INVALID").length;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Transactions from CSV"
      description="Safely import transaction history with automatic validation and duplicate detection"
      maxWidth="xl"
    >
      <div className="space-y-4">
        {error && (
          <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-xl text-xs text-rose-700 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Step 1: Upload */}
        {step === "UPLOAD" && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-6 text-center hover:border-emerald-500 transition-colors">
              <Upload className="w-8 h-8 text-emerald-600 dark:text-emerald-400 mx-auto mb-2" />
              <p className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-1">
                Choose a CSV file to import
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
                Supported columns: Date, Type (EXPENSE/INCOME/TRANSFER), Amount, Account, Category, Merchant, Notes
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 dark:file:bg-emerald-950 dark:file:text-emerald-400 cursor-pointer"
              />
            </div>

            {file && (
              <div className="flex items-center gap-2 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300">
                <FileText className="w-4 h-4 text-emerald-600" />
                <span className="font-semibold">{file.name}</span>
                <span className="text-slate-400">({(file.size / 1024).toFixed(1)} KB)</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <Button variant="outline" size="md" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handlePreview}
                disabled={!file}
                loading={loading}
              >
                Preview & Validate
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Preview & Validation */}
        {step === "PREVIEW" && (
          <div className="space-y-4">
            {/* Stats header */}
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-center">
                <div className="text-lg font-bold text-emerald-600">{validCount}</div>
                <div className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">
                  Ready to Import
                </div>
              </div>
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-xl text-center">
                <div className="text-lg font-bold text-amber-600">{duplicateCount}</div>
                <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-300">
                  Duplicates (Skipped)
                </div>
              </div>
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-center">
                <div className="text-lg font-bold text-rose-600">{invalidCount}</div>
                <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-300">
                  Invalid Rows
                </div>
              </div>
            </div>

            {/* Preview table */}
            <div className="max-h-64 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800 sticky top-0 font-bold text-slate-500">
                  <tr>
                    <th className="p-2.5">Row</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Date</th>
                    <th className="p-2.5">Merchant / Category</th>
                    <th className="p-2.5">Account</th>
                    <th className="p-2.5 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {previewRows.map((r) => (
                    <tr key={r.rowNumber} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="p-2.5 text-slate-400">#{r.rowNumber}</td>
                      <td className="p-2.5">
                        {r.status === "VALID" && (
                          <Badge variant="success" size="sm">
                            Valid
                          </Badge>
                        )}
                        {r.status === "DUPLICATE" && (
                          <Badge variant="warning" size="sm">
                            Duplicate
                          </Badge>
                        )}
                        {r.status === "INVALID" && (
                          <Badge variant="danger" size="sm">
                            Error
                          </Badge>
                        )}
                      </td>
                      <td className="p-2.5 text-slate-600 dark:text-slate-300">{r.date}</td>
                      <td className="p-2.5 font-medium">{r.merchant || r.category || "—"}</td>
                      <td className="p-2.5 text-slate-500">{r.account}</td>
                      <td className="p-2.5 text-right font-bold">₹{r.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex justify-between items-center pt-2">
              <Button variant="outline" size="md" onClick={() => setStep("UPLOAD")}>
                Back to File Selection
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={handleCommit}
                disabled={validCount === 0}
                loading={loading}
              >
                Confirm Import ({validCount} transactions)
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success Report */}
        {step === "SUCCESS" && importSummary && (
          <div className="space-y-4 py-4 text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 mx-auto flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
              CSV Import Completed Successfully!
            </h4>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {importSummary.importedCount} transactions were imported into your database.
              {importSummary.skippedCount > 0 &&
                ` ${importSummary.skippedCount} duplicate entries were skipped.`}
            </p>

            <div className="pt-2">
              <Button variant="primary" size="md" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

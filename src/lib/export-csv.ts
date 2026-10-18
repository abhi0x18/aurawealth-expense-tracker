import { paiseToRupees } from "./money";
import { formatDate } from "./date";

/**
 * Sanitizes cell values to prevent CSV Formula Injection attacks.
 * If a value starts with '=', '+', '-', '@', '\t', or '\r', we prefix with a single quote.
 */
function sanitizeCsvValue(val: string | null | undefined): string {
  if (val === null || val === undefined) return "";
  let str = String(val).trim();
  if (/^[=\+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }
  // Escape quotes if needed
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export interface ExportTransactionItem {
  date: Date;
  type: string;
  amountPaise: bigint;
  account: { name: string };
  toAccount?: { name: string } | null;
  category?: { name: string } | null;
  merchant?: string | null;
  paymentMethod?: string | null;
  notes?: string | null;
  tags?: string | null;
}

export function generateTransactionsCsv(transactions: ExportTransactionItem[]): string {
  const headers = [
    "Date",
    "Type",
    "Amount (INR)",
    "Account",
    "Destination Account",
    "Category",
    "Merchant / Payee",
    "Payment Method",
    "Notes",
    "Tags",
  ];

  const rows = transactions.map((t) => [
    sanitizeCsvValue(formatDate(t.date)),
    sanitizeCsvValue(t.type),
    sanitizeCsvValue(paiseToRupees(t.amountPaise).toFixed(2)),
    sanitizeCsvValue(t.account.name),
    sanitizeCsvValue(t.toAccount ? t.toAccount.name : ""),
    sanitizeCsvValue(t.category ? t.category.name : ""),
    sanitizeCsvValue(t.merchant || ""),
    sanitizeCsvValue(t.paymentMethod || ""),
    sanitizeCsvValue(t.notes || ""),
    sanitizeCsvValue(t.tags || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");
}

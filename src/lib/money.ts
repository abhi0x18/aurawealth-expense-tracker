import { APP_CONFIG } from "@/config/app";

/**
 * Converts any rupee amount (number or string like "1500.50") into exact integer paise as a BigInt.
 * Protects against floating-point inaccuracies like 0.1 + 0.2 !== 0.3.
 */
export function rupeesToPaise(rupees: number | string): bigint {
  if (typeof rupees === "string") {
    rupees = rupees.trim();
    if (!rupees) return BigInt(0);
  }
  const num = typeof rupees === "number" ? rupees : parseFloat(rupees);
  if (isNaN(num)) return BigInt(0);
  // Round to nearest integer paise to eliminate JS IEEE-754 precision issues
  return BigInt(Math.round(num * 100));
}

/**
 * Converts integer paise into a floating-point number for display or calculations.
 */
export function paiseToRupees(paise: bigint | number | string | null | undefined): number {
  if (paise === null || paise === undefined) return 0;
  const p = typeof paise === "bigint" ? Number(paise) : Number(paise);
  return p / 100;
}

/**
 * Formats integer paise into a readable Indian currency string (e.g., ₹1,50,000.00).
 */
export function formatCurrency(
  paise: bigint | number | null | undefined,
  options: {
    showSign?: boolean;
    showSymbol?: boolean;
    compact?: boolean;
    fractionDigits?: number;
  } = {}
): string {
  const {
    showSign = false,
    showSymbol = true,
    compact = false,
    fractionDigits = 2,
  } = options;

  if (paise === null || paise === undefined) {
    return showSymbol ? `${APP_CONFIG.currency.symbol}0.00` : "0.00";
  }

  const numericPaise = typeof paise === "bigint" ? Number(paise) : paise;
  const isNegative = numericPaise < 0;
  const absoluteRupees = Math.abs(numericPaise) / 100;

  if (compact) {
    // Format in Lakhs (L) and Crores (Cr) for Indian users
    if (absoluteRupees >= 10000000) {
      const cr = (absoluteRupees / 10000000).toFixed(2);
      const sym = showSymbol ? APP_CONFIG.currency.symbol : "";
      const sign = isNegative ? "-" : showSign ? "+" : "";
      return `${sign}${sym}${cr} Cr`;
    }
    if (absoluteRupees >= 100000) {
      const lk = (absoluteRupees / 100000).toFixed(2);
      const sym = showSymbol ? APP_CONFIG.currency.symbol : "";
      const sign = isNegative ? "-" : showSign ? "+" : "";
      return `${sign}${sym}${lk} L`;
    }
  }

  const formatted = new Intl.NumberFormat(APP_CONFIG.currency.locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(absoluteRupees);

  const sign = isNegative ? "-" : showSign && numericPaise > 0 ? "+" : "";
  const symbol = showSymbol ? APP_CONFIG.currency.symbol : "";

  return `${sign}${symbol}${formatted}`;
}

/**
 * Calculates percentage consumed, rounded to one decimal place.
 */
export function calculatePercentage(part: bigint | number, total: bigint | number): number {
  const p = typeof part === "bigint" ? Number(part) : part;
  const t = typeof total === "bigint" ? Number(total) : total;
  if (!t || t <= 0) return 0;
  const pct = (p / t) * 100;
  return Math.min(Math.round(pct * 10) / 10, 999);
}

/**
 * Calculates net cash flow (Income - Expenses)
 */
export function calculateNetCashFlow(incomePaise: bigint, expensePaise: bigint): bigint {
  return incomePaise - expensePaise;
}

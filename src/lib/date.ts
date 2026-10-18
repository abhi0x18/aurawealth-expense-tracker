import {
  format,
  startOfMonth,
  endOfMonth,
  subMonths,
  subDays,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns";

export type DateRangePreset =
  | "this-month"
  | "last-month"
  | "last-30-days"
  | "this-year"
  | "all";

export function getDateRangeFromPreset(preset: DateRangePreset): {
  startDate?: Date;
  endDate?: Date;
  label: string;
} {
  const now = new Date();

  switch (preset) {
    case "this-month":
      return {
        startDate: startOfMonth(now),
        endDate: endOfMonth(now),
        label: "This Month",
      };
    case "last-month": {
      const prev = subMonths(now, 1);
      return {
        startDate: startOfMonth(prev),
        endDate: endOfMonth(prev),
        label: "Last Month",
      };
    }
    case "last-30-days":
      return {
        startDate: subDays(now, 30),
        endDate: now,
        label: "Last 30 Days",
      };
    case "this-year":
      return {
        startDate: startOfYear(now),
        endDate: endOfYear(now),
        label: "This Year",
      };
    case "all":
    default:
      return {
        label: "All Time",
      };
  }
}

/**
 * Formats a Date object or ISO string into readable format: "18 Oct 2026"
 */
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "dd MMM yyyy");
}

/**
 * Formats date into "YYYY-MM" month-year string for budgets and comparisons
 */
export function getMonthYearKey(date: Date | string = new Date()): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  return format(d, "yyyy-MM");
}

/**
 * Formats "YYYY-MM" into readable month: "October 2026"
 */
export function formatMonthYear(monthYear: string): string {
  if (!monthYear) return "";
  const [year, month] = monthYear.split("-");
  const d = new Date(parseInt(year, 10), parseInt(month, 10) - 1, 1);
  return format(d, "MMMM yyyy");
}

export const APP_CONFIG = {
  name: "PaisaPilot",
  fullName: "PaisaPilot — Personal Finance Manager",
  tagline: "Track spending, master your cash flow, and achieve financial clarity.",
  currency: {
    code: "INR",
    symbol: "₹",
    locale: "en-IN",
    defaultMinorUnitFactor: 100, // 1 Rupee = 100 Paise
  },
  timezone: "Asia/Kolkata",
  budgetAlertDefaultThreshold: 80, // 80%
  paginationDefaultLimit: 20,
};

export const ACCOUNT_TYPES = [
  { value: "BANK", label: "Bank Account", icon: "Landmark", color: "#3b82f6" },
  { value: "CASH", label: "Cash in Hand", icon: "Banknote", color: "#10b981" },
  { value: "UPI_WALLET", label: "UPI / Digital Wallet", icon: "Smartphone", color: "#8b5cf6" },
  { value: "SAVINGS", label: "Savings & Fixed Deposit", icon: "PiggyBank", color: "#06b6d4" },
  { value: "CREDIT_CARD", label: "Credit Card", icon: "CreditCard", color: "#f43f5e" },
  { value: "OTHER", label: "Other Asset", icon: "Coins", color: "#64748b" },
] as const;

export const PAYMENT_METHODS = [
  { value: "UPI", label: "UPI (GPay / PhonePe / Paytm)" },
  { value: "NET_BANKING", label: "Net Banking" },
  { value: "CARD", label: "Debit / Credit Card" },
  { value: "CASH", label: "Cash" },
  { value: "CHEQUE", label: "Cheque" },
  { value: "OTHER", label: "Other" },
] as const;

export const RECURRING_FREQUENCIES = [
  { value: "WEEKLY", label: "Weekly" },
  { value: "MONTHLY", label: "Monthly" },
  { value: "QUARTERLY", label: "Quarterly (Every 3 months)" },
  { value: "YEARLY", label: "Yearly" },
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: "Food & Groceries", icon: "Utensils", color: "#f97316" },
  { name: "Transportation", icon: "Bus", color: "#3b82f6" },
  { name: "Rent & Housing", icon: "Home", color: "#8b5cf6" },
  { name: "Bills & Utilities", icon: "Receipt", color: "#eab308" },
  { name: "Shopping", icon: "ShoppingBag", color: "#ec4899" },
  { name: "Health & Medical", icon: "HeartPulse", color: "#ef4444" },
  { name: "Education", icon: "GraduationCap", color: "#6366f1" },
  { name: "Entertainment", icon: "Film", color: "#a855f7" },
  { name: "Travel", icon: "Plane", color: "#06b6d4" },
  { name: "Personal Care", icon: "Smile", color: "#14b8a6" },
  { name: "Family & Kids", icon: "Users", color: "#f43f5e" },
  { name: "Investments", icon: "TrendingUp", color: "#10b981" },
  { name: "Other Expenses", icon: "HelpCircle", color: "#64748b" },
];

export const DEFAULT_INCOME_CATEGORIES = [
  { name: "Salary", icon: "Briefcase", color: "#10b981" },
  { name: "Freelance Income", icon: "Laptop", color: "#059669" },
  { name: "Business Revenue", icon: "Store", color: "#3b82f6" },
  { name: "Investment Returns / Dividends", icon: "TrendingUp", color: "#06b6d4" },
  { name: "Rental Income", icon: "Key", color: "#8b5cf6" },
  { name: "Gift / Allowance", icon: "Gift", color: "#ec4899" },
  { name: "Other Income", icon: "DollarSign", color: "#64748b" },
];

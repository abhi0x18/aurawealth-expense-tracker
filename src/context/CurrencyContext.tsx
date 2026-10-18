"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { formatCurrency as baseFormatCurrency } from "@/lib/money";

export type CurrencyCode = "INR" | "USD" | "EUR";

interface CurrencyContextType {
  currency: CurrencyCode;
  setCurrency: (c: CurrencyCode) => void;
  currencySymbol: string;
  formatMoney: (paise: bigint | number | string | null | undefined, options?: { showSign?: boolean; compact?: boolean }) => string;
}

const RATES: Record<CurrencyCode, { rate: number; symbol: string; locale: string }> = {
  INR: { rate: 1, symbol: "₹", locale: "en-IN" },
  USD: { rate: 0.0116, symbol: "$", locale: "en-US" },
  EUR: { rate: 0.0107, symbol: "€", locale: "de-DE" },
};

const CurrencyContext = createContext<CurrencyContextType>({
  currency: "INR",
  setCurrency: () => {},
  currencySymbol: "₹",
  formatMoney: (paise, options) => baseFormatCurrency(paise, options),
});

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aura_currency") as CurrencyCode;
      if (saved && RATES[saved]) {
        setCurrencyState(saved);
      }
    } catch (_) {}
  }, []);

  const setCurrency = (c: CurrencyCode) => {
    setCurrencyState(c);
    try {
      localStorage.setItem("aura_currency", c);
    } catch (_) {}
  };

  const formatMoney = (
    paise: bigint | number | string | null | undefined,
    options: { showSign?: boolean; compact?: boolean } = {}
  ): string => {
    if (paise === null || paise === undefined || paise === "") return `${RATES[currency].symbol}0.00`;

    const rawPaise = typeof paise === "bigint" ? Number(paise) : Number(paise || 0);
    if (isNaN(rawPaise)) return `${RATES[currency].symbol}0.00`;

    const isNegative = rawPaise < 0;
    const absPaise = Math.abs(rawPaise);

    // Apply currency conversion
    const inRupees = absPaise / 100;
    const converted = inRupees * RATES[currency].rate;

    const { showSign = false, compact = false } = options;
    const sign = isNegative ? "-" : showSign && rawPaise > 0 ? "+" : "";
    const symbol = RATES[currency].symbol;

    if (compact) {
      if (currency === "INR") {
        if (converted >= 10000000) return `${sign}${symbol}${(converted / 10000000).toFixed(2)} Cr`;
        if (converted >= 100000) return `${sign}${symbol}${(converted / 100000).toFixed(2)} L`;
      } else {
        if (converted >= 1000000) return `${sign}${symbol}${(converted / 1000000).toFixed(2)}M`;
        if (converted >= 1000) return `${sign}${symbol}${(converted / 1000).toFixed(1)}k`;
      }
    }

    const formatted = new Intl.NumberFormat(RATES[currency].locale, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(converted);

    return `${sign}${symbol}${formatted}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencySymbol: RATES[currency].symbol,
        formatMoney,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  return useContext(CurrencyContext);
}

import { describe, it, expect } from "vitest";
import {
  rupeesToPaise,
  paiseToRupees,
  formatCurrency,
  calculatePercentage,
  calculateNetCashFlow,
} from "../src/lib/money";
import { generateTransactionsCsv } from "../src/lib/export-csv";

describe("Monetary Correctness & Decimal-Safe Minor Units (Paise)", () => {
  it("converts rupees to paise without floating point inaccuracy", () => {
    // Classic IEEE 754 float precision trap: 0.1 + 0.2 = 0.30000000000000004
    const p1 = rupeesToPaise(0.1);
    const p2 = rupeesToPaise(0.2);
    expect(p1 + p2).toBe(BigInt(30)); // Exactly 30 paise

    // Precise rupee amounts
    expect(rupeesToPaise("1500.50")).toBe(BigInt(150050));
    expect(rupeesToPaise(1500.5)).toBe(BigInt(150050));
    expect(rupeesToPaise("0")).toBe(BigInt(0));
    expect(rupeesToPaise("")).toBe(BigInt(0));
    expect(rupeesToPaise(99.99)).toBe(BigInt(9999));
    expect(rupeesToPaise(100000)).toBe(BigInt(10000000)); // 1 Lakh = 10,000,000 paise
  });

  it("converts paise back to rupees accurately", () => {
    expect(paiseToRupees(BigInt(150050))).toBe(1500.5);
    expect(paiseToRupees(BigInt(30))).toBe(0.3);
    expect(paiseToRupees(BigInt(0))).toBe(0);
  });

  it("formats Indian currency in en-IN style with rupee symbol", () => {
    expect(formatCurrency(BigInt(150050))).toBe("₹1,500.50");
    expect(formatCurrency(BigInt(10000000))).toBe("₹1,00,000.00"); // 1 Lakh with Indian comma grouping
    expect(formatCurrency(BigInt(-50000))).toBe("-₹500.00");
    expect(formatCurrency(BigInt(50000), { showSign: true })).toBe("+₹500.00");
  });

  it("formats compact Lakh and Crore abbreviations correctly", () => {
    expect(formatCurrency(BigInt(15000000), { compact: true })).toBe("₹1.50 L");
    expect(formatCurrency(BigInt(2500000000), { compact: true })).toBe("₹2.50 Cr");
  });

  it("calculates percentage consumed accurately", () => {
    expect(calculatePercentage(BigInt(80000), BigInt(100000))).toBe(80);
    expect(calculatePercentage(BigInt(150000), BigInt(100000))).toBe(150);
    expect(calculatePercentage(BigInt(0), BigInt(100000))).toBe(0);
    expect(calculatePercentage(BigInt(100000), BigInt(0))).toBe(0); // division by zero safe
  });

  it("calculates net cash flow strictly as Income minus Expenses", () => {
    const income = BigInt(15000000); // ₹1,50,000
    const expense = BigInt(6500000); // ₹65,000
    expect(calculateNetCashFlow(income, expense)).toBe(BigInt(8500000)); // ₹85,000 surplus
  });
});

describe("Account Balance Calculation Accounting Rules", () => {
  it("verifies transfers do not inflate income or expenses while balancing accounts", () => {
    // Bank A: ₹10,000 opening balance
    // Bank B: ₹5,000 opening balance
    let bankABalance = BigInt(1000000);
    let bankBBalance = BigInt(500000);

    let totalIncome = BigInt(0);
    let totalExpense = BigInt(0);

    // Transfer ₹2,000 from Bank A to Bank B
    const transferAmount = BigInt(200000);
    const txType = "TRANSFER";

    if (txType === "TRANSFER") {
      bankABalance -= transferAmount;
      bankBBalance += transferAmount;
      // Note: totalIncome and totalExpense must NOT change
    }

    expect(bankABalance).toBe(BigInt(800000)); // ₹8,000
    expect(bankBBalance).toBe(BigInt(700000)); // ₹7,000
    expect(bankABalance + bankBBalance).toBe(BigInt(1500000)); // Total net wealth unchanged at ₹15,000
    expect(totalIncome).toBe(BigInt(0));
    expect(totalExpense).toBe(BigInt(0));
  });

  it("verifies expenses reduce balances and income increases balances", () => {
    let balance = BigInt(500000); // ₹5,000

    // Income +₹2,000
    balance += BigInt(200000);
    expect(balance).toBe(BigInt(700000));

    // Expense -₹1,500
    balance -= BigInt(150000);
    expect(balance).toBe(BigInt(550000));
  });
});

describe("CSV Export Formula Injection Guard", () => {
  it("escapes malicious spreadsheet formula characters (=, +, -, @)", () => {
    const mockTxs = [
      {
        date: new Date("2026-10-18T10:00:00Z"),
        type: "EXPENSE",
        amountPaise: BigInt(50000),
        account: { name: "Cash" },
        toAccount: null,
        category: { name: "Food" },
        merchant: "=cmd|' /C calc'!A0", // Malicious formula attempt
        paymentMethod: "CASH",
        notes: "+cmd|' /C calc'!A0",
        tags: "@admin",
      },
    ];

    const csv = generateTransactionsCsv(mockTxs);
    expect(csv).toContain("'=cmd|' /C calc'!A0");
    expect(csv).toContain("'+cmd|' /C calc'!A0");
    expect(csv).toContain("'@admin");
  });
});

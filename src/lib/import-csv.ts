import Papa from "papaparse";
import { db } from "@/lib/db";
import { rupeesToPaise } from "./money";
import { isValid } from "date-fns";

export interface ImportPreviewRow {
  rowNumber: number;
  date: string;
  type: string;
  amount: number;
  account: string;
  destinationAccount?: string;
  category?: string;
  merchant?: string;
  paymentMethod?: string;
  notes?: string;
  tags?: string;
  status: "VALID" | "DUPLICATE" | "INVALID";
  reason?: string;
}

export interface ImportResult {
  totalRows: number;
  importedCount: number;
  skippedCount: number;
  errorCount: number;
  errors: { row: number; error: string }[];
}

export function parseCsvRaw(csvText: string): Record<string, string>[] {
  const result = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });
  return result.data;
}

export async function validateAndPreviewCsv(
  userId: string,
  csvRows: Record<string, string>[]
): Promise<ImportPreviewRow[]> {
  const accounts = await db.account.findMany({ where: { userId } });
  const accountMap = new Map(accounts.map((a) => [a.name.toLowerCase().trim(), a.id]));

  const existingTransactions = await db.transaction.findMany({
    where: { userId },
    select: {
      date: true,
      amountPaise: true,
      type: true,
      accountId: true,
    },
  });

  const previewRows: ImportPreviewRow[] = [];

  for (let i = 0; i < csvRows.length; i++) {
    const row = csvRows[i];
    const rowNum = i + 1;

    // Normalizing field names
    const dateStr = row["Date"] || row["date"] || row["DATE"] || "";
    const typeStr = (row["Type"] || row["type"] || "EXPENSE").toUpperCase().trim();
    const amountStr =
      row["Amount (INR)"] || row["Amount"] || row["amount"] || row["AMOUNT"] || "0";
    const accountName = row["Account"] || row["account"] || "Main Bank Account";
    const destAccountName = row["Destination Account"] || row["destination_account"] || "";
    const categoryName = row["Category"] || row["category"] || "";
    const merchant = row["Merchant / Payee"] || row["Merchant"] || row["merchant"] || "";
    const paymentMethod = row["Payment Method"] || row["method"] || "OTHER";
    const notes = row["Notes"] || row["notes"] || row["Description"] || "";
    const tags = row["Tags"] || row["tags"] || "";

    const parsedDate = new Date(dateStr);
    const amountVal = parseFloat(amountStr);

    if (!dateStr || !isValid(parsedDate)) {
      previewRows.push({
        rowNumber: rowNum,
        date: dateStr,
        type: typeStr,
        amount: isNaN(amountVal) ? 0 : amountVal,
        account: accountName,
        status: "INVALID",
        reason: "Invalid date format. Expected YYYY-MM-DD or DD MMM YYYY.",
      });
      continue;
    }

    if (isNaN(amountVal) || amountVal <= 0) {
      previewRows.push({
        rowNumber: rowNum,
        date: dateStr,
        type: typeStr,
        amount: amountVal,
        account: accountName,
        status: "INVALID",
        reason: "Amount must be a positive number.",
      });
      continue;
    }

    if (!["EXPENSE", "INCOME", "TRANSFER"].includes(typeStr)) {
      previewRows.push({
        rowNumber: rowNum,
        date: dateStr,
        type: typeStr,
        amount: amountVal,
        account: accountName,
        status: "INVALID",
        reason: "Type must be EXPENSE, INCOME, or TRANSFER.",
      });
      continue;
    }

    const amountPaise = rupeesToPaise(amountVal);
    const accountId = accountMap.get(accountName.toLowerCase().trim());

    // Check duplicate
    const isDup =
      accountId &&
      existingTransactions.some(
        (ex) =>
          ex.accountId === accountId &&
          ex.type === typeStr &&
          ex.amountPaise === amountPaise &&
          Math.abs(ex.date.getTime() - parsedDate.getTime()) < 24 * 3600 * 1000
      );

    if (isDup) {
      previewRows.push({
        rowNumber: rowNum,
        date: dateStr,
        type: typeStr,
        amount: amountVal,
        account: accountName,
        destinationAccount: destAccountName,
        category: categoryName,
        merchant,
        paymentMethod,
        notes,
        tags,
        status: "DUPLICATE",
        reason: "Identical transaction already exists on this date.",
      });
    } else {
      previewRows.push({
        rowNumber: rowNum,
        date: dateStr,
        type: typeStr,
        amount: amountVal,
        account: accountName,
        destinationAccount: destAccountName,
        category: categoryName,
        merchant,
        paymentMethod,
        notes,
        tags,
        status: "VALID",
      });
    }
  }

  return previewRows;
}

export async function executeImport(
  userId: string,
  validRows: ImportPreviewRow[],
  fileName: string = "import.csv"
): Promise<ImportResult> {
  const result: ImportResult = {
    totalRows: validRows.length,
    importedCount: 0,
    skippedCount: 0,
    errorCount: 0,
    errors: [],
  };

  const accounts = await db.account.findMany({ where: { userId } });
  const accountMap = new Map(accounts.map((a) => [a.name.toLowerCase().trim(), a.id]));

  const categories = await db.category.findMany({ where: { userId } });
  const categoryMap = new Map(
    categories.map((c) => [`${c.name.toLowerCase().trim()}_${c.type}`, c.id])
  );

  for (const item of validRows) {
    if (item.status === "DUPLICATE") {
      result.skippedCount++;
      continue;
    }
    if (item.status === "INVALID") {
      result.errorCount++;
      result.errors.push({ row: item.rowNumber, error: item.reason || "Invalid row" });
      continue;
    }

    try {
      // Find or create account
      let accountId = accountMap.get(item.account.toLowerCase().trim());
      if (!accountId) {
        const createdAcc = await db.account.create({
          data: {
            userId,
            name: item.account,
            type: "BANK",
            openingBalancePaise: BigInt(0),
            color: "#3b82f6",
          },
        });
        accountId = createdAcc.id;
        accountMap.set(item.account.toLowerCase().trim(), accountId);
      }

      // Handle destination account if transfer
      let toAccountId: string | undefined = undefined;
      if (item.type === "TRANSFER" && item.destinationAccount) {
        toAccountId = accountMap.get(item.destinationAccount.toLowerCase().trim());
        if (!toAccountId) {
          const destAcc = await db.account.create({
            data: {
              userId,
              name: item.destinationAccount,
              type: "BANK",
              openingBalancePaise: BigInt(0),
              color: "#10b981",
            },
          });
          toAccountId = destAcc.id;
          accountMap.set(item.destinationAccount.toLowerCase().trim(), toAccountId);
        }
      }

      // Handle category
      let categoryId: string | undefined = undefined;
      if (item.category && item.type !== "TRANSFER") {
        const key = `${item.category.toLowerCase().trim()}_${item.type}`;
        categoryId = categoryMap.get(key);
        if (!categoryId) {
          const newCat = await db.category.create({
            data: {
              userId,
              name: item.category,
              type: item.type,
              color: "#64748b",
            },
          });
          categoryId = newCat.id;
          categoryMap.set(key, categoryId);
        }
      }

      await db.transaction.create({
        data: {
          userId,
          type: item.type,
          amountPaise: rupeesToPaise(item.amount),
          date: new Date(item.date),
          accountId,
          toAccountId: toAccountId || null,
          categoryId: categoryId || null,
          merchant: item.merchant || null,
          paymentMethod: item.paymentMethod || "OTHER",
          notes: item.notes || null,
          tags: item.tags || null,
        },
      });

      result.importedCount++;
    } catch (err: any) {
      result.errorCount++;
      result.errors.push({ row: item.rowNumber, error: err.message || "Failed to insert record" });
    }
  }

  // Record import history
  await db.importHistory.create({
    data: {
      userId,
      fileName,
      rowCount: result.totalRows,
      importedCount: result.importedCount,
      skippedCount: result.skippedCount,
      errorCount: result.errorCount,
    },
  });

  return result;
}

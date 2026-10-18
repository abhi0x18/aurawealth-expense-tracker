import { z } from "zod";

export const CreateTransactionSchema = z
  .object({
    type: z.enum(["EXPENSE", "INCOME", "TRANSFER"]),
    amount: z.number().positive("Amount must be greater than 0"),
    date: z.string().min(1, "Date is required"),
    accountId: z.string().min(1, "Account is required"),
    toAccountId: z.string().optional().nullable(),
    categoryId: z.string().optional().nullable(),
    merchant: z.string().max(100).optional().nullable(),
    paymentMethod: z.string().optional().nullable(),
    notes: z.string().max(500).optional().nullable(),
    tags: z.string().max(200).optional().nullable(),
    isExcludedFromBudget: z.boolean().default(false),
  })
  .refine(
    (data) => {
      if (data.type === "TRANSFER") {
        return !!data.toAccountId && data.toAccountId !== data.accountId;
      }
      return true;
    },
    {
      message: "Destination account must be specified and different from source account",
      path: ["toAccountId"],
    }
  );

export const UpdateTransactionSchema = CreateTransactionSchema;

export const FilterTransactionSchema = z.object({
  search: z.string().optional(),
  type: z.enum(["ALL", "EXPENSE", "INCOME", "TRANSFER"]).optional().default("ALL"),
  accountId: z.string().optional(),
  categoryId: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.number().int().positive().optional().default(1),
  limit: z.number().int().positive().optional().default(20),
  sortBy: z.enum(["date", "amount", "merchant"]).optional().default("date"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

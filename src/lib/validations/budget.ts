import { z } from "zod";

export const CreateBudgetSchema = z.object({
  categoryId: z.string().optional().nullable(), // null means overall total budget
  monthYear: z.string().regex(/^\d{4}-\d{2}$/, "Format must be YYYY-MM"),
  amount: z.number().positive("Budget amount must be greater than 0"),
  alertThreshold: z.number().min(10).max(100).default(80),
});

export const UpdateBudgetSchema = z.object({
  amount: z.number().positive("Budget amount must be greater than 0"),
  alertThreshold: z.number().min(10).max(100).default(80),
});

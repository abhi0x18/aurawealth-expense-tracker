import { z } from "zod";

export const CreateRecurringRuleSchema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z.number().positive("Amount must be greater than 0"),
  frequency: z.enum(["WEEKLY", "MONTHLY", "QUARTERLY", "YEARLY"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  accountId: z.string().min(1, "Account is required"),
  categoryId: z.string().optional().nullable(),
  merchant: z.string().max(100).optional().nullable(),
  description: z.string().max(255).optional().nullable(),
});

export const UpdateRecurringRuleSchema = CreateRecurringRuleSchema.partial().extend({
  isActive: z.boolean().optional(),
});

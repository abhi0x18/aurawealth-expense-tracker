import { z } from "zod";

export const CreateSavingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  targetDate: z.string().optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  color: z.string().optional().nullable(),
});

export const UpdateSavingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100),
  targetAmount: z.number().positive("Target amount must be greater than 0"),
  targetDate: z.string().optional().nullable(),
  description: z.string().max(255).optional().nullable(),
  color: z.string().optional().nullable(),
  status: z.enum(["IN_PROGRESS", "COMPLETED", "PAUSED"]).optional(),
});

export const GoalContributionSchema = z.object({
  amount: z.number().positive("Contribution amount must be greater than 0"),
  date: z.string().min(1, "Date is required"),
  notes: z.string().max(255).optional().nullable(),
  accountId: z.string().optional().nullable(), // Optional linked account
});

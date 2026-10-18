import { z } from "zod";

export const CreateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(60),
  type: z.enum(["EXPENSE", "INCOME"]),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

export const UpdateCategorySchema = z.object({
  name: z.string().min(1, "Category name is required").max(60),
  icon: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
});

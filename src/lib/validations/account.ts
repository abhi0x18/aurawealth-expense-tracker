import { z } from "zod";

export const CreateAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(60),
  type: z.enum(["CASH", "BANK", "UPI_WALLET", "SAVINGS", "CREDIT_CARD", "OTHER"]),
  openingBalance: z.number().default(0),
  color: z.string().optional().nullable(),
  notes: z.string().max(255).optional().nullable(),
});

export const UpdateAccountSchema = CreateAccountSchema.partial();

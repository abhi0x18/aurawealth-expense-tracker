import { describe, it, expect } from "vitest";
import bcrypt from "bcryptjs";
import { RegisterSchema, LoginSchema } from "../src/lib/validations/auth";
import { CreateTransactionSchema } from "../src/lib/validations/transaction";
import { CreateBudgetSchema } from "../src/lib/validations/budget";

describe("Security & Password Hashing Verification", () => {
  it("never stores plain text passwords and produces unique salted hashes", async () => {
    const plain = "SuperSecretPassword123!";
    const salt1 = await bcrypt.genSalt(10);
    const hash1 = await bcrypt.hash(plain, salt1);

    const salt2 = await bcrypt.genSalt(10);
    const hash2 = await bcrypt.hash(plain, salt2);

    expect(hash1).not.toBe(plain);
    expect(hash2).not.toBe(plain);
    // Unique salt produces different hashes for identical passwords
    expect(hash1).not.toBe(hash2);

    // Both hashes verify successfully
    expect(await bcrypt.compare(plain, hash1)).toBe(true);
    expect(await bcrypt.compare(plain, hash2)).toBe(true);
    expect(await bcrypt.compare("WrongPassword", hash1)).toBe(false);
  });
});

describe("Server-Side Input Validation Schemas", () => {
  it("rejects invalid emails and short passwords during registration", () => {
    const invalidEmail = RegisterSchema.safeParse({
      name: "Rahul",
      email: "not-an-email",
      password: "123456Password",
    });
    expect(invalidEmail.success).toBe(false);

    const shortPassword = RegisterSchema.safeParse({
      name: "Rahul",
      email: "rahul@example.com",
      password: "123", // < 6 chars
    });
    expect(shortPassword.success).toBe(false);

    const valid = RegisterSchema.safeParse({
      name: "Rahul Sharma",
      email: "rahul@example.com",
      password: "StrongPassword123",
    });
    expect(valid.success).toBe(true);
  });

  it("rejects zero and negative transaction amounts", () => {
    const zeroAmount = CreateTransactionSchema.safeParse({
      type: "EXPENSE",
      amount: 0,
      date: "2026-10-18",
      accountId: "acc-1",
    });
    expect(zeroAmount.success).toBe(false);

    const negativeAmount = CreateTransactionSchema.safeParse({
      type: "EXPENSE",
      amount: -50,
      date: "2026-10-18",
      accountId: "acc-1",
    });
    expect(negativeAmount.success).toBe(false);

    const positiveAmount = CreateTransactionSchema.safeParse({
      type: "EXPENSE",
      amount: 450.75,
      date: "2026-10-18",
      accountId: "acc-1",
    });
    expect(positiveAmount.success).toBe(true);
  });

  it("rejects transfers when source and destination accounts are identical", () => {
    const sameAccountTransfer = CreateTransactionSchema.safeParse({
      type: "TRANSFER",
      amount: 1000,
      date: "2026-10-18",
      accountId: "acc-1",
      toAccountId: "acc-1", // Same!
    });
    expect(sameAccountTransfer.success).toBe(false);

    const missingDestTransfer = CreateTransactionSchema.safeParse({
      type: "TRANSFER",
      amount: 1000,
      date: "2026-10-18",
      accountId: "acc-1",
      toAccountId: null,
    });
    expect(missingDestTransfer.success).toBe(false);

    const validTransfer = CreateTransactionSchema.safeParse({
      type: "TRANSFER",
      amount: 1000,
      date: "2026-10-18",
      accountId: "acc-1",
      toAccountId: "acc-2", // Different
    });
    expect(validTransfer.success).toBe(true);
  });

  it("validates monthly budget format (YYYY-MM) and positive limit", () => {
    const badMonth = CreateBudgetSchema.safeParse({
      monthYear: "10-2026", // Wrong format
      amount: 25000,
    });
    expect(badMonth.success).toBe(false);

    const validBudget = CreateBudgetSchema.safeParse({
      monthYear: "2026-10",
      amount: 25000,
      alertThreshold: 85,
    });
    expect(validBudget.success).toBe(true);
  });
});

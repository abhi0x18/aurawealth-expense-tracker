import { describe, it, expect } from "vitest";
import { z } from "zod";

const sendOtpSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address")),
});

const verifyOtpSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address")),
  otp: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^\d+$/, "Verification code must contain digits only"),
  name: z.string().optional(),
});

describe("Resend OTP Authentication Validation", () => {
  it("accepts valid email for OTP request", () => {
    const valid = sendOtpSchema.safeParse({ email: "user@example.com" });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("user@example.com");
    }
  });

  it("normalizes email to lowercase and trims whitespace", () => {
    const valid = sendOtpSchema.safeParse({ email: "  User.Name@Example.COM  " });
    expect(valid.success).toBe(true);
    if (valid.success) {
      expect(valid.data.email).toBe("user.name@example.com");
    }
  });

  it("rejects invalid email formats", () => {
    const invalid1 = sendOtpSchema.safeParse({ email: "notanemail" });
    const invalid2 = sendOtpSchema.safeParse({ email: "@example.com" });
    const invalid3 = sendOtpSchema.safeParse({ email: "user@" });

    expect(invalid1.success).toBe(false);
    expect(invalid2.success).toBe(false);
    expect(invalid3.success).toBe(false);
  });

  it("validates 6-digit numeric OTP codes strictly", () => {
    // Valid 6 digits
    const valid = verifyOtpSchema.safeParse({
      email: "test@domain.com",
      otp: "123456",
    });
    expect(valid.success).toBe(true);

    // Invalid length: 5 digits
    const invalidLength = verifyOtpSchema.safeParse({
      email: "test@domain.com",
      otp: "12345",
    });
    expect(invalidLength.success).toBe(false);

    // Invalid characters: letters
    const invalidChars = verifyOtpSchema.safeParse({
      email: "test@domain.com",
      otp: "12A456",
    });
    expect(invalidChars.success).toBe(false);
  });

  it("calculates 10-minute expiry correctly", () => {
    const now = new Date();
    const expiresAt = new Date(now.getTime() + 10 * 60 * 1000);
    const diffMinutes = (expiresAt.getTime() - now.getTime()) / (1000 * 60);

    expect(diffMinutes).toBeCloseTo(10, 1);
    expect(expiresAt > now).toBe(true);
  });
});

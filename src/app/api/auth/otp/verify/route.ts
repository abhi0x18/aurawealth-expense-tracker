import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { createSession } from "@/lib/auth";
import { seedUserDefaults } from "@/lib/seed-user-defaults";

const verifyOtpSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address")),
  otp: z.string().length(6, "Verification code must be exactly 6 digits").regex(/^\d+$/, "Verification code must contain digits only"),
  name: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = verifyOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input" },
        { status: 400 }
      );
    }

    const { email, otp, name } = parsed.data;

    // Check OTP token
    const token = await db.verificationToken.findFirst({
      where: {
        email,
        otp,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    if (!token) {
      return NextResponse.json(
        { error: "Invalid or expired verification code. Please request a new one." },
        { status: 400 }
      );
    }

    // Invalidate the used token immediately
    await db.verificationToken.delete({
      where: { id: token.id },
    });

    // Find or create user
    let user = await db.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Create new user via OTP signup
      const displayName = name?.trim() || email.split("@")[0];
      user = await db.user.create({
        data: {
          email,
          name: displayName,
          currency: "INR",
          currencySymbol: "₹",
          timezone: "Asia/Kolkata",
        },
      });

      // Seed default categories & accounts for the new user
      await seedUserDefaults(user.id);
    }

    // Establish secure HTTP-only session
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (err: any) {
    console.error("Failed to verify OTP:", err);
    return NextResponse.json(
      { error: "Verification failed. Please try again." },
      { status: 500 }
    );
  }
}

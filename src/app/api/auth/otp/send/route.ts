import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendOtpEmail } from "@/lib/resend";

const sendOtpSchema = z.object({
  email: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .pipe(z.string().email("Please enter a valid email address")),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = sendOtpSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid email" },
        { status: 400 }
      );
    }

    const { email } = parsed.data;

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    // Find existing user if any
    const existingUser = await db.user.findUnique({
      where: { email },
      select: { name: true },
    });

    // Invalidate any previous OTP tokens for this email
    await db.verificationToken.deleteMany({
      where: { email },
    });

    // Store newly generated OTP token
    await db.verificationToken.create({
      data: {
        email,
        otp,
        expiresAt,
      },
    });

    // Send OTP email using Resend
    const result = await sendOtpEmail(email, otp, existingUser?.name);

    return NextResponse.json({
      success: true,
      message: result.message,
      simulated: result.simulated,
      devOtp: result.devOtp,
      isExistingUser: !!existingUser,
    });
  } catch (err: any) {
    console.error("Failed to send OTP:", err);
    return NextResponse.json(
      { error: "Failed to dispatch verification code. Please try again." },
      { status: 500 }
    );
  }
}

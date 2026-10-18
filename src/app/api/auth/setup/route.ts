import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { RegisterSchema } from "@/lib/validations/auth";
import { hashPassword, createSession, hasAnyUser } from "@/lib/auth";
import { seedUserDefaults } from "@/lib/seed-user-defaults";

export async function POST(req: Request) {
  try {
    const alreadySetup = await hasAnyUser();
    if (alreadySetup) {
      return NextResponse.json(
        { error: "Setup has already been completed. Only one primary account is allowed." },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validated = RegisterSchema.parse(body);

    const passwordHash = await hashPassword(validated.password);

    const user = await db.user.create({
      data: {
        name: validated.name,
        email: validated.email.toLowerCase().trim(),
        passwordHash,
        currency: validated.currency || "INR",
        currencySymbol: "₹",
      },
    });

    // Seed default categories and initial default accounts
    await seedUserDefaults(user.id);

    // Create session cookie
    await createSession(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        currency: user.currency,
      },
    });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to initialize account" }, { status: 500 });
  }
}

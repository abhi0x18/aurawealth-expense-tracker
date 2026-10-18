import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { LoginSchema } from "@/lib/validations/auth";
import { verifyPassword, createSession, hasAnyUser } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const isSetup = await hasAnyUser();
    if (!isSetup) {
      return NextResponse.json(
        { error: "No user account exists. Please run initial setup first.", needsSetup: true },
        { status: 400 }
      );
    }

    const body = await req.json();
    const validated = LoginSchema.parse(body);

    const user = await db.user.findUnique({
      where: { email: validated.email.toLowerCase().trim() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!user.passwordHash) {
      return NextResponse.json(
        { error: "This account was registered via Email OTP. Please sign in using the Email OTP tab." },
        { status: 400 }
      );
    }

    const isValid = await verifyPassword(validated.password, user.passwordHash);
    if (!isValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

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
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}

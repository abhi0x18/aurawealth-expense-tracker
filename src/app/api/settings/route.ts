import { NextResponse } from "next/server";
import { getCurrentUser, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateProfileSchema, ChangePasswordSchema } from "@/lib/validations/auth";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  return NextResponse.json({ user });
}

export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = UpdateProfileSchema.parse(body);

    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: validated.name.trim(),
        currency: validated.currency,
        budgetAlertThreshold: validated.budgetAlertThreshold,
      },
      select: {
        id: true,
        name: true,
        email: true,
        currency: true,
        currencySymbol: true,
        budgetAlertThreshold: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update profile" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action } = body;

    if (action === "CHANGE_PASSWORD") {
      const validated = ChangePasswordSchema.parse(body);
      const userRecord = await db.user.findUniqueOrThrow({ where: { id: user.id } });

      if (userRecord.passwordHash) {
        const isValid = await verifyPassword(validated.currentPassword, userRecord.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }
      }

      const newHash = await hashPassword(validated.newPassword);
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      });

      return NextResponse.json({ success: true, message: "Password updated successfully" });
    }

    if (action === "RESET_DATA") {
      const { confirmPassword } = body;
      const userRecord = await db.user.findUniqueOrThrow({ where: { id: user.id } });

      if (userRecord.passwordHash) {
        const isValid = await verifyPassword(confirmPassword, userRecord.passwordHash);
        if (!isValid) {
          return NextResponse.json({ error: "Incorrect password. Data reset aborted." }, { status: 400 });
        }
      }

      // Wipe financial data transactionally
      await db.$transaction([
        db.savingsContribution.deleteMany({ where: { goal: { userId: user.id } } }),
        db.savingsGoal.deleteMany({ where: { userId: user.id } }),
        db.transaction.deleteMany({ where: { userId: user.id } }),
        db.recurringRule.deleteMany({ where: { userId: user.id } }),
        db.budget.deleteMany({ where: { userId: user.id } }),
      ]);

      return NextResponse.json({ success: true, message: "All transactions and budgets have been safely cleared" });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Operation failed" }, { status: 500 });
  }
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { GoalContributionSchema } from "@/lib/validations/goal";
import { rupeesToPaise } from "@/lib/money";

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const goal = await db.savingsGoal.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!goal) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = GoalContributionSchema.parse(body);
    const amountPaise = rupeesToPaise(validated.amount);

    // If account was linked, ensure it belongs to the user
    if (validated.accountId) {
      const acc = await db.account.findFirst({
        where: { id: validated.accountId, userId: user.id },
      });
      if (!acc) {
        return NextResponse.json({ error: "Linked account not found" }, { status: 404 });
      }
    }

    const contribution = await db.savingsContribution.create({
      data: {
        goalId: goal.id,
        amountPaise,
        date: new Date(validated.date),
        notes: validated.notes || null,
        accountId: validated.accountId || null,
      },
      include: { account: true },
    });

    const newCurrent = goal.currentAmountPaise + amountPaise;
    const isNowCompleted = newCurrent >= goal.targetAmountPaise;

    const updatedGoal = await db.savingsGoal.update({
      where: { id: goal.id },
      data: {
        currentAmountPaise: newCurrent,
        status: isNowCompleted ? "COMPLETED" : goal.status,
      },
      include: {
        contributions: {
          include: { account: true },
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, goal: updatedGoal, contribution });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to record contribution" }, { status: 500 });
  }
}

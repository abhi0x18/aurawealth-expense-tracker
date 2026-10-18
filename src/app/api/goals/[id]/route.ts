import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateSavingsGoalSchema } from "@/lib/validations/goal";
import { rupeesToPaise } from "@/lib/money";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.savingsGoal.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateSavingsGoalSchema.parse(body);

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name.trim();
    if (validated.targetAmount !== undefined) {
      updateData.targetAmountPaise = rupeesToPaise(validated.targetAmount);
    }
    if (validated.targetDate !== undefined) {
      updateData.targetDate = validated.targetDate ? new Date(validated.targetDate) : null;
    }
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.color !== undefined) updateData.color = validated.color;
    if (validated.status !== undefined) updateData.status = validated.status;

    const updated = await db.savingsGoal.update({
      where: { id: params.id },
      data: updateData,
      include: {
        contributions: {
          include: { account: true },
          orderBy: { date: "desc" },
        },
      },
    });

    return NextResponse.json({ success: true, goal: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update savings goal" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.savingsGoal.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Goal not found" }, { status: 404 });
    }

    await db.savingsGoal.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Goal deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete savings goal" }, { status: 500 });
  }
}

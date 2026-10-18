import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateBudgetSchema } from "@/lib/validations/budget";
import { rupeesToPaise } from "@/lib/money";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.budget.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateBudgetSchema.parse(body);

    const updated = await db.budget.update({
      where: { id: params.id },
      data: {
        amountPaise: rupeesToPaise(validated.amount),
        alertThreshold: validated.alertThreshold,
      },
      include: { category: true },
    });

    return NextResponse.json({ success: true, budget: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update budget" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.budget.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Budget not found" }, { status: 404 });
    }

    await db.budget.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Budget deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete budget" }, { status: 500 });
  }
}

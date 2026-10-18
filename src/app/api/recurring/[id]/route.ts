import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateRecurringRuleSchema } from "@/lib/validations/recurring";
import { rupeesToPaise } from "@/lib/money";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.recurringRule.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Recurring rule not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateRecurringRuleSchema.parse(body);

    const updateData: any = {};
    if (validated.type !== undefined) updateData.type = validated.type;
    if (validated.amount !== undefined) updateData.amountPaise = rupeesToPaise(validated.amount);
    if (validated.frequency !== undefined) updateData.frequency = validated.frequency;
    if (validated.accountId !== undefined) updateData.accountId = validated.accountId;
    if (validated.categoryId !== undefined) updateData.categoryId = validated.categoryId;
    if (validated.merchant !== undefined) updateData.merchant = validated.merchant;
    if (validated.description !== undefined) updateData.description = validated.description;
    if (validated.isActive !== undefined) updateData.isActive = validated.isActive;
    if (validated.endDate !== undefined) {
      updateData.endDate = validated.endDate ? new Date(validated.endDate) : null;
    }

    const updated = await db.recurringRule.update({
      where: { id: params.id },
      data: updateData,
      include: { account: true, category: true },
    });

    return NextResponse.json({ success: true, rule: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update recurring rule" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.recurringRule.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Recurring rule not found" }, { status: 404 });
    }

    await db.recurringRule.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Recurring rule deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete recurring rule" }, { status: 500 });
  }
}

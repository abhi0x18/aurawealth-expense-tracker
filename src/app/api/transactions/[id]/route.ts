import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateTransactionSchema } from "@/lib/validations/transaction";
import { rupeesToPaise } from "@/lib/money";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const transaction = await db.transaction.findFirst({
    where: { id: params.id, userId: user.id },
    include: { account: true, toAccount: true, category: true },
  });

  if (!transaction) {
    return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
  }

  return NextResponse.json({ transaction });
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.transaction.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateTransactionSchema.parse(body);

    const updated = await db.transaction.update({
      where: { id: params.id },
      data: {
        type: validated.type,
        amountPaise: rupeesToPaise(validated.amount),
        date: new Date(validated.date),
        accountId: validated.accountId,
        toAccountId: validated.type === "TRANSFER" ? validated.toAccountId : null,
        categoryId: validated.type !== "TRANSFER" ? validated.categoryId : null,
        merchant: validated.merchant || null,
        paymentMethod: validated.paymentMethod || "OTHER",
        notes: validated.notes || null,
        tags: validated.tags || null,
        isExcludedFromBudget: validated.isExcludedFromBudget || false,
      },
      include: {
        account: true,
        toAccount: true,
        category: true,
      },
    });

    return NextResponse.json({ success: true, transaction: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update transaction" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.transaction.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    await db.transaction.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Transaction deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete transaction" }, { status: 500 });
  }
}

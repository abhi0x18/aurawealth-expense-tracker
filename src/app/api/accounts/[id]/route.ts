import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateAccountSchema } from "@/lib/validations/account";
import { rupeesToPaise } from "@/lib/money";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.account.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateAccountSchema.parse(body);

    const updateData: any = {};
    if (validated.name !== undefined) updateData.name = validated.name;
    if (validated.color !== undefined) updateData.color = validated.color;
    if (validated.notes !== undefined) updateData.notes = validated.notes;
    if (body.isArchived !== undefined) updateData.isArchived = Boolean(body.isArchived);
    if (validated.openingBalance !== undefined) {
      updateData.openingBalancePaise = rupeesToPaise(validated.openingBalance);
    }

    const updated = await db.account.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json({ success: true, account: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update account" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.account.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        _count: {
          select: {
            transactions: true,
            destinationTransfers: true,
            savingsContributions: true,
          },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    const linkedCount =
      existing._count.transactions +
      existing._count.destinationTransfers +
      existing._count.savingsContributions;

    if (linkedCount > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete account with ${linkedCount} historical transactions. You can archive it instead to keep past records intact.`,
          canArchive: true,
        },
        { status: 400 }
      );
    }

    await db.account.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Account deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete account" }, { status: 500 });
  }
}

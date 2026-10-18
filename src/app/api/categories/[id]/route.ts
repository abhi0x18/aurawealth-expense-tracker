import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { UpdateCategorySchema } from "@/lib/validations/category";

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.category.findFirst({
      where: { id: params.id, userId: user.id },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const body = await req.json();
    const validated = UpdateCategorySchema.parse(body);

    const updated = await db.category.update({
      where: { id: params.id },
      data: {
        name: validated.name.trim(),
        icon: validated.icon !== undefined ? validated.icon : existing.icon,
        color: validated.color !== undefined ? validated.color : existing.color,
      },
    });

    return NextResponse.json({ success: true, category: updated });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const existing = await db.category.findFirst({
      where: { id: params.id, userId: user.id },
      include: {
        _count: {
          select: { transactions: true, budgets: true },
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    if (existing._count.transactions > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category used by ${existing._count.transactions} transactions. Archive it or reassign those transactions first.`,
          canArchive: true,
        },
        { status: 400 }
      );
    }

    await db.category.delete({ where: { id: params.id } });
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}

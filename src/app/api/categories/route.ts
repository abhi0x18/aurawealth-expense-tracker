import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateCategorySchema } from "@/lib/validations/category";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const categories = await db.category.findMany({
    where: { userId: user.id },
    orderBy: { name: "asc" },
  });

  return NextResponse.json({ categories });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateCategorySchema.parse(body);

    const existing = await db.category.findUnique({
      where: {
        userId_name_type: {
          userId: user.id,
          name: validated.name.trim(),
          type: validated.type,
        },
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: `Category '${validated.name}' already exists for ${validated.type.toLowerCase()}` },
        { status: 400 }
      );
    }

    const category = await db.category.create({
      data: {
        userId: user.id,
        name: validated.name.trim(),
        type: validated.type,
        icon: validated.icon || "Tag",
        color: validated.color || "#64748b",
      },
    });

    return NextResponse.json({ success: true, category }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

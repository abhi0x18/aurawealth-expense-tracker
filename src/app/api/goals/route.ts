import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateSavingsGoalSchema } from "@/lib/validations/goal";
import { rupeesToPaise } from "@/lib/money";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const goals = await db.savingsGoal.findMany({
    where: { userId: user.id },
    include: {
      contributions: {
        include: { account: true },
        orderBy: { date: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ goals });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateSavingsGoalSchema.parse(body);

    const goal = await db.savingsGoal.create({
      data: {
        userId: user.id,
        name: validated.name.trim(),
        targetAmountPaise: rupeesToPaise(validated.targetAmount),
        currentAmountPaise: BigInt(0),
        targetDate: validated.targetDate ? new Date(validated.targetDate) : null,
        description: validated.description || null,
        color: validated.color || "#10b981",
        status: "IN_PROGRESS",
      },
    });

    return NextResponse.json({ success: true, goal }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create savings goal" }, { status: 500 });
  }
}

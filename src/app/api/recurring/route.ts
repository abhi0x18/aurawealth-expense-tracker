import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateRecurringRuleSchema } from "@/lib/validations/recurring";
import { rupeesToPaise } from "@/lib/money";
import { processDueRecurringRules } from "@/lib/recurring";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Process due rules first
  const newlyGenerated = await processDueRecurringRules(user.id);

  const rules = await db.recurringRule.findMany({
    where: { userId: user.id },
    include: {
      account: true,
      category: true,
      _count: {
        select: { generatedTransactions: true },
      },
    },
    orderBy: { nextDueDate: "asc" },
  });

  return NextResponse.json({
    rules,
    newlyGeneratedCount: newlyGenerated.length,
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateRecurringRuleSchema.parse(body);

    const startDate = new Date(validated.startDate);
    const endDate = validated.endDate ? new Date(validated.endDate) : null;

    const rule = await db.recurringRule.create({
      data: {
        userId: user.id,
        type: validated.type,
        amountPaise: rupeesToPaise(validated.amount),
        frequency: validated.frequency,
        startDate,
        endDate,
        nextDueDate: startDate,
        accountId: validated.accountId,
        categoryId: validated.categoryId || null,
        merchant: validated.merchant || null,
        description: validated.description || null,
        isActive: true,
      },
      include: {
        account: true,
        category: true,
      },
    });

    // Check if it's already due immediately
    await processDueRecurringRules(user.id);

    return NextResponse.json({ success: true, rule }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create recurring rule" }, { status: 500 });
  }
}

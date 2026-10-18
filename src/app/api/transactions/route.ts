import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { CreateTransactionSchema, FilterTransactionSchema } from "@/lib/validations/transaction";
import { rupeesToPaise } from "@/lib/money";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || undefined;
  const type = searchParams.get("type") || "ALL";
  const accountId = searchParams.get("accountId") || undefined;
  const categoryId = searchParams.get("categoryId") || undefined;
  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const page = parseInt(searchParams.get("page") || "1", 10);
  const limit = parseInt(searchParams.get("limit") || "20", 10);
  const sortBy = searchParams.get("sortBy") || "date";
  const sortOrder = (searchParams.get("sortOrder") || "desc") as "asc" | "desc";

  const whereClause: any = {
    userId: user.id,
  };

  if (type && type !== "ALL") {
    whereClause.type = type;
  }

  if (accountId) {
    whereClause.OR = [
      { accountId },
      { toAccountId: accountId },
    ];
  }

  if (categoryId) {
    whereClause.categoryId = categoryId;
  }

  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) {
      // Set to end of the selected day
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date.lte = end;
    }
  }

  if (search && search.trim()) {
    const term = search.trim();
    whereClause.AND = [
      ...(whereClause.AND || []),
      {
        OR: [
          { merchant: { contains: term } },
          { notes: { contains: term } },
          { tags: { contains: term } },
          { account: { name: { contains: term } } },
          { category: { name: { contains: term } } },
        ],
      },
    ];
  }

  const [totalCount, transactions] = await Promise.all([
    db.transaction.count({ where: whereClause }),
    db.transaction.findMany({
      where: whereClause,
      include: {
        account: { select: { id: true, name: true, type: true, color: true } },
        toAccount: { select: { id: true, name: true, type: true, color: true } },
        category: { select: { id: true, name: true, type: true, icon: true, color: true } },
      },
      orderBy: {
        [sortBy === "amount" ? "amountPaise" : sortBy]: sortOrder,
      },
      skip: (page - 1) * limit,
      take: limit,
    }),
  ]);

  return NextResponse.json({
    transactions,
    pagination: {
      page,
      limit,
      totalCount,
      totalPages: Math.ceil(totalCount / limit) || 1,
    },
  });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateTransactionSchema.parse(body);

    // Verify source account belongs to user
    const sourceAccount = await db.account.findFirst({
      where: { id: validated.accountId, userId: user.id },
    });
    if (!sourceAccount) {
      return NextResponse.json({ error: "Source account not found" }, { status: 404 });
    }

    // If transfer, verify destination account belongs to user and is distinct
    if (validated.type === "TRANSFER") {
      if (!validated.toAccountId) {
        return NextResponse.json(
          { error: "Destination account is required for transfers" },
          { status: 400 }
        );
      }
      if (validated.toAccountId === validated.accountId) {
        return NextResponse.json(
          { error: "Source and destination accounts must be different" },
          { status: 400 }
        );
      }
      const destAccount = await db.account.findFirst({
        where: { id: validated.toAccountId, userId: user.id },
      });
      if (!destAccount) {
        return NextResponse.json({ error: "Destination account not found" }, { status: 404 });
      }
    }

    // Verify category belongs to user if specified
    if (validated.categoryId) {
      const category = await db.category.findFirst({
        where: { id: validated.categoryId, userId: user.id },
      });
      if (!category) {
        return NextResponse.json({ error: "Category not found" }, { status: 404 });
      }
    }

    const transaction = await db.transaction.create({
      data: {
        userId: user.id,
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

    return NextResponse.json({ success: true, transaction }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create transaction" }, { status: 500 });
  }
}

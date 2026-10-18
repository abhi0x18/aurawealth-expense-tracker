import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { generateTransactionsCsv } from "@/lib/export-csv";
import { format } from "date-fns";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const type = searchParams.get("type");
  const accountId = searchParams.get("accountId");
  const categoryId = searchParams.get("categoryId");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  const whereClause: any = { userId: user.id };
  if (type && type !== "ALL") whereClause.type = type;
  if (accountId) whereClause.OR = [{ accountId }, { toAccountId: accountId }];
  if (categoryId) whereClause.categoryId = categoryId;
  if (startDate || endDate) {
    whereClause.date = {};
    if (startDate) whereClause.date.gte = new Date(startDate);
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      whereClause.date.lte = end;
    }
  }

  const transactions = await db.transaction.findMany({
    where: whereClause,
    include: {
      account: { select: { name: true } },
      toAccount: { select: { name: true } },
      category: { select: { name: true } },
    },
    orderBy: { date: "desc" },
  });

  const csv = generateTransactionsCsv(transactions);
  const fileName = `paisapilot-transactions-${format(new Date(), "yyyy-MM-dd")}.csv`;

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}

import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAccountsWithBalances } from "@/lib/account-balance";
import { CreateAccountSchema } from "@/lib/validations/account";
import { rupeesToPaise } from "@/lib/money";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const accounts = await getAccountsWithBalances(user.id);
  return NextResponse.json({ accounts });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const validated = CreateAccountSchema.parse(body);

    const account = await db.account.create({
      data: {
        userId: user.id,
        name: validated.name,
        type: validated.type,
        openingBalancePaise: rupeesToPaise(validated.openingBalance),
        color: validated.color || "#3b82f6",
        notes: validated.notes,
      },
    });

    return NextResponse.json({ success: true, account }, { status: 201 });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return NextResponse.json({ error: err.errors[0]?.message || "Validation failed" }, { status: 400 });
    }
    return NextResponse.json({ error: err.message || "Failed to create account" }, { status: 500 });
  }
}

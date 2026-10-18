import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createFullBackup, restoreFullBackup } from "@/lib/backup";
import { format } from "date-fns";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const backup = await createFullBackup(user.id);
    const fileName = `paisapilot-backup-${format(new Date(), "yyyy-MM-dd-HHmm")}.json`;

    return new Response(JSON.stringify(backup, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to generate backup" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { backupData, mode = "REPLACE" } = body;

    if (!backupData) {
      return NextResponse.json({ error: "No backup data provided" }, { status: 400 });
    }

    await restoreFullBackup(user.id, backupData, mode);
    return NextResponse.json({ success: true, message: "Backup successfully restored" });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to restore backup" }, { status: 500 });
  }
}

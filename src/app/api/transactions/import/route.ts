import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { parseCsvRaw, validateAndPreviewCsv, executeImport } from "@/lib/import-csv";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { action, csvContent, previewRows, fileName } = body;

    if (action === "PREVIEW") {
      if (!csvContent || typeof csvContent !== "string") {
        return NextResponse.json({ error: "No CSV content provided" }, { status: 400 });
      }

      const rawRows = parseCsvRaw(csvContent);
      if (!rawRows || rawRows.length === 0) {
        return NextResponse.json({ error: "CSV file is empty or headers are missing" }, { status: 400 });
      }

      const preview = await validateAndPreviewCsv(user.id, rawRows);
      return NextResponse.json({ success: true, preview });
    }

    if (action === "COMMIT") {
      if (!previewRows || !Array.isArray(previewRows)) {
        return NextResponse.json({ error: "No preview data to import" }, { status: 400 });
      }

      const result = await executeImport(user.id, previewRows, fileName || "import.csv");
      return NextResponse.json({ success: true, result });
    }

    return NextResponse.json({ error: "Invalid action. Expected PREVIEW or COMMIT." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to process import" }, { status: 500 });
  }
}

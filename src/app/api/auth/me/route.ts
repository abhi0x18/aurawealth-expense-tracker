import { NextResponse } from "next/server";
import { getCurrentUser, hasAnyUser } from "@/lib/auth";

export async function GET() {
  const isSetup = await hasAnyUser();
  if (!isSetup) {
    return NextResponse.json({ authenticated: false, needsSetup: true });
  }

  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ authenticated: false, needsSetup: false });
  }

  return NextResponse.json({
    authenticated: true,
    needsSetup: false,
    user,
  });
}

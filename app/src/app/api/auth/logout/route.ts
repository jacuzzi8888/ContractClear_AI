import { NextResponse } from "next/server";
import { clearSessionCookie } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    await clearSessionCookie();
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[auth/logout] Error"); // Sanitized
    return NextResponse.json({ error: "Logout failed" }, { status: 500 });
  }
}

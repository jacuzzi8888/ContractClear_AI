import { NextRequest, NextResponse } from "next/server";
import { getAuth0UserId } from "@/lib/auth/get-user-id";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const userId = await getAuth0UserId(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ userId });
}

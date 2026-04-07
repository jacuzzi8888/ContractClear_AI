import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  return NextResponse.json({ 
    message: "Use /auth/login for Google login. This endpoint is for local session sync." 
  });
}

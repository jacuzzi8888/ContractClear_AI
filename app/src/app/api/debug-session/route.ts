import { NextRequest, NextResponse } from "next/server";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const sessionCookie = request.cookies.get("__session")?.value;
  const allCookies = request.cookies.getAll().map(c => ({
    name: c.name,
    length: c.value.length,
    prefix: c.value.substring(0, 20),
  }));

  let decryptResult: any = null;
  if (sessionCookie) {
    const secret = process.env.AUTH0_SECRET;
    if (secret) {
      try {
        const key = await hkdf("sha256", secret, "", "JWE CEK", 32);
        const result = await jose.jwtDecrypt(sessionCookie, key, { clockTolerance: 15 });
        decryptResult = { success: true, sub: result.payload.sub };
      } catch (e: any) {
        decryptResult = { success: false, error: e?.code, message: e?.message };
      }
    } else {
      decryptResult = { success: false, error: "NO_SECRET" };
    }
  }

  return NextResponse.json({
    hasSessionCookie: !!sessionCookie,
    sessionCookieLength: sessionCookie?.length || 0,
    sessionCookiePrefix: sessionCookie?.substring(0, 30) || null,
    allCookies,
    decryptResult,
    envVars: {
      AUTH0_DOMAIN: process.env.AUTH0_DOMAIN ? "set" : "missing",
      AUTH0_SECRET: process.env.AUTH0_SECRET ? `set (${process.env.AUTH0_SECRET.length} chars)` : "missing",
      APP_BASE_URL: process.env.APP_BASE_URL || "missing",
    },
  });
}

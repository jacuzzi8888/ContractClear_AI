import { NextRequest, NextResponse } from "next/server";
import { getSessionTokenFromRequest } from "@/lib/auth/session";
import { getUserById, getUserByAuth0Id, createUser } from "@/lib/auth/get-user";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";

export const dynamic = "force-dynamic";

async function getAuth0UserId(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) return null;
  const secret = process.env.AUTH0_SECRET;
  if (!secret) return null;
  try {
    const key = await hkdf("sha256", secret, "", "JWE CEK", 32);
    const result = await jose.jwtDecrypt(sessionCookie, key, { clockTolerance: 15 });
    return (result.payload as any)?.user?.sub || null;
  } catch {
    return null;
  }
}

export async function GET(request: NextRequest) {
  try {
    // Try local session first
    const localSession = await getSessionTokenFromRequest(request);
    if (localSession) {
      const user = await getUserById(localSession.userId);
      if (user) {
        return NextResponse.json({ 
          userId: user.id,
          auth0Id: user.auth0_id,
          email: user.email,
          fullName: user.full_name,
          hasPassword: !!user.password_hash,
        });
      }
    }

    // Try Auth0 session
    const auth0Id = await getAuth0UserId(request);
    if (auth0Id) {
      let user = await getUserByAuth0Id(auth0Id);
      
      if (!user) {
        // Create user record for Auth0 user
        user = await createUser({ auth0Id });
      }
      
      return NextResponse.json({ 
        userId: user.id,
        auth0Id: user.auth0_id,
        email: user.email,
        fullName: user.full_name,
        hasPassword: !!user.password_hash,
      });
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch (error) {
    console.error("[user] GET Error"); // Sanitized
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

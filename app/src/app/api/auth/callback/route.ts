import { NextRequest, NextResponse } from "next/server";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { createUser, getUserByAuth0Id, getUserByEmail, linkAuth0ToUser } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

async function getAuth0UserId(request: NextRequest): Promise<{ sub: string; email?: string; name?: string } | null> {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) return null;
  
  const secret = process.env.AUTH0_SECRET;
  if (!secret) return null;
  
  try {
    const key = await hkdf("sha256", secret, "", "JWE CEK", 32);
    const result = await jose.jwtDecrypt(sessionCookie, key, { clockTolerance: 15 });
    const user = (result.payload as any)?.user;
    if (!user?.sub) return null;
    return {
      sub: user.sub,
      email: user.email,
      name: user.name,
    };
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get Auth0 user info from session cookie
    const auth0User = await getAuth0UserId(request);
    if (!auth0User) {
      return NextResponse.json({ error: "No Auth0 session found" }, { status: 401 });
    }

    const auth0Id = auth0User.sub;
    const email = auth0User.email || null;
    const fullName = auth0User.name || null;

    // Check if user exists by auth0_id
    let user = await getUserByAuth0Id(auth0Id);

    if (user) {
      // User found by auth0_id - just create session
      const session = await createSession({
        userId: user.id,
        email: user.email,
        auth0Id: user.auth0_id,
      });
      await setSessionCookie(session);
      return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.full_name } });
    }

    // Check if user exists by email (local account)
    if (email) {
      user = await getUserByEmail(email);
      if (user) {
        // Link Auth0 to existing local account
        user = await linkAuth0ToUser(user.id, auth0Id);
        const session = await createSession({
          userId: user.id,
          email: user.email,
          auth0Id: user.auth0_id,
        });
        await setSessionCookie(session);
        return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.full_name } });
      }
    }

    // Create new user
    user = await createUser({
      auth0Id,
      email,
      fullName,
    });

    const session = await createSession({
      userId: user.id,
      email: user.email,
      auth0Id: user.auth0_id,
    });
    await setSessionCookie(session);

    return NextResponse.json({ success: true, user: { id: user.id, email: user.email, fullName: user.full_name } });
  } catch (error: any) {
    console.error("[auth/callback] Error:", error);
    return NextResponse.json({ error: error.message || "Auth callback failed" }, { status: 500 });
  }
}

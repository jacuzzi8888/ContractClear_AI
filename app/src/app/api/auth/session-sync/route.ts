import { NextRequest, NextResponse } from "next/server";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";
import { createSession } from "@/lib/auth/session";
import { getUserByAuth0Id, createUser } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

async function getAuth0User(request: NextRequest): Promise<{ sub: string; email?: string; name?: string } | null> {
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

export async function GET(request: NextRequest) {
  const auth0User = await getAuth0User(request);
  
  if (!auth0User) {
    return NextResponse.redirect(
      new URL("/login?error=no_auth0_session", process.env.APP_BASE_URL)
    );
  }

  const auth0Id = auth0User.sub;
  const email = auth0User.email || null;
  const fullName = auth0User.name || null;

  let user = await getUserByAuth0Id(auth0Id);
  if (!user) {
    user = await createUser({ auth0Id, email, fullName });
  }

  const localSession = await createSession({
    userId: user.id,
    email: user.email,
    auth0Id: user.auth0_id,
  });

  const returnTo = request.nextUrl.searchParams.get("returnTo") || "/dashboard";
  const response = NextResponse.redirect(
    new URL(returnTo, process.env.APP_BASE_URL)
  );
  
  response.cookies.set("session", localSession, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });

  return response;
}

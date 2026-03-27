import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "contractclear-jwt-secret-fallback-change-in-production";

function getSecretKey() {
  return new TextEncoder().encode(JWT_SECRET);
}

export interface SessionPayload {
  userId: string;
  email: string | null;
  auth0Id: string | null;
  [key: string]: unknown;
}

export async function createSession(payload: SessionPayload): Promise<string> {
  const secret = getSecretKey();
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secret);
  return token;
}

export async function verifySession(token: string): Promise<SessionPayload | null> {
  try {
    const secret = getSecretKey();
    const { payload } = await jwtVerify(token, secret);
    return payload as SessionPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
}

export async function getSessionFromCookie(): Promise<SessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}

export function getSessionFromRequest(request: NextRequest): SessionPayload | null {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  // Note: This is sync version for use in middleware/API routes
  // For async, use verifySession
  return null; // We'll verify async in the route
}

export async function getSessionTokenFromRequest(request: NextRequest): Promise<SessionPayload | null> {
  const token = request.cookies.get("session")?.value;
  if (!token) return null;
  return verifySession(token);
}

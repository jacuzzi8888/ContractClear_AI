import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { createUser, getUserByEmail } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password, fullName } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (existingUser.auth0_id) {
        return NextResponse.json({ 
          error: "This email is already registered with Google. Please login with Google." 
        }, { status: 400 });
      }
      return NextResponse.json({ error: "Email already registered" }, { status: 400 });
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password);
    const user = await createUser({
      email,
      passwordHash,
      fullName: fullName || null,
    });

    // Create session
    const session = await createSession({
      userId: user.id,
      email: user.email,
      auth0Id: user.auth0_id,
    });
    await setSessionCookie(session);

    return NextResponse.json({ 
      success: true, 
      user: { 
        id: user.id, 
        email: user.email, 
        fullName: user.full_name 
      } 
    });
  } catch (error: any) {
    console.error("[auth/register] Error:", error);
    return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
  }
}

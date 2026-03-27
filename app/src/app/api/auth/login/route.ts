import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { getUserByEmail } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Account not found" }, { status: 401 });
    }

    // Check if account is linked to Auth0 (Google)
    if (user.auth0_id) {
      return NextResponse.json({ 
        error: "This email is linked to Google. Please login with Google." 
      }, { status: 400 });
    }

    // Check if password is set
    if (!user.password_hash) {
      return NextResponse.json({ 
        error: "No password set for this account. Please login with Google or set a password in Settings." 
      }, { status: 400 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid password" }, { status: 401 });
    }

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
    console.error("[auth/login] Error:", error);
    return NextResponse.json({ error: error.message || "Login failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { verifyPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { getUserByEmail } from "@/lib/auth/get-user";
import { loginSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(request);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const result = loginSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password } = result.data;

    // Check if user exists
    const user = await getUserByEmail(email);
    if (!user) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
        error: "This email is linked to Google. Please login with Google." 
      }, { status: 400 });
    }

    // Verify password
    const isValid = await verifyPassword(password, user.password_hash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
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
    console.error("[auth/login] Error"); // Sanitized
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

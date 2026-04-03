import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { createUser, getUserByEmail } from "@/lib/auth/get-user";
import { registerSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(request);
    if (rateLimitError) return rateLimitError;

    const body = await request.json();
    const result = registerSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { email, password, fullName } = result.data;

    // Check if email already exists
    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      if (existingUser.auth0_id) {
        return NextResponse.json({ 
          error: "This email is already registered with Google. Please login with Google." 
        }, { status: 400 });
      }
      // Generic error to prevent enumeration
      return NextResponse.json({ error: "Registration failed or email already registered" }, { status: 400 });
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
    console.error("[auth/register] Error"); // Sanitized
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { getSessionTokenFromRequest } from "@/lib/auth/session";
import { getUserById, setUserPassword } from "@/lib/auth/get-user";
import { changePasswordSchema } from "@/lib/auth/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    const rateLimitError = await checkRateLimit(request);
    if (rateLimitError) return rateLimitError;

    // Get current session
    const session = await getSessionTokenFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = changePasswordSchema.safeParse(body);

    if (!result.success) {
      const errorMsg = result.error.issues.map((e: any) => e.message).join(", ");
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }

    const { password } = result.data;

    // Check if user exists
    const user = await getUserById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Hash and set password
    const passwordHash = await hashPassword(password);
    await setUserPassword(user.id, passwordHash);

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("[user/password] Error"); // Sanitized
    return NextResponse.json({ error: "Failed to update password" }, { status: 500 });
  }
}

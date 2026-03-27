import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/auth/password";
import { getSessionTokenFromRequest } from "@/lib/auth/session";
import { getUserById, setUserPassword } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function PUT(request: NextRequest) {
  try {
    // Get current session
    const session = await getSessionTokenFromRequest(request);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { password, confirmPassword } = await request.json();

    if (!password || !confirmPassword) {
      return NextResponse.json({ error: "Password and confirmation are required" }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }

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
    console.error("[user/password] Error:", error);
    return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
  }
}

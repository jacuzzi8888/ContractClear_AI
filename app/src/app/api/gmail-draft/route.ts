import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveUserUUID } from "@/lib/auth/get-user";
import { getGoogleTokenFromAuth0Vault } from "@/lib/auth0-vault";
import { createGmailDraft } from "@/lib/gmail-api";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userId = await resolveUserUUID(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { jobId, subject, body } = await request.json();
    
    if (!subject || !body) {
      return NextResponse.json({ error: "Subject and body are required" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // Get the user's Google refresh token
    const { data: user, error: userError } = await supabase
      .from("users")
      .select("google_refresh_token")
      .eq("id", userId)
      .single();

    if (userError || !user?.google_refresh_token) {
      return NextResponse.json({ 
        error: "No Google account connected. Please log out and log back in with Google." 
      }, { status: 400 });
    }

    // Exchange the refresh token for a Google access token via Auth0 Token Vault
    const googleToken = await getGoogleTokenFromAuth0Vault(user.google_refresh_token);

    if (!googleToken) {
      return NextResponse.json({ 
        error: "Failed to get Google access token. Please try logging in again." 
      }, { status: 500 });
    }

    // Create the Gmail draft
    const result = await createGmailDraft({
      token: googleToken,
      subject,
      body
    });

    if (!result.success) {
      return NextResponse.json({ 
        error: result.error || "Failed to create Gmail draft" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      draftId: result.draftId,
      message: "Draft created! Check your Gmail drafts folder."
    });

  } catch (error: any) {
    console.error("[gmail-draft] Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

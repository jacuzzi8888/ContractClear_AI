import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveUserUUID } from "@/lib/auth/get-user";
import { auth0 } from "@/lib/auth0";
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

    // Use Auth0 SDK's built-in getAccessTokenForConnection method
    let googleToken: string | null = null;
    let errorMsg: string | null = null;

    try {
      const result = await auth0.getAccessTokenForConnection({
        connection: "google-oauth2"
      });
      googleToken = result.token;
      console.log("[gmail-draft] Got Google token via SDK, length:", googleToken?.length);
    } catch (e: any) {
      console.error("[gmail-draft] SDK getAccessTokenForConnection error:", e);
      errorMsg = e.message || String(e);
    }

    if (!googleToken) {
      return NextResponse.json({ 
        error: "Failed to get Google access token",
        details: errorMsg || "Token not available"
      }, { status: 500 });
    }

    const gmailResult = await createGmailDraft({
      token: googleToken,
      subject,
      body
    });

    if (!gmailResult.success) {
      return NextResponse.json({ 
        error: gmailResult.error || "Failed to create Gmail draft" 
      }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      draftId: gmailResult.draftId,
      message: "Draft created! Check your Gmail drafts folder."
    });

  } catch (error: any) {
    console.error("[gmail-draft] Error:", error);
    return NextResponse.json({ error: "Internal server error", details: error.message }, { status: 500 });
  }
}

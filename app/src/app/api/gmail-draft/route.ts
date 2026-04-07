import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveUserUUID } from "@/lib/auth/get-user";
import { auth0 } from "@/lib/auth0";
import { createGmailDraft } from "@/lib/gmail-api";
import { getGoogleTokenFromManagementAPI } from "@/lib/auth0-mgmt";

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

    let googleToken: string | null = null;
    const errors: string[] = [];

    // ── Strategy 1: Auth0 SDK Token Vault ─────────────────────
    // Works if Token Vault is enabled on the Auth0 Google connection
    try {
      const result = await auth0.getAccessTokenForConnection({
        connection: "google-oauth2"
      });
      googleToken = result.token;
      console.log("[gmail-draft] ✓ Got Google token via SDK Token Vault");
    } catch (e: any) {
      const code = e.code || "unknown";
      console.warn(`[gmail-draft] ✗ SDK Token Vault failed: ${code}`);
      errors.push(`Token Vault: ${code}`);
    }

    // ── Strategy 2: Auth0 Management API ──────────────────────
    // Reads the IdP token stored during Google login
    if (!googleToken) {
      // We need the user's auth0_id to call the Management API
      const supabaseAdmin = getSupabaseAdmin();
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("auth0_id")
        .eq("id", userId)
        .single();

      if (user?.auth0_id) {
        console.log("[gmail-draft] Trying Management API for auth0_id:", user.auth0_id);
        const mgmtResult = await getGoogleTokenFromManagementAPI(user.auth0_id);
        
        if (mgmtResult.token) {
          googleToken = mgmtResult.token;
          console.log("[gmail-draft] ✓ Got Google token via Management API");
        } else {
          console.warn("[gmail-draft] ✗ Management API failed:", mgmtResult.error);
          errors.push(`Management API: ${mgmtResult.error}`);
        }
      } else {
        const msg = user 
          ? "User has no auth0_id — logged in with email/password, not Google"
          : "User not found in database";
        console.warn("[gmail-draft] ✗ Cannot use Management API:", msg);
        errors.push(msg);
      }
    }

    // ── All strategies failed ─────────────────────────────────
    if (!googleToken) {
      console.error("[gmail-draft] All token strategies failed:", errors);
      return NextResponse.json({ 
        error: "Unable to access Gmail. Please sign out and sign in again with Google.",
        details: errors.join(" | "),
        help: "If this persists, the Auth0 Google connection may need 'Token Vault' enabled or the M2M app needs 'read:user_idp_tokens' scope."
      }, { status: 401 });
    }

    // ── Create Gmail draft ────────────────────────────────────
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

import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { resolveUserUUID } from "@/lib/auth/get-user";
import { auth0 } from "@/lib/auth0";
import { createGmailDraft } from "@/lib/gmail-api";
import { getGoogleTokenFromAuth0Vault } from "@/lib/auth0-vault";

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
    let errorMsg: string | null = null;

    // Strategy 1: Try Auth0 SDK's built-in getAccessTokenForConnection
    try {
      const result = await auth0.getAccessTokenForConnection({
        connection: "google-oauth2"
      });
      googleToken = result.token;
      console.log("[gmail-draft] Got Google token via SDK, length:", googleToken?.length);
    } catch (e: any) {
      console.warn("[gmail-draft] SDK getAccessTokenForConnection failed (expected if federated token not stored):", e.code || e.message);
    }

    // Strategy 2: Fallback — use the locally-stored Google refresh token
    if (!googleToken) {
      console.log("[gmail-draft] Falling back to locally-stored refresh token for user:", userId);
      const supabaseAdmin = getSupabaseAdmin();
      const { data: user } = await supabaseAdmin
        .from("users")
        .select("google_refresh_token")
        .eq("id", userId)
        .single();

      const storedToken = user?.google_refresh_token;
      if (storedToken) {
        // Try as refresh token first, then as access token
        const refreshResult = await getGoogleTokenFromAuth0Vault(storedToken, true);
        if (refreshResult.token) {
          googleToken = refreshResult.token;
          console.log("[gmail-draft] Got Google token via vault (refresh_token exchange), length:", googleToken?.length);
        } else {
          console.warn("[gmail-draft] Vault refresh_token exchange failed:", refreshResult.error);
          // The stored token might actually be a Google access token (not a refresh token)
          // Try using it directly as an access token
          const accessResult = await getGoogleTokenFromAuth0Vault(storedToken, false);
          if (accessResult.token) {
            googleToken = accessResult.token;
            console.log("[gmail-draft] Got Google token via vault (access_token exchange), length:", googleToken?.length);
          } else {
            console.warn("[gmail-draft] Vault access_token exchange also failed:", accessResult.error);
            // Last resort: try the stored token directly as a Google access token
            // (it might still be valid if the user logged in recently)
            googleToken = storedToken;
            console.log("[gmail-draft] Using stored token directly as Google access token, length:", googleToken?.length);
          }
        }
      } else {
        errorMsg = "No Google token found. Please log out and sign in again with Google to grant Gmail access.";
        console.error("[gmail-draft] No google_refresh_token in DB for user:", userId);
      }
    }

    if (!googleToken) {
      return NextResponse.json({ 
        error: "Failed to get Google access token. Please sign out and sign in again with Google.",
        details: errorMsg || "Token not available"
      }, { status: 401 });
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

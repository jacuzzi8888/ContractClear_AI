import { inngest } from "@/lib/inngest/client";
import { INNGEST_EVENT_NAME } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserUUID } from "@/lib/auth/get-user";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth0 } from "@/lib/auth0";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userId = await resolveUserUUID(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get Auth0 session to extract tokens for Token Vault exchange
  const session = await auth0.getSession();
  const auth0SubjectToken = session?.refreshToken || session?.accessToken || null;
  const isRefreshToken = !!session?.refreshToken;

  try {
    const rateLimitError = await checkRateLimit(request);
    if (rateLimitError) return rateLimitError;

    const { documentId } = await request.json();
    const supabase = getSupabaseAdmin();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, jobs ( id, status )")
      .eq("id", documentId)
      .eq("owner_id", userId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const activeJobs = doc.jobs?.filter((j: any) => j.status === "queued" || j.status === "processing") || [];
    if (activeJobs.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Analysis already in progress",
        jobId: activeJobs[0].id 
      });
    }

    const isProd = process.env.NODE_ENV === "production";

    try {
      await inngest.send({
        name: INNGEST_EVENT_NAME,
        data: {
          documentId: doc.id,
          ownerId: userId,
          fileName: doc.file_name,
          auth0SubjectToken,
          isRefreshToken,
        },
      });

      await supabase
        .from("documents")
        .update({ status: "queued" })
        .eq("id", documentId);

    } catch (inngestErr: any) {
      return NextResponse.json({ 
        error: "Failed to queue analysis. Please try again.", 
        details: isProd ? undefined : inngestErr.message,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Analysis initialized" });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
import { INNGEST_EVENT_NAME } from "@/lib/constants";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const { documentId } = await request.json();
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Verify document ownership and check for active jobs
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select(`
        *,
        jobs ( id, status )
      `)
      .eq("id", documentId)
      .eq("owner_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // Check for existing active jobs (idempotency)
    const activeJobs = doc.jobs?.filter((j: any) => j.status === "queued" || j.status === "processing") || [];
    if (activeJobs.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Analysis already in progress",
        jobId: activeJobs[0].id 
      });
    }

    // 3. Trigger Inngest background job (Send FIRST to avoid stranded "queued" status)
    const isProd = process.env.NODE_ENV === "production";
    
    try {
      await inngest.send({
        name: INNGEST_EVENT_NAME,
        data: {
          documentId: doc.id,
          ownerId: user.id,
          fileName: doc.file_name,
        },
      });
      
      // 4. Update status to queued ONLY after successful send
      await supabase
        .from("documents")
        .update({ status: "queued" })
        .eq("id", documentId);

    } catch (inngestErr: any) {
      console.error("[Inngest/Jobs] Inngest send failure:", inngestErr);
      return NextResponse.json({ 
        error: "Failed to queue analysis. Please try again.", 
        details: isProd ? undefined : inngestErr.message,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Analysis initialized" });
  } catch (err: any) {
    console.error("Full /api/jobs handler error:", err);
    const isProd = process.env.NODE_ENV === "production";
    return NextResponse.json({ 
      error: "Internal Server Error", 
      message: isProd ? "An unexpected error occurred" : err.message,
    }, { status: 500 });
  }
}

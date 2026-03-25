
import { inngest } from "@/lib/inngest/client";
import { INNGEST_EVENT_NAME } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const { documentId } = await request.json();
    const supabase = createClient();

    // Verify document ownership and check for active jobs
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, jobs ( id, status )")
      .eq("id", documentId)
      .eq("owner_id", userId)
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

    // Trigger Inngest background job
    const isProd = process.env.NODE_ENV === "production";
    
    try {
      await inngest.send({
        name: INNGEST_EVENT_NAME,
        data: {
          documentId: doc.id,
          ownerId: userId,
          fileName: doc.file_name,
        },
      });
      
      // Update status to queued ONLY after successful send
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

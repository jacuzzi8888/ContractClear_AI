
import { createClient } from "@/lib/supabase/server";
import { auth0 } from "@/lib/auth0";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const { id: jobId } = await params;
    const supabase = await createClient();

    // Fetch job with issues
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, issues (*)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // Verify ownership
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("owner_id")
      .eq("id", job.document_id)
      .single();

    if (docError || doc.owner_id !== userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(job);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

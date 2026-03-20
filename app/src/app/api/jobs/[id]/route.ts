import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabase = await createClient();
    const { id: jobId } = await params;

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch job with issues
    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select(`
        *,
        issues (*)
      `)
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    // 3. Verify ownership (via document join)
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("owner_id")
      .eq("id", job.document_id)
      .single();

    if (docError || doc.owner_id !== user.id) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(job);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
import { resolveUserUUID } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await resolveUserUUID(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, issues (*)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

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

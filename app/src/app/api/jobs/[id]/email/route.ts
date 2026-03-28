
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { draftSummaryEmail } from "@/lib/gemini";
import { resolveUserUUID } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const jobId = params.id;

    const userId = await resolveUserUUID(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("id, documents!inner (id, owner_id)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const jobWithRelations = job as any;
    if (jobWithRelations.documents?.owner_id !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const severityOrder: Record<string, number> = {
      critical: 0, high: 1, medium: 2, low: 3, info: 4,
    };

    const { data: issues, error: issuesError } = await supabase
      .from("issues")
      .select("id, risk_level, quote, explanation, recommended_action, page_number")
      .eq("job_id", jobId);

    if (issuesError || !issues || issues.length === 0) {
      return NextResponse.json({ error: "No issues found for this job" }, { status: 404 });
    }

    const sorted = [...issues].sort(
      (a, b) => (severityOrder[a.risk_level] ?? 5) - (severityOrder[b.risk_level] ?? 5)
    );

    const draft = await draftSummaryEmail(
      sorted.map((i) => ({
        risk_level: i.risk_level,
        quote: i.quote,
        explanation: i.explanation,
        recommended_action: i.recommended_action || "Please review and revise this clause.",
        page_number: i.page_number,
      }))
    );

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Draft summary email error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate summary email" }, { status: 500 });
  }
}

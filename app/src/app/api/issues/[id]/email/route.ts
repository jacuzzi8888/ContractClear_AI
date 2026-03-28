
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { draftNegotiationEmail } from "@/lib/gemini";
import { resolveUserUUID } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    const userId = await resolveUserUUID(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = getSupabaseAdmin();

    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select("id, quote, explanation, recommended_action, jobs!inner (id, documents!inner (id, owner_id))")
      .eq("id", id)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    const issueWithRelations = issue as any;
    if (issueWithRelations.jobs?.documents?.owner_id !== userId) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const draft = await draftNegotiationEmail(
      issue.quote,
      issue.explanation,
      issue.recommended_action || "Please review and revise this clause."
    );

    return NextResponse.json(draft);
  } catch (error: any) {
    console.error("Draft email error:", error);
    return NextResponse.json({ error: error.message || "Failed to generate email draft" }, { status: 500 });
  }
}

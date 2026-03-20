import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { draftNegotiationEmail } from "@/lib/gemini";

export const dynamic = "force-dynamic";

export async function POST(
  request: Request,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    // Initialize Supabase configured for Next.js SSR
    const supabase = await createClient();
    
    // Check if user is authenticated
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Fetch the issue details from Supabase
    // We join with jobs to ensure the user has access to this data (RLS will also help protect it)
    const { data: issue, error: issueError } = await supabase
      .from("issues")
      .select(`
        id,
        quote,
        explanation,
        recommended_action,
        jobs!inner (
          id,
          documents!inner (
            id,
            user_id
          )
        )
      `)
      .eq("id", id)
      .single();

    if (issueError || !issue) {
      return NextResponse.json({ error: "Issue not found" }, { status: 404 });
    }

    // Double check ownership (though RLS should handle this, it's good practice)
    const issueWithRelations = issue as any;
    if (issueWithRelations.jobs?.documents?.user_id !== user.id) {
       return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Call Gemini to draft the email
    const draft = await draftNegotiationEmail(
      issue.quote,
      issue.explanation,
      issue.recommended_action || "Please review and revise this clause."
    );

    return NextResponse.json(draft);

  } catch (error: any) {
    console.error("Draft email error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to generate email draft" },
      { status: 500 }
    );
  }
}

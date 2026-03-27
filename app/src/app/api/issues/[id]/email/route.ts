
import { NextRequest, NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { draftNegotiationEmail } from "@/lib/gemini";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";

export const dynamic = "force-dynamic";

async function getUserId(request: NextRequest): Promise<string | null> {
  const sessionCookie = request.cookies.get("__session")?.value;
  if (!sessionCookie) return null;
  const secret = process.env.AUTH0_SECRET;
  if (!secret) return null;
  try {
    const key = await hkdf("sha256", secret, "", "JWE CEK", 32);
    const result = await jose.jwtDecrypt(sessionCookie, key, { clockTolerance: 15 });
    return (result.payload as any)?.user?.sub || null;
  } catch {
    return null;
  }
}

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const params = await props.params;
    const id = params.id;

    const userId = await getUserId(request);
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

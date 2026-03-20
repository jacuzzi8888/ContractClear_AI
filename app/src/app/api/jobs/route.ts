import { createClient } from "@/lib/supabase/server";
import { inngest } from "@/lib/inngest/client";
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

    // 2. Verify document ownership
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*")
      .eq("id", documentId)
      .eq("owner_id", user.id)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    // 3. Update status to queued
    await supabase
      .from("documents")
      .update({ status: "queued" })
      .eq("id", documentId);

    // 4. Trigger Inngest background job
    await inngest.send({
      name: "contract/analyze",
      data: {
        documentId: doc.id,
        ownerId: user.id,
        fileName: doc.file_name,
      },
    });

    return NextResponse.json({ success: true, message: "Analysis queued" });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

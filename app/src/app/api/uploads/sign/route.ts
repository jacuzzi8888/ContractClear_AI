import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const { fileName, contentType } = await request.json();
    const supabase = await createClient();

    // 1. Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Generate unique path: user_id/uuid.pdf
    const fileId = uuidv4();
    const filePath = `${user.id}/${fileId}.pdf`;

    // 3. Create signed upload URL (valid for 10 minutes)
    const { data, error } = await supabase.storage
      .from("contracts")
      .createSignedUploadUrl(filePath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // 4. Create pending document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        id: fileId,
        owner_id: user.id,
        file_name: fileName,
        file_url: filePath,
        status: "pending",
      })
      .select()
      .single();

    if (docError) {
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    return NextResponse.json({
      uploadUrl: data.signedUrl,
      documentId: doc.id,
      path: filePath,
    });
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

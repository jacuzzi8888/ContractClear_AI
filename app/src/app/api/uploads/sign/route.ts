
import { createClient } from "@/lib/supabase/server";
import { auth0 } from "@/lib/auth0";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY, ACCEPTED_FILE_TYPES, STORAGE_BUCKET } from "@/lib/constants";
import { NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const session = await auth0.getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    const { fileName, contentType, fileSize } = await request.json();
    const supabase = await createClient();

    // Server-side validation
    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the " + MAX_FILE_SIZE_DISPLAY + " limit." }, { status: 400 });
    }

    // Generate unique path: owner_id/uuid.pdf
    const fileId = uuidv4();
    const filePath = userId + "/" + fileId + ".pdf";

    // Create signed upload URL (valid for 10 minutes)
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Create pending document record
    const { data: doc, error: docError } = await supabase
      .from("documents")
      .insert({
        id: fileId,
        owner_id: userId,
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

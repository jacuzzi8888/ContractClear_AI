import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY, STORAGE_BUCKET } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { resolveUserUUID } from "@/lib/auth/get-user";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  const userId = await resolveUserUUID(request);
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;

    const supabase = getSupabaseAdmin();

    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the " + MAX_FILE_SIZE_DISPLAY + " limit." }, { status: 400 });
    }

    const fileId = uuidv4();
    const safeUserId = userId.replace(/\|/g, "-");
    const filePath = safeUserId + "/" + fileId + ".pdf";

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (urlError) {
      return NextResponse.json({ error: urlError.message }, { status: 500 });
    }

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
      uploadUrl: signedUrlData.signedUrl,
      documentId: doc.id,
      path: filePath,
    });

  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

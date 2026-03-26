import { createClient } from "@/lib/supabase/server";
import { auth0 } from "@/lib/auth0";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY, STORAGE_BUCKET } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("[uploads/sign] Handler called");
  console.log("[uploads/sign] AUTH0_DOMAIN:", process.env.AUTH0_DOMAIN ? "set" : "missing");
  console.log("[uploads/sign] AUTH0_SECRET:", process.env.AUTH0_SECRET ? "set" : "missing");

  let session = null;

  try {
    session = await auth0.getSession();
    console.log("[uploads/sign] getSession() result:", session ? "has session" : "null");
  } catch (e: any) {
    console.error("[uploads/sign] getSession() error:", e?.message, e?.code, e?.name);

    try {
      session = await auth0.getSession(request);
      console.log("[uploads/sign] getSession(request) result:", session ? "has session" : "null");
    } catch (e2: any) {
      console.error("[uploads/sign] getSession(request) error:", e2?.message, e2?.code, e2?.name);
      return NextResponse.json({ error: "No session: " + (e2?.message || String(e2)) }, { status: 401 });
    }
  }

  if (!session) {
    console.log("[uploads/sign] No session found, returning 401");
    return NextResponse.json({ error: "No active session" }, { status: 401 });
  }

  try {
    const userId = session.user.sub;
    console.log("[uploads/sign] User:", userId);

    const body = await request.json();
    const { fileName, contentType, fileSize } = body;
    console.log("[uploads/sign] File:", fileName, contentType, fileSize);

    const supabase = await createClient();

    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the " + MAX_FILE_SIZE_DISPLAY + " limit." }, { status: 400 });
    }

    const fileId = uuidv4();
    const filePath = userId + "/" + fileId + ".pdf";
    console.log("[uploads/sign] Path:", filePath);

    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(filePath);

    if (urlError) {
      console.error("[uploads/sign] URL error:", urlError.message);
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
      console.error("[uploads/sign] Doc error:", docError.message);
      return NextResponse.json({ error: docError.message }, { status: 500 });
    }

    console.log("[uploads/sign] Success:", doc.id);
    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      documentId: doc.id,
      path: filePath,
    });

  } catch (err: any) {
    console.error("[uploads/sign] Handler error:", err?.message, err);
    return NextResponse.json({ error: "Internal error: " + (err?.message || String(err)) }, { status: 500 });
  }
}

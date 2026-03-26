
import { createClient } from "@/lib/supabase/server";
import { auth0 } from "@/lib/auth0";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY, STORAGE_BUCKET } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  console.log("[uploads/sign] Starting upload sign request");
  
  try {
    const session = await auth0.getSession();
    console.log("[uploads/sign] Session:", session ? "exists" : "null");
    
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.sub;
    console.log("[uploads/sign] User ID:", userId);
    
    let body;
    try {
      body = await request.json();
    } catch (parseErr) {
      console.error("[uploads/sign] JSON parse error:", parseErr);
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }
    
    const { fileName, contentType, fileSize } = body;
    console.log("[uploads/sign] File:", fileName, contentType, fileSize);

    let supabase;
    try {
      supabase = await createClient();
    } catch (supabaseErr) {
      console.error("[uploads/sign] Supabase client error:", supabaseErr);
      return NextResponse.json({ error: "Database connection error" }, { status: 500 });
    }

    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the " + MAX_FILE_SIZE_DISPLAY + " limit." }, { status: 400 });
    }

    const fileId = uuidv4();
    const filePath = userId + "/" + fileId + ".pdf";
    console.log("[uploads/sign] File path:", filePath);

    let signedUrlData;
    try {
      const { data, error } = await supabase.storage
        .from(STORAGE_BUCKET)
        .createSignedUploadUrl(filePath);
      
      if (error) {
        console.error("[uploads/sign] Signed URL error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
      signedUrlData = data;
    } catch (storageErr) {
      console.error("[uploads/sign] Storage error:", storageErr);
      return NextResponse.json({ error: "Storage error: " + String(storageErr) }, { status: 500 });
    }

    let doc;
    try {
      const { data, error: docError } = await supabase
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
        console.error("[uploads/sign] Document insert error:", docError);
        return NextResponse.json({ error: docError.message }, { status: 500 });
      }
      doc = data;
    } catch (docErr) {
      console.error("[uploads/sign] Document insert exception:", docErr);
      return NextResponse.json({ error: "Document creation error: " + String(docErr) }, { status: 500 });
    }

    console.log("[uploads/sign] Success:", doc.id);
    
    return NextResponse.json({
      uploadUrl: signedUrlData.signedUrl,
      documentId: doc.id,
      path: filePath,
    });
    
  } catch (err) {
    console.error("[uploads/sign] Overall error:", err);
    return NextResponse.json({ error: "Internal Server Error: " + String(err) }, { status: 500 });
  }
}

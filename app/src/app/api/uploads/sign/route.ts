import { createClient } from "@/lib/supabase/server";
import { MAX_FILE_SIZE_BYTES, MAX_FILE_SIZE_DISPLAY, STORAGE_BUCKET } from "@/lib/constants";
import { NextRequest, NextResponse } from "next/server";
import { v4 as uuidv4 } from "uuid";
import { hkdf } from "@panva/hkdf";
import * as jose from "jose";

export const dynamic = "force-dynamic";

async function getSessionFromCookie(cookieValue: string) {
  const secret = process.env.AUTH0_SECRET;
  if (!secret) return null;

  try {
    const encryptionSecret = await hkdf("sha256", secret, "", "JWE CEK", 32);
    const result = await jose.jwtDecrypt(cookieValue, encryptionSecret, {
      clockTolerance: 15,
    });
    return result.payload;
  } catch {
    return null;
  }
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;

  // Try to read the __session cookie directly
  const sessionCookie = request.cookies.get("__session")?.value;

  if (sessionCookie) {
    const payload = await getSessionFromCookie(sessionCookie);
    if (payload?.sub) {
      userId = payload.sub as string;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { fileName, contentType, fileSize } = body;

    const supabase = await createClient();

    if (contentType !== "application/pdf") {
      return NextResponse.json({ error: "Only PDF files are accepted." }, { status: 400 });
    }

    if (fileSize && fileSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "File exceeds the " + MAX_FILE_SIZE_DISPLAY + " limit." }, { status: 400 });
    }

    const fileId = uuidv4();
    const filePath = userId + "/" + fileId + ".pdf";

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

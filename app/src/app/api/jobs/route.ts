import { inngest } from "@/lib/inngest/client";
import { INNGEST_EVENT_NAME } from "@/lib/constants";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
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

  const sessionCookie = request.cookies.get("__session")?.value;
  if (sessionCookie) {
    const payload = await getSessionFromCookie(sessionCookie);
    const sub = (payload as any)?.user?.sub;
    if (sub) {
      userId = sub as string;
    }
  }

  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { documentId } = await request.json();
    const supabase = getSupabaseAdmin();

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("*, jobs ( id, status )")
      .eq("id", documentId)
      .eq("owner_id", userId)
      .single();

    if (docError || !doc) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 });
    }

    const activeJobs = doc.jobs?.filter((j: any) => j.status === "queued" || j.status === "processing") || [];
    if (activeJobs.length > 0) {
      return NextResponse.json({ 
        success: true, 
        message: "Analysis already in progress",
        jobId: activeJobs[0].id 
      });
    }

    const isProd = process.env.NODE_ENV === "production";

    try {
      await inngest.send({
        name: INNGEST_EVENT_NAME,
        data: {
          documentId: doc.id,
          ownerId: userId,
          fileName: doc.file_name,
        },
      });

      await supabase
        .from("documents")
        .update({ status: "queued" })
        .eq("id", documentId);

    } catch (inngestErr: any) {
      return NextResponse.json({ 
        error: "Failed to queue analysis. Please try again.", 
        details: isProd ? undefined : inngestErr.message,
      }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: "Analysis initialized" });
  } catch (err: any) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

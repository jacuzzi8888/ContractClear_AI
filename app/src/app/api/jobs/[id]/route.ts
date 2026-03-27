
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { NextRequest, NextResponse } from "next/server";
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: jobId } = await params;
    const supabase = getSupabaseAdmin();

    const { data: job, error: jobError } = await supabase
      .from("jobs")
      .select("*, issues (*)")
      .eq("id", jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    const { data: doc, error: docError } = await supabase
      .from("documents")
      .select("owner_id")
      .eq("id", job.document_id)
      .single();

    if (docError || doc.owner_id !== userId) {
       return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return NextResponse.json(job);
  } catch (err) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

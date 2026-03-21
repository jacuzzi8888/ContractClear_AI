import { inngest } from "@/lib/inngest/client";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const result = await inngest.send({
      name: "contract/analyze",
      data: {
        documentId: "test-id",
        ownerId: "test-owner",
        fileName: "test-file.pdf",
      },
    });
    
    return NextResponse.json({ 
      success: true, 
      message: "Test event sent to Inngest", 
      result,
      env: {
        hasEventKey: !!process.env.INNGEST_EVENT_KEY,
        hasSigningKey: !!process.env.INNGEST_SIGNING_KEY,
        vercelUrl: process.env.VERCEL_URL || "not-set",
      }
    });
  } catch (err: any) {
    return NextResponse.json({ 
      success: false, 
      error: err.message,
      stack: err.stack 
    }, { status: 500 });
  }
}

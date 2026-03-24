import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { analyzeContract, handleAnalysisFailure } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // Must be literal for Next.js route config

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeContract,
    handleAnalysisFailure,
  ],
  streaming: true, // Help bypass Vercel 10s timeout on some plans
});

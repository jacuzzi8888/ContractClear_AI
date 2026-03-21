import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { analyzeContract, handleAnalysisFailure } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";
export const maxDuration = 90; // Extend to 90s for Gemini analysis

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeContract,
    handleAnalysisFailure,
  ],
  streaming: "allow", // Help bypass Vercel 10s timeout on some plans
});

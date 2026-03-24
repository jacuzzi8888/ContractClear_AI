import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { analyzeContract, handleAnalysisFailure } from "@/lib/inngest/functions";
import { INNGEST_MAX_DURATION } from "@/lib/constants";

export const dynamic = "force-dynamic";
export const maxDuration = INNGEST_MAX_DURATION;

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeContract,
    handleAnalysisFailure,
  ],
  streaming: true, // Help bypass Vercel 10s timeout on some plans
});

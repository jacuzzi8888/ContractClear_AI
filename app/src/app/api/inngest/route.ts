import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { analyzeContract, handleAnalysisFailure } from "@/lib/inngest/functions";

export const dynamic = "force-dynamic";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [
    analyzeContract,
    handleAnalysisFailure,
  ],
});

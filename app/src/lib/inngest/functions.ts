import { inngest } from "./client";
import { getSupabaseAdmin } from "../supabase/admin";
import { analyzeContractPDF } from "../gemini";
import { validateIssues } from "../grounding";

export const analyzeContract = inngest.createFunction(
  { id: "analyze-contract", retries: 2, triggers: [{ event: "contract/analyze" }] },
  async ({ event, step }) => {
    try {
      const { documentId, ownerId, fileName } = event.data;
      console.log(`[Inngest] >>> Starting analysis for "${fileName}" (Doc: ${documentId})`);

      // 1. Re-validate ownership
      const doc = await step.run("revalidate-ownership", async () => {
        const supabaseAdmin = getSupabaseAdmin();
        const { data, error } = await supabaseAdmin
          .from("documents")
          .select("*")
          .eq("id", documentId)
          .eq("owner_id", ownerId)
          .single();
        
        if (error || !data) {
          console.error(`[Inngest] Ownership check failed for doc ${documentId}. Error: ${error?.message}`);
          throw new Error("Unauthorized: Document ownership mismatch");
        }
        return data;
      });

      // 2. Initialize Job
      const job = await step.run("initialize-job", async () => {
        const supabaseAdmin = getSupabaseAdmin();
        const { data: existing } = await supabaseAdmin
          .from("jobs")
          .select("id, status")
          .eq("document_id", documentId)
          .in("status", ["queued", "processing"])
          .limit(1);

        if (existing && existing.length > 0) {
          console.info(`[Inngest] Resuming existing active job: ${existing[0].id}`);
          return existing[0];
        }

        const { data, error } = await supabaseAdmin
          .from("jobs")
          .insert({ document_id: documentId, status: "processing" })
          .select()
          .single();

        if (error) throw new Error(`Job creation failed: ${error.message}`);
        console.info(`[Inngest] Created new job: ${data.id}`);
        return data;
      });

    // ── Step 2: Update Document Status ──────────────────────
    await step.run("update-doc-status", async () => {
      console.log(`[Inngest] Updating document status to processing: ${documentId}`);
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from("documents")
        .update({ status: "processing" })
        .eq("id", documentId);
    });

    // ── Step 3: Fetch PDF from Storage ──────────────────────
    const pdfBase64 = await step.run("fetch-document", async () => {
      console.log(`[Inngest] Fetching PDF from storage: ${doc.file_url}`);
      const supabaseAdmin = getSupabaseAdmin();
      
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from("contracts")
        .download(doc.file_url);

      if (downloadErr || !fileData) {
        throw new Error(`File download failed: ${downloadErr?.message}`);
      }

      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString("base64");
    });

    // ── Step 4: Extract Risks with Gemini ──────────────────
    const extraction = await step.run("extract-risks", async () => {
      console.log(`[Inngest] Calling Gemini for contract analysis...`);
      const result = await analyzeContractPDF(pdfBase64);
      console.log(`[Inngest] Gemini returned ${result.issues.length} issues.`);
      return result;
    });

    if (job.status === "completed") return { message: "Analysis already completed." };

    // ── Step 5: Validate & Store Issues ─────────────────────
    const result = await step.run("validate-and-store", async () => {
      console.log(`[Inngest] Validating and storing issues...`);
      const supabaseAdmin = getSupabaseAdmin();
      const { valid, dropped } = validateIssues(extraction.issues);

      let storedCount = 0;
      for (const issue of valid) {
        const { error } = await supabaseAdmin.from("issues").insert({
          job_id: job.id,
          risk_level: issue.risk_level,
          quote: issue.quote,
          page_number: issue.page_number,
          explanation: issue.explanation,
          recommended_action: issue.recommended_action,
          confidence: issue.confidence,
        });

        if (error) {
          console.error(`Failed to insert issue: ${error.message}`);
        } else {
          storedCount++;
        }
      }

      return { stored: storedCount, dropped };
    });

    // ── Step 6: Finalize Job ────────────────────────────────
    await step.run("finalize-job", async () => {
      console.log(`[Inngest] Finalizing job status...`);
      const supabaseAdmin = getSupabaseAdmin();
      await supabaseAdmin
        .from("jobs")
        .update({
          status: "completed",
          finished_at: new Date().toISOString(),
          issue_count: result.stored,
          summary: extraction.summary,
        })
        .eq("id", job.id);

      await supabaseAdmin
        .from("documents")
        .update({
          status: "completed",
          page_count: extraction.totalPages,
        })
        .eq("id", documentId);
    });

    console.log(`[Inngest] <<< ANALYSIS COMPLETE for: ${documentId}`);

    return {
      message: `Analysis complete.`,
      issuesFound: result.stored,
      issuesDropped: result.dropped,
      summary: extraction.summary,
    };
  } catch (err: any) {
    console.error(`[Inngest] CRITICAL FAILURE for document ${event.data?.documentId}:`, err);
    throw err; // Re-throw to trigger Inngest failure handler
  }
}
);

    console.info(`[Inngest] <<< ANALYSIS COMPLETE for: ${documentId}`);

    return {
      message: `Analysis of "${fileName}" complete.`,
      issuesFound: result.stored,
      issuesDropped: result.dropped,
      summary: extraction.summary,
    };
  }
);

// ── Failure Handler ───────────────────────────────────────────
export const handleAnalysisFailure = inngest.createFunction(
  { id: "handle-analysis-failure", triggers: [{ event: "inngest/function.failed" }] },
  async ({ event, step }) => {
    // Only handle failures from our analyze function
    const fnId = (event as any).data?.function_id;
    if (fnId !== "analyze-contract") return;

    const originalEvent = (event.data as any)?.event;
    const documentId = originalEvent?.data?.documentId;
    const jobId = originalEvent?.data?.jobId || originalEvent?.data?.job?.id; // Attempt to get job ID from context if possible
    if (!documentId) return;

    await step.run("mark-job-failed", async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const errorMessage =
        (event.data as any)?.error?.message || "Unknown error during analysis";

      // If we have a specific job ID, use it. Otherwise find the latest processing job for this doc.
      let query = supabaseAdmin
        .from("jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_code: "ANALYSIS_ERROR",
          error_message: errorMessage,
        });

      if (jobId) {
        query = query.eq("id", jobId);
      } else {
        query = query.eq("document_id", documentId).eq("status", "processing");
      }

      await query;

      await supabaseAdmin
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
    });
  }
);

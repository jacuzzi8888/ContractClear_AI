import { inngest } from "./client";
import { getSupabaseAdmin } from "../supabase/admin";
import { analyzeContractPDF } from "../gemini";
import { validateIssues } from "../grounding";

export const analyzeContract = inngest.createFunction(
  { id: "analyze-contract", retries: 2, triggers: [{ event: "contract/analyze" }] },
  async ({ event, step }) => {
    const { documentId, ownerId, fileName } = event.data as any;
    console.info(`[Inngest] >>> STARTING ANALYSIS for: ${fileName} (Doc: ${documentId})`);

    // ── Step 1: Initialize Job ──────────────────────────────
    const job = await step.run("initialize-job", async () => {
      console.info("[Inngest] Step: initialize-job");
      const supabaseAdmin = getSupabaseAdmin();

      // 1. Re-validate ownership even with service role (Defense in depth)
      const { data: doc, error: docCheckErr } = await supabaseAdmin
        .from("documents")
        .select("owner_id, status")
        .eq("id", documentId)
        .single();

      if (docCheckErr || !doc) throw new Error(`Document access verification failed`);
      if (doc.owner_id !== ownerId) throw new Error(`Document ownership mismatch for document ${documentId}`);

      // 2. Check for existing active jobs (Idempotency)
      const { data: existingJobs } = await supabaseAdmin
        .from("jobs")
        .select("id, status")
        .eq("document_id", documentId)
        .in("status", ["queued", "processing"]);

      if (existingJobs && existingJobs.length > 0) {
        console.warn(`[Inngest] Analysis already in progress for doc: ${documentId}. Skipping init.`);
        return existingJobs[0];
      }

      // 3. Create a job record linked to this document
      const { data, error } = await supabaseAdmin
        .from("jobs")
        .insert({
          document_id: documentId,
          status: "processing",
          started_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw new Error(`Job init failed: ${error.message}`);

      // Mark document as processing
      await supabaseAdmin
        .from("documents")
        .update({ status: "processing" })
        .eq("id", documentId);

      return data;
    });

    // If step 1 returned an already completed or processing job from someone else's race, we could handle it, 
    // but here we just proceed with the job found or created.
    if (job.status === "completed") return { message: "Analysis already completed." };


    // ── Step 2: Fetch PDF from Storage ──────────────────────
    const pdfBase64 = await step.run("fetch-document", async () => {
      console.info("[Inngest] Step: fetch-document");
      const supabaseAdmin = getSupabaseAdmin();
      // Get the document's storage path
      const { data: doc, error: docErr } = await supabaseAdmin
        .from("documents")
        .select("file_url")
        .eq("id", documentId)
        .single();

      if (docErr || !doc?.file_url) {
        throw new Error(`Document not found: ${docErr?.message}`);
      }

      // Download the file from Supabase Storage
      const { data: fileData, error: downloadErr } = await supabaseAdmin.storage
        .from("contracts")
        .download(doc.file_url);

      if (downloadErr || !fileData) {
        throw new Error(`File download failed: ${downloadErr?.message}`);
      }

      // Convert Blob → ArrayBuffer → base64
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      return buffer.toString("base64");
    });

    // ── Step 3: Analyze with Gemini ─────────────────────────
    const extraction = await step.run("analyze-with-gemini", async () => {
      console.info("[Inngest] Step: analyze-with-gemini (calling LLM)");
      return await analyzeContractPDF(pdfBase64);
    });

    // ── Step 4: Validate & Store Issues ─────────────────────
    const result = await step.run("validate-and-store", async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const { valid, dropped } = validateIssues(extraction.issues);

      // Insert each validated issue into the DB (triggers Realtime)
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

    // ── Step 5: Finalize Job ────────────────────────────────
    await step.run("finalize-job", async () => {
      console.info("[Inngest] Step: finalize-job");
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

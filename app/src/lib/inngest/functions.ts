import { inngest } from "./client";
import { getSupabaseAdmin } from "../supabase/admin";
import { analyzeContractPDF } from "../gemini";
import { validateIssues } from "../grounding";

export const analyzeContract = inngest.createFunction(
  { id: "analyze-contract", retries: 2 },
  { event: "contract/analyze" },
  async ({ event, step }) => {
    const { documentId, ownerId, fileName } = event.data as any;

    // ── Step 1: Initialize Job ──────────────────────────────
    const job = await step.run("initialize-job", async () => {
      const supabaseAdmin = getSupabaseAdmin();
      // Create a job record linked to this document
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

    // ── Step 2: Fetch PDF from Storage ──────────────────────
    const pdfBase64 = await step.run("fetch-document", async () => {
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
      return await analyzeContractPDF(pdfBase64);
    });

    // ── Step 4: Validate & Store Issues ─────────────────────
    const result = await step.run("validate-and-store", async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const { valid, dropped } = validateIssues(extraction.issues);

      // Insert each validated issue into the DB (triggers Realtime)
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
        }
      }

      return { stored: valid.length, dropped };
    });

    // ── Step 5: Finalize Job ────────────────────────────────
    await step.run("finalize-job", async () => {
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
  { id: "handle-analysis-failure" },
  { event: "inngest/function.failed" },
  async ({ event, step }) => {
    // Only handle failures from our analyze function
    const fnId = (event as any).data?.function_id;
    if (fnId !== "analyze-contract") return;

    const originalEvent = (event.data as any)?.event;
    const documentId = originalEvent?.data?.documentId;
    if (!documentId) return;

    await step.run("mark-job-failed", async () => {
      const supabaseAdmin = getSupabaseAdmin();
      const errorMessage =
        (event.data as any)?.error?.message || "Unknown error during analysis";

      // Mark the latest job for this document as failed
      await supabaseAdmin
        .from("jobs")
        .update({
          status: "failed",
          finished_at: new Date().toISOString(),
          error_code: "ANALYSIS_ERROR",
          error_message: errorMessage,
        })
        .eq("document_id", documentId)
        .eq("status", "processing");

      await supabaseAdmin
        .from("documents")
        .update({ status: "failed" })
        .eq("id", documentId);
    });
  }
);

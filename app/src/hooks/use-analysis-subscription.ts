"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface UseAnalysisSubscriptionOptions {
  documentId: string | null;
  onComplete?: () => void;
}

interface AnalysisState {
  findings: any[];
  isProcessing: boolean;
  status: "idle" | "processing" | "completed" | "failed";
  error: string | null;
}

export function useAnalysisSubscription({ documentId, onComplete }: UseAnalysisSubscriptionOptions): AnalysisState {
  const [findings, setFindings] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<AnalysisState["status"]>("idle");
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  // Reset when documentId changes to null
  useEffect(() => {
    if (!documentId) {
      setFindings([]);
      setIsProcessing(false);
      setStatus("idle");
      setError(null);
    }
  }, [documentId]);

  useEffect(() => {
    if (!documentId) return;

    console.info(`%c[Realtime] Initializing listeners for document: ${documentId}`, "color: #818cf8; font-weight: bold;");
    setIsProcessing(true);
    setStatus("processing");
    setError(null);
    setFindings([]);

    let issuesChannel: any = null;
    let done = false;

    const markComplete = (s: "completed" | "failed", detail?: { count?: number; errMsg?: string }) => {
      if (done) return;
      done = true;
      setIsProcessing(false);
      setStatus(s);
      if (s === "completed") {
        setError(null);
        toast.success("Analysis complete", {
          description: `${detail?.count ?? 0} issue${(detail?.count ?? 0) !== 1 ? "s" : ""} found in your contract.`,
        });
      } else {
        setError(detail?.errMsg || "Document processing failed.");
        toast.error("Analysis failed", {
          description: detail?.errMsg || "Something went wrong during document processing.",
        });
      }
      onCompleteRef.current?.();
    };

    const setupIssuesListener = (jobId: string) => {
      console.info(`%c[Realtime] Connecting to issues for job: ${jobId}`, "color: #34d399; font-weight: bold;");
      if (issuesChannel) supabase.removeChannel(issuesChannel);

      issuesChannel = supabase
        .channel(`job-findings-${jobId}`)
        .on(
          "postgres_changes",
          { event: "INSERT", schema: "public", table: "issues", filter: `job_id=eq.${jobId}` },
          (payload: any) => {
            console.info("[Realtime] New finding received", payload.new);
            setFindings((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe((st: string) => {
          console.info(`[Realtime] Issues channel (${jobId}) status: ${st}`);
        });
    };

    // Listen for Document Status changes
    const docChannel = supabase
      .channel(`doc-status-${documentId}`)
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "documents", filter: `id=eq.${documentId}` },
        (payload: any) => {
          console.info(`[Realtime] Document status update: ${payload.new.status}`);
          if (payload.new.status === "completed") markComplete("completed");
          else if (payload.new.status === "failed") markComplete("failed");
        }
      )
      .subscribe((st: string) => {
        console.info(`[Realtime] Document channel status: ${st}`);
      });

    // Listen for Job insertion and status updates
    const jobChannel = supabase
      .channel(`job-tracking-${documentId}`)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "jobs", filter: `document_id=eq.${documentId}` },
        (payload: any) => {
          console.info("[Realtime] Job record created:", payload.new.id);
          setupIssuesListener(payload.new.id);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "jobs", filter: `document_id=eq.${documentId}` },
        (payload: any) => {
          console.info(`[Realtime] Job status update: ${payload.new.status}`);
          if (payload.new.status === "completed") {
            markComplete("completed", { count: payload.new.issue_count });
          } else if (payload.new.status === "failed") {
            markComplete("failed", { errMsg: payload.new.error_message || "The analysis pipeline encountered an error." });
          }
        }
      )
      .subscribe(async (st: string) => {
        console.info(`[Realtime] Job tracking channel status: ${st}`);
        if (st === "SUBSCRIBED") {
          const { data } = await supabase
            .from("jobs")
            .select("id, status, issue_count, error_message")
            .eq("document_id", documentId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();

          if (data) {
            console.info("[Realtime] Found existing job:", data.id, data.status);
            setupIssuesListener(data.id);
            if (data.status === "completed") markComplete("completed", { count: data.issue_count });
            else if (data.status === "failed") markComplete("failed", { errMsg: data.error_message });
          } else {
            console.info("[Realtime] Waiting for job creation event...");
          }
        }
      });

    // Polling fallback
    const pollTimer = setInterval(async () => {
      if (done) return;

      const { data: docData } = await supabase
        .from("documents")
        .select("status")
        .eq("id", documentId)
        .maybeSingle();

      if (!docData || (docData.status !== "completed" && docData.status !== "failed")) return;

      console.info(`[Poll] Detected document status: ${docData.status}`);

      if (docData.status === "completed") {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("id, issue_count")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (jobData) {
          const { data: allIssues } = await supabase
            .from("issues")
            .select("*")
            .eq("job_id", jobData.id)
            .order("created_at", { ascending: true });

          if (allIssues && allIssues.length > 0) setFindings(allIssues);
          markComplete("completed", { count: jobData.issue_count ?? allIssues?.length ?? 0 });
        } else {
          markComplete("completed");
        }
      } else {
        const { data: jobData } = await supabase
          .from("jobs")
          .select("error_message")
          .eq("document_id", documentId)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        markComplete("failed", { errMsg: jobData?.error_message });
      }
    }, 4000);

    return () => {
      console.info("[Realtime] Cleaning up listeners");
      clearInterval(pollTimer);
      supabase.removeChannel(docChannel);
      supabase.removeChannel(jobChannel);
      if (issuesChannel) supabase.removeChannel(issuesChannel);
    };
  }, [documentId, supabase]);

  return { findings, isProcessing, status, error };
}

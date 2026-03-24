"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  FileText,
  Loader2,
  ArrowRight,
  Clock,
  Upload,
} from "lucide-react";
import { FileUpload } from "@/components/dashboard/file-upload";
import { FindingsViewer } from "@/components/dashboard/findings-viewer";
import { StatsPanel } from "@/components/dashboard/stats-panel";
import { useAnalysisSubscription } from "@/hooks/use-analysis-subscription";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface RecentDocument {
  id: string;
  file_name: string;
  page_count: number | null;
  status: string;
  created_at: string;
  jobs: {
    id: string;
    status: string;
    issue_count: number;
    summary: string | null;
    finished_at: string | null;
    issues: { id: string; risk_level: RiskLevel }[];
  }[];
}

export default function DashboardPage() {
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [pastFindings, setPastFindings] = useState<any[]>([]);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);
  const [statsKey, setStatsKey] = useState(0);

  const supabase = createClient();

  // ── Fetch recent documents ──────────────────────────────────
  const fetchRecentDocs = useCallback(async () => {
    if (!supabase) return;
    setIsLoadingDocs(true);
    const { data, error } = await supabase
      .from("documents")
      .select(`
        id, file_name, page_count, status, created_at,
        jobs (
          id, status, issue_count, summary, finished_at, created_at,
          issues ( id, risk_level )
        )
      `)
      .order("created_at", { ascending: false })
      .order("created_at", { foreignTable: "jobs", ascending: false })
      .limit(5);

    if (!error && data) setRecentDocs(data as unknown as RecentDocument[]);
    setIsLoadingDocs(false);
  }, [supabase]);

  // ── Realtime analysis subscription ──────────────────────────
  const analysis = useAnalysisSubscription({
    documentId: activeJobId,
    onComplete: () => {
      fetchRecentDocs();
      setStatsKey((k) => k + 1);
    },
  });

  // ── Load past findings for a selected job ───────────────────
  const loadPastFindings = useCallback(async (jobId: string) => {
    if (!supabase) return;
    setSelectedJobId(jobId);
    setIsLoadingFindings(true);
    setActiveJobId(null);

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (!error && data) setPastFindings(data);
    setIsLoadingFindings(false);
  }, [supabase]);

  // ── Initial load ────────────────────────────────────────────
  useEffect(() => {
    fetchRecentDocs();
  }, [fetchRecentDocs]);

  const handleJobStart = (id: string) => {
    setActiveJobId(id);
    setSelectedJobId(null);
    setPastFindings([]);
  };

  const clearSelection = () => {
    setSelectedJobId(null);
    setPastFindings([]);
    setActiveJobId(null);
  };

  const displayFindings = activeJobId ? analysis.findings : pastFindings;
  const showFindingsViewer =
    activeJobId || (selectedJobId && pastFindings.length > 0) || isLoadingFindings;

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-[var(--color-surface-900)]">
            Contract <span className="gradient-text">Analysis</span>
          </h1>
          <p className="mt-2 text-[var(--color-surface-500)] max-w-md">
            Securely scan legal documents for risks, liabilities, and missing
            clauses with AI precision.
          </p>
        </div>
        <div className="flex gap-3">
          <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-2xl border border-[var(--color-surface-200)]">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-sm font-medium text-[var(--color-surface-700)]">
              Gemini 3 Flash Online
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-12">
          <FileUpload onJobStart={handleJobStart} isExternalProcessing={analysis.isProcessing} />

          {/* Findings Viewer */}
          {showFindingsViewer && (
            <div className="space-y-4">
              {selectedJobId && !activeJobId && (
                <button
                  onClick={clearSelection}
                  className="text-sm text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] transition-colors flex items-center gap-1.5"
                >
                  &larr; Back to recent extractions
                </button>
              )}
              {isLoadingFindings ? (
                <div className="glass-card p-12 rounded-3xl flex items-center justify-center gap-3 text-[var(--color-surface-500)]">
                  <Loader2 className="animate-spin text-[var(--color-brand-600)]" size={20} />
                  <span className="text-sm font-medium">Loading findings...</span>
                </div>
              ) : (
                <FindingsViewer
                  findings={displayFindings}
                  isProcessing={analysis.isProcessing}
                  status={analysis.status}
                  errorMessage={analysis.error}
                />
              )}
            </div>
          )}

          {/* Recent Extractions */}
          {!activeJobId && !selectedJobId && (
            <div className="glass-card p-6 md:p-8 rounded-3xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-[var(--color-surface-900)]">Recent Extractions</h2>
                <Link
                  href="/dashboard/history"
                  className="text-sm text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors flex items-center gap-1 group"
                >
                  View all{" "}
                  <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>

              {isLoadingDocs ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="animate-pulse flex items-center gap-4 p-4 bg-[var(--color-surface-100)] rounded-2xl border border-[var(--color-surface-200)]">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-200)]" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-2/3 bg-[var(--color-surface-200)] rounded-full" />
                        <div className="h-3 w-1/3 bg-[var(--color-surface-200)] rounded-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                /* New-user empty state */
                <div className="bg-[var(--color-surface-100)] border border-dashed border-[var(--color-surface-300)] rounded-2xl p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center mx-auto mb-5">
                    <Upload className="text-[var(--color-brand-600)]" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">No analyses yet</h3>
                  <p className="text-[var(--color-surface-500)] text-sm max-w-xs mx-auto mb-6">
                    Upload your first contract above to get an AI-powered risk analysis in seconds.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentDocs.map((doc) => {
                    const job = doc.jobs?.[0];
                    const issueCount = job?.issue_count || 0;
                    const riskLevels = job?.issues?.map((i) => i.risk_level) || [];
                    const highestRisk = (["critical", "high", "medium", "low", "info"] as const).find(
                      (r) => riskLevels.includes(r)
                    );
                    const riskConfig = highestRisk ? RISK_LEVEL_CONFIG[highestRisk] : null;

                    return (
                      <button
                        key={doc.id}
                        onClick={() => job && loadPastFindings(job.id)}
                        className="w-full text-left group flex items-center gap-4 p-4 bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-100)] rounded-2xl border border-[var(--color-surface-200)] hover:border-[var(--color-surface-300)] transition-all duration-200"
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                          style={{
                            backgroundColor: riskConfig?.bgColor || "var(--color-surface-100)",
                            borderColor: riskConfig?.borderColor || "var(--color-surface-300)",
                          }}
                        >
                          <FileText size={18} style={{ color: riskConfig?.color || "#6B7280" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-[var(--color-surface-900)] truncate group-hover:text-[var(--color-brand-600)] transition-colors">
                            {doc.file_name}
                          </p>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-[var(--color-surface-500)] flex items-center gap-1">
                              <Clock size={10} />
                              {new Date(doc.created_at).toLocaleDateString()}
                            </span>
                            {doc.page_count && (
                              <span className="text-[10px] text-[var(--color-surface-500)]">{doc.page_count} pages</span>
                            )}
                            {issueCount > 0 && (
                              <span className="text-[10px] text-[var(--color-surface-500)]">
                                {issueCount} issue{issueCount !== 1 ? "s" : ""}
                              </span>
                            )}
                          </div>
                        </div>
                        {highestRisk && riskConfig && (
                          <span
                            className="text-[9px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border flex-shrink-0"
                            style={{
                              color: riskConfig.color,
                              backgroundColor: riskConfig.bgColor,
                              borderColor: riskConfig.borderColor,
                            }}
                          >
                            {riskConfig.label}
                          </span>
                        )}
                        <ArrowRight
                          size={14}
                          className="text-[var(--color-surface-400)] group-hover:text-[var(--color-surface-600)] group-hover:translate-x-0.5 transition-all flex-shrink-0"
                        />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column */}
        <StatsPanel refreshKey={statsKey} />
      </div>
    </>
  );
}

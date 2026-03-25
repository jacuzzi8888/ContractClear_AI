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
import { RISK_LEVEL_CONFIG, RECENT_DOCS_LIMIT } from "@/lib/constants";
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
      .limit(RECENT_DOCS_LIMIT);

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
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
            <FileText size={20} className="text-[var(--color-brand-600)]" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--color-surface-900)]">Contract Analysis</h1>
        </div>
        <p className="text-sm text-[var(--color-surface-500)] ml-0 sm:ml-[52px]">Upload contracts and review AI-powered risk assessments.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
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
            <div className="animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <div className="flex items-center justify-between flex-wrap gap-2 mb-6">
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="animate-pulse glass-card p-5 rounded-2xl border border-[var(--color-surface-200)]">
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-xl bg-[var(--color-surface-200)] flex-shrink-0" />
                        <div className="flex-1 space-y-2 pt-1">
                          <div className="h-4 w-3/4 bg-[var(--color-surface-200)] rounded-full" />
                          <div className="h-3 w-1/2 bg-[var(--color-surface-200)] rounded-full" />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentDocs.length === 0 ? (
                /* New-user empty state */
                <div className="bg-[var(--color-surface-50)] border border-dashed border-[var(--color-surface-300)] rounded-2xl p-6 sm:p-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-[var(--color-brand-50)] flex items-center justify-center mx-auto mb-5">
                    <Upload className="text-[var(--color-brand-600)]" size={28} />
                  </div>
                  <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">No analyses yet</h3>
                  <p className="text-[var(--color-surface-500)] text-sm max-w-xs mx-auto mb-6">
                    Upload your first contract above to get an AI-powered risk analysis in seconds.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        className="w-full text-left group glass-card rounded-2xl border border-[var(--color-surface-200)] hover:border-[var(--color-surface-300)] transition-all duration-200 overflow-hidden"
                        style={{
                          borderLeftWidth: "4px",
                          borderLeftColor: riskConfig?.color || "var(--color-surface-300)",
                        }}
                      >
                        <div className="p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                                style={{
                                  backgroundColor: riskConfig?.bgColor || "var(--color-surface-100)",
                                }}
                              >
                                <FileText size={18} style={{ color: riskConfig?.color || "#6B7280" }} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-[var(--color-surface-900)] truncate group-hover:text-[var(--color-brand-600)] transition-colors">
                                  {doc.file_name}
                                </p>
                                <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                                  <span className="text-[11px] text-[var(--color-surface-500)] flex items-center gap-1">
                                    <Clock size={11} />
                                    {new Date(doc.created_at).toLocaleDateString()}
                                  </span>
                                  {doc.page_count && (
                                    <span className="text-[11px] text-[var(--color-surface-500)]">{doc.page_count} pages</span>
                                  )}
                                  {issueCount > 0 && (
                                    <span className="text-[11px] text-[var(--color-surface-500)]">
                                      {issueCount} issue{issueCount !== 1 ? "s" : ""}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {highestRisk && riskConfig && (
                              <span
                                className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full border flex-shrink-0"
                                style={{
                                  color: riskConfig.color,
                                  backgroundColor: riskConfig.bgColor,
                                  borderColor: riskConfig.borderColor,
                                }}
                              >
                                {riskConfig.label}
                              </span>
                            )}
                          </div>
                        </div>
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

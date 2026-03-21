"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  FileText,
  Loader2,
  LogOut,
  ArrowRight,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Clock,
  BarChart3,
} from "lucide-react";
import { FileUpload } from "@/components/dashboard/file-upload";
import { FindingsViewer } from "@/components/dashboard/findings-viewer";
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
    issues: {
      id: string;
      risk_level: RiskLevel;
    }[];
  }[];
}

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recentDocs, setRecentDocs] = useState<RecentDocument[]>([]);
  const [isLoadingDocs, setIsLoadingDocs] = useState(true);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [pastFindings, setPastFindings] = useState<any[]>([]);
  const [isLoadingFindings, setIsLoadingFindings] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // ── Fetch recent documents on load ──────────────────────────
  const fetchRecentDocs = useCallback(async () => {
    setIsLoadingDocs(true);
    const { data, error } = await supabase
      .from("documents")
      .select(`
        id, file_name, page_count, status, created_at,
        jobs (
          id, status, issue_count, summary, finished_at,
          issues ( id, risk_level )
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRecentDocs(data as unknown as RecentDocument[]);
    }
    setIsLoadingDocs(false);
  }, [supabase]);

  // ── Load past findings for a selected job ───────────────────
  const loadPastFindings = useCallback(async (jobId: string) => {
    setSelectedJobId(jobId);
    setIsLoadingFindings(true);
    setActiveJobId(null); // clear any active real-time job
    setFindings([]);

    const { data, error } = await supabase
      .from("issues")
      .select("*")
      .eq("job_id", jobId)
      .order("created_at", { ascending: true });

    if (!error && data) {
      setPastFindings(data);
    }
    setIsLoadingFindings(false);
  }, [supabase]);

  // ── Real-time Listener ──────────────────────────────────
  useEffect(() => {
    if (!activeJobId) return;

    console.info(`%c[Realtime] Initializing listeners for document: ${activeJobId}`, "color: #818cf8; font-weight: bold;");
    setIsProcessing(true);
    setFindings([]);
    setSelectedJobId(null);
    setPastFindings([]);

    // 1. Listen for Document Status changes
    const docChannel = supabase
      .channel(`doc-status-${activeJobId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "documents",
          filter: `id=eq.${activeJobId}`,
        },
        (payload) => {
          console.info(`[Realtime] Document status update: ${payload.new.status}`);
          if (payload.new.status === "completed" || payload.new.status === "failed") {
            setIsProcessing(false);
            fetchRecentDocs();
          }
        }
      )
      .subscribe((status) => {
        console.info(`[Realtime] Document channel status: ${status}`);
      });

    // 2. Listen for Job creation & Issues
    let issuesChannel: any = null;

    const setupIssuesListener = (jobId: string) => {
      console.info(`%c[Realtime] Connecting to issues for job: ${jobId}`, "color: #34d399; font-weight: bold;");
      if (issuesChannel) supabase.removeChannel(issuesChannel);
      
      issuesChannel = supabase
        .channel(`job-findings-${jobId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "issues",
            filter: `job_id=eq.${jobId}`,
          },
          (payload) => {
            console.info("[Realtime] New finding received", payload.new);
            setFindings((prev) => [payload.new, ...prev]);
          }
        )
        .subscribe((status) => {
          console.info(`[Realtime] Issues channel (${jobId}) status: ${status}`);
        });
    };

    // Listen for Job insertion and status updates
    const jobChannel = supabase
      .channel(`job-tracking-${activeJobId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "jobs",
          filter: `document_id=eq.${activeJobId}`,
        },
        (payload) => {
          console.info("[Realtime] Job record created:", payload.new.id);
          setupIssuesListener(payload.new.id);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "jobs",
          filter: `document_id=eq.${activeJobId}`,
        },
        (payload) => {
          console.info(`[Realtime] Job status update: ${payload.new.status}`);
          if (payload.new.status === "completed" || payload.new.status === "failed") {
            setIsProcessing(false);
            fetchRecentDocs();
          }
        }
      )
      .subscribe(async (status) => {
        console.info(`[Realtime] Job tracking channel status: ${status}`);
        if (status === "SUBSCRIBED") {
          // Check if job already exists (avoid race condition)
          const { data } = await supabase
            .from("jobs")
            .select("id")
            .eq("document_id", activeJobId)
            .order("created_at", { ascending: false })
            .limit(1)
            .maybeSingle();
          
          if (data) {
            console.info("[Realtime] Found existing job pulse:", data.id);
            setupIssuesListener(data.id);
          } else {
            console.info("[Realtime] Waiting for job creation event...");
          }
        }
      });

    return () => {
      console.info("[Realtime] Cleaning up listeners");
      supabase.removeChannel(docChannel);
      supabase.removeChannel(jobChannel);
      if (issuesChannel) supabase.removeChannel(issuesChannel);
    };
  }, [activeJobId, supabase, fetchRecentDocs]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
        fetchRecentDocs();
      }
    };
    getUser();
  }, [router, supabase, fetchRecentDocs]);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const handleJobStart = (id: string) => {
    setActiveJobId(id);
    setSelectedJobId(null);
    setPastFindings([]);
  };

  const clearSelection = () => {
    setSelectedJobId(null);
    setPastFindings([]);
    setActiveJobId(null);
    setFindings([]);
    setIsProcessing(false);
  };

  if (!user) return null;

  // ── Compute live stats ─────────────────────────────────────
  const totalDocs = recentDocs.length;
  const totalIssues = recentDocs.reduce(
    (sum, d) => sum + (d.jobs?.[0]?.issue_count || 0),
    0
  );

  const allIssueRisks = recentDocs.flatMap(
    (d) => d.jobs?.[0]?.issues?.map((i) => i.risk_level) || []
  );

  const riskCounts: Record<string, number> = {};
  allIssueRisks.forEach((r) => {
    riskCounts[r] = (riskCounts[r] || 0) + 1;
  });

  const dominantRisk =
    Object.entries(riskCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";

  const dominantRiskColor =
    dominantRisk !== "—"
      ? RISK_LEVEL_CONFIG[dominantRisk as RiskLevel]?.color || "#9CA3AF"
      : "#9CA3AF";

  // Which findings to show?
  const displayFindings = activeJobId ? findings : pastFindings;
  const showFindingsViewer =
    activeJobId || (selectedJobId && pastFindings.length > 0) || isLoadingFindings;

  return (
    <div className="min-h-screen bg-[var(--color-surface-950)] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
              <span className="text-lg font-bold tracking-tight">
                Contract<span className="gradient-text">Clear</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              <button
                onClick={clearSelection}
                className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]"
              >
                Dashboard
              </button>
              <a
                href="/dashboard/history"
                className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-400 hover:text-white transition-colors"
              >
                History
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-medium text-white">
                {user.user_metadata?.full_name || user.email}
              </span>
              <span className="text-[10px] text-gray-500">Legal Reviewer</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              title="Sign Out"
            >
              {isSignOutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Dashboard ───────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Contract <span className="gradient-text">Analysis</span>
            </h1>
            <p className="mt-2 text-gray-400 max-w-md">
              Securely scan legal documents for risks, liabilities, and missing
              clauses with AI precision.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-300">
                Gemini 3 Flash Online
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload & Actions */}
          <div className="lg:col-span-2 space-y-12">
            <FileUpload onJobStart={handleJobStart} isExternalProcessing={isProcessing} />

            {/* Findings Viewer (Active job OR past analysis) */}
            {showFindingsViewer && (
              <div className="space-y-4">
                {selectedJobId && !activeJobId && (
                  <button
                    onClick={clearSelection}
                    className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1.5"
                  >
                    ← Back to recent extractions
                  </button>
                )}
                {isLoadingFindings ? (
                  <div className="glass-card p-12 rounded-3xl flex items-center justify-center gap-3 text-gray-400">
                    <Loader2 className="animate-spin" size={20} />
                    <span className="text-sm font-medium">Loading findings...</span>
                  </div>
                ) : (
                  <FindingsViewer
                    findings={displayFindings}
                    isProcessing={isProcessing}
                  />
                )}
              </div>
            )}

            {/* Recent Extractions (shown when no active job/selection) */}
            {!activeJobId && !selectedJobId && (
              <div
                className="glass-card p-6 md:p-8 rounded-3xl animate-fade-in-up"
                style={{ animationDelay: "0.2s" }}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Extractions</h2>
                  <a
                    href="/dashboard/history"
                    className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group"
                  >
                    View all{" "}
                    <ArrowRight
                      size={14}
                      className="group-hover:translate-x-0.5 transition-transform"
                    />
                  </a>
                </div>

                {isLoadingDocs ? (
                  <div className="space-y-3">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="animate-pulse flex items-center gap-4 p-4 bg-white/[0.02] rounded-2xl border border-white/5"
                      >
                        <div className="w-10 h-10 rounded-xl bg-white/5" />
                        <div className="flex-1 space-y-2">
                          <div className="h-4 w-2/3 bg-white/5 rounded-full" />
                          <div className="h-3 w-1/3 bg-white/5 rounded-full" />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : recentDocs.length === 0 ? (
                  <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                      <FileText className="text-gray-600" size={24} />
                    </div>
                    <p className="text-gray-500 text-sm max-w-xs mx-auto">
                      New analyses will appear here. Start by dropping a file in
                      the zone above.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentDocs.map((doc) => {
                      const job = doc.jobs?.[0];
                      const issueCount = job?.issue_count || 0;
                      const riskLevels = job?.issues?.map((i) => i.risk_level) || [];
                      const highestRisk = ["critical", "high", "medium", "low", "info"].find(
                        (r) => riskLevels.includes(r as RiskLevel)
                      ) as RiskLevel | undefined;

                      const riskConfig = highestRisk
                        ? RISK_LEVEL_CONFIG[highestRisk]
                        : null;

                      return (
                        <button
                          key={doc.id}
                          onClick={() => job && loadPastFindings(job.id)}
                          className="w-full text-left group flex items-center gap-4 p-4 bg-white/[0.02] hover:bg-white/[0.06] rounded-2xl border border-white/5 hover:border-white/10 transition-all duration-200"
                        >
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center border flex-shrink-0"
                            style={{
                              backgroundColor: riskConfig?.bgColor || "rgba(255,255,255,0.05)",
                              borderColor: riskConfig?.borderColor || "rgba(255,255,255,0.1)",
                            }}
                          >
                            <FileText
                              size={18}
                              style={{
                                color: riskConfig?.color || "#6B7280",
                              }}
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-white truncate group-hover:text-indigo-300 transition-colors">
                              {doc.file_name}
                            </p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                <Clock size={10} />
                                {new Date(doc.created_at).toLocaleDateString()}
                              </span>
                              {doc.page_count && (
                                <span className="text-[10px] text-gray-500">
                                  {doc.page_count} pages
                                </span>
                              )}
                              {issueCount > 0 && (
                                <span className="text-[10px] text-gray-500">
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
                            className="text-gray-600 group-hover:text-gray-400 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                          />
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Activity Snapshot */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Activity Snapshot
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    <BarChart3 size={12} /> Documents
                  </span>
                  <span className="text-sm font-bold">{totalDocs}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-400 flex items-center gap-2">
                    <AlertCircle size={12} /> Issues Found
                  </span>
                  <span className="text-sm font-bold">{totalIssues}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-400">Top Risk Level</span>
                  <span
                    className="text-sm font-bold capitalize"
                    style={{ color: dominantRiskColor }}
                  >
                    {dominantRisk}
                  </span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                System Health
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-500 mb-1">OCR Status</p>
                  <p className="text-xs font-bold text-green-400">Active</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-500 mb-1">LLM Latency</p>
                  <p className="text-xs font-bold text-green-400">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";
import { RISK_LEVEL_CONFIG, HISTORY_ITEMS_PER_PAGE } from "@/lib/constants";
import type { RiskLevel } from "@/types";
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  BarChart3,
  Search,
  Filter,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface HistoryDoc {
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
    issues: { id: string; risk_level: string }[];
  }[];
}


const RiskIcon = ({ level }: { level: string }) => {
  switch (level) {
    case "critical": return <AlertTriangle className="text-red-600" size={14} />;
    case "high": return <AlertCircle className="text-orange-600" size={14} />;
    case "medium": return <AlertCircle className="text-yellow-600" size={14} />;
    case "low": return <CheckCircle2 className="text-green-600" size={14} />;
    default: return <Info className="text-[var(--color-brand-600)]" size={14} />;
  }
};

const statusOptions = ["all", "completed", "processing", "failed", "queued"] as const;
const riskOptions = ["all", "critical", "high", "medium", "low", "info"] as const;

export default function HistoryPage() {
  const [docs, setDocs] = useState<HistoryDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [page, setPage] = useState(1);
  const supabase = createClient();
  const { user } = useUser();
  const userId = user.userId;

  useEffect(() => {
    const fetchDocs = async () => {
      if (!userId) return;
      setLoading(true);
      const { data, error } = await supabase
        .from("documents")
        .select(`
          id, file_name, page_count, status, created_at,
          jobs (
            id, status, issue_count, summary, finished_at,
            issues ( id, risk_level )
          )
        `)
        .eq("owner_id", userId)
        .order("created_at", { ascending: false })
        .order("created_at", { foreignTable: "jobs", ascending: false });

      if (!error && data) setDocs(data as unknown as HistoryDoc[]);
      setLoading(false);
    };
    fetchDocs();
  }, [supabase, userId]);

  // Filtered and searched docs
  const filtered = useMemo(() => {
    let result = docs;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((d) => d.file_name.toLowerCase().includes(q));
    }

    if (statusFilter !== "all") {
      result = result.filter((d) => d.status === statusFilter);
    }

    if (riskFilter !== "all") {
      result = result.filter((d) => {
        const risks = d.jobs?.[0]?.issues?.map((i) => i.risk_level) || [];
        return risks.includes(riskFilter);
      });
    }

    return result;
  }, [docs, searchQuery, statusFilter, riskFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / HISTORY_ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * HISTORY_ITEMS_PER_PAGE, page * HISTORY_ITEMS_PER_PAGE);

  // Reset page when filters change
  useEffect(() => { setPage(1); }, [searchQuery, statusFilter, riskFilter]);

  // Aggregate stats
  const totalDocs = docs.length;
  const totalIssues = docs.reduce((sum, d) => sum + (d.jobs?.[0]?.issue_count || 0), 0);
  const completedDocs = docs.filter((d) => d.status === "completed").length;

  const statusColors: Record<string, string> = {
    completed: "text-green-600",
    processing: "text-yellow-600",
    failed: "text-red-600",
    pending: "text-[var(--color-surface-400)]",
    queued: "text-[var(--color-brand-600)]",
  };

  return (
    <>
      {/* Page header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8 animate-fade-in">
        <div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
            Analysis <span className="gradient-text">History</span>
          </h1>
          <p className="mt-2 text-[var(--color-surface-500)] max-w-md">
            All your previously analyzed contracts and their risk assessments.
          </p>
        </div>

        <div className="flex gap-3">
          <div className="glass-card px-5 py-3 rounded-2xl border border-[var(--color-surface-200)] text-center">
            <p className="text-[10px] text-[var(--color-surface-400)] uppercase tracking-widest">Documents</p>
            <p className="text-xl font-bold">{totalDocs}</p>
          </div>
          <div className="glass-card px-5 py-3 rounded-2xl border border-[var(--color-surface-200)] text-center">
            <p className="text-[10px] text-[var(--color-surface-400)] uppercase tracking-widest">Issues</p>
            <p className="text-xl font-bold">{totalIssues}</p>
          </div>
          <div className="glass-card px-5 py-3 rounded-2xl border border-[var(--color-surface-200)] text-center">
            <p className="text-[10px] text-[var(--color-surface-400)] uppercase tracking-widest">Completed</p>
            <p className="text-xl font-bold text-green-600">{completedDocs}</p>
          </div>
        </div>
      </div>

      {/* Search & Filter bar */}
      <div className="glass-card p-4 rounded-2xl mb-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by file name..."
            className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 pl-10 pr-4 text-sm text-[var(--color-surface-600)] placeholder:text-[var(--color-surface-400)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 focus:border-[var(--color-brand-500)]/30 transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter size={14} className="text-[var(--color-surface-400)] flex-shrink-0" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-3 text-xs text-[var(--color-surface-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 transition-all appearance-none cursor-pointer"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s} className="bg-[var(--color-surface-50)] text-[var(--color-surface-600)]">
                {s === "all" ? "All Statuses" : s.charAt(0).toUpperCase() + s.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-3 text-xs text-[var(--color-surface-600)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/30 transition-all appearance-none cursor-pointer"
          >
            {riskOptions.map((r) => (
              <option key={r} value={r} className="bg-[var(--color-surface-50)] text-[var(--color-surface-600)]">
                {r === "all" ? "All Risk Levels" : r.charAt(0).toUpperCase() + r.slice(1)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="glass-card p-16 rounded-3xl flex items-center justify-center gap-3 text-[var(--color-surface-500)]">
          <Loader2 className="animate-spin text-[var(--color-brand-600)]" size={20} />
          <span className="text-sm font-medium">Loading history...</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="glass-card p-16 rounded-3xl text-center">
          <div className="w-16 h-16 rounded-full bg-[var(--color-surface-200)] flex items-center justify-center mx-auto mb-6">
            <FileText className="text-[var(--color-surface-400)]" size={32} />
          </div>
          {docs.length === 0 ? (
            <>
              <h2 className="text-xl font-bold mb-2">No analyses yet</h2>
              <p className="text-[var(--color-surface-400)] text-sm max-w-sm mx-auto mb-6">
                Upload your first contract from the dashboard to see your analysis history here.
              </p>
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-2xl text-sm font-bold">
                Go to Dashboard <ArrowRight size={16} />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-xl font-bold mb-2">No matches</h2>
              <p className="text-[var(--color-surface-400)] text-sm max-w-sm mx-auto">
                Try adjusting your search or filters.
              </p>
            </>
          )}
        </div>
      ) : (
        <>
          <div className="space-y-4">
            {paginated.map((doc) => {
              const job = doc.jobs?.[0];
              const issueCount = job?.issue_count || 0;
              const riskLevels: string[] = job?.issues?.map((i) => i.risk_level) || [];
              const riskBreakdown: Record<string, number> = {};
              riskLevels.forEach((r) => { riskBreakdown[r] = (riskBreakdown[r] || 0) + 1; });

              const highestRisk = (["critical", "high", "medium", "low", "info"] as const).find(
                (r) => riskLevels.includes(r)
              );
              const riskConfig = highestRisk ? RISK_LEVEL_CONFIG[highestRisk] : null;

              return (
                <div
                  key={doc.id}
                  className="glass-card p-6 rounded-2xl border border-[var(--color-surface-200)] hover:border-[var(--color-surface-300)] transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                      style={{
                        backgroundColor: riskConfig?.bgColor || "var(--color-surface-100)",
                        borderColor: riskConfig?.borderColor || "var(--color-surface-300)",
                      }}
                    >
                      <FileText size={22} style={{ color: riskConfig?.color || "#6B7280" }} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-[var(--color-surface-700)] truncate">{doc.file_name}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-[var(--color-surface-400)] flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(doc.created_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                            hour: "2-digit", minute: "2-digit",
                          })}
                        </span>
                        {doc.page_count && (
                          <span className="text-[11px] text-[var(--color-surface-400)]">{doc.page_count} pages</span>
                        )}
                        <span className={`text-[11px] font-semibold capitalize ${statusColors[doc.status] || "text-[var(--color-surface-400)]"}`}>
                          {doc.status}
                        </span>
                      </div>
                    </div>

                    {issueCount > 0 && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {(["critical", "high", "medium", "low", "info"] as const).map((level) => {
                          const count = riskBreakdown[level];
                          if (!count) return null;
                          const cfg = RISK_LEVEL_CONFIG[level];
                          return (
                            <span
                              key={level}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border"
                              style={{ color: cfg.color, backgroundColor: cfg.bgColor, borderColor: cfg.borderColor }}
                            >
                              <RiskIcon level={level} />
                              {count}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {job && (
                      <Link
                        href={`/dashboard/report/${job.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-[var(--color-surface-100)] hover:bg-[var(--color-surface-200)] rounded-xl border border-[var(--color-surface-300)] text-xs font-semibold text-[var(--color-surface-600)] transition-colors flex-shrink-0"
                      >
                        <BarChart3 size={14} />
                        View Report
                      </Link>
                    )}
                  </div>

                  {job?.summary && (
                    <p className="mt-4 text-sm text-[var(--color-surface-500)] leading-relaxed border-t border-[var(--color-surface-200)] pt-4 line-clamp-2">
                      {job.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-8 glass-card p-3 rounded-2xl">
              <span className="text-xs text-[var(--color-surface-400)] px-2">
                Showing {(page - 1) * HISTORY_ITEMS_PER_PAGE + 1}–{Math.min(page * HISTORY_ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="p-3 rounded-lg bg-[var(--color-surface-100)] hover:bg-[var(--color-surface-200)] disabled:opacity-30 disabled:hover:bg-[var(--color-surface-100)] transition-colors"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                      p === page
                        ? "bg-[var(--color-brand-500)]/20 text-[var(--color-brand-600)]"
                        : "bg-[var(--color-surface-100)] text-[var(--color-surface-500)] hover:bg-[var(--color-surface-200)]"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="p-3 rounded-lg bg-[var(--color-surface-100)] hover:bg-[var(--color-surface-200)] disabled:opacity-30 disabled:hover:bg-[var(--color-surface-100)] transition-colors"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

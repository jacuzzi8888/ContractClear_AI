import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";
import {
  FileText,
  Clock,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  Shield,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

const RiskIcon = ({ level }: { level: string }) => {
  switch (level) {
    case "critical":
      return <AlertTriangle className="text-red-400" size={14} />;
    case "high":
      return <AlertCircle className="text-orange-400" size={14} />;
    case "medium":
      return <AlertCircle className="text-yellow-400" size={14} />;
    case "low":
      return <CheckCircle2 className="text-green-400" size={14} />;
    default:
      return <Info className="text-indigo-400" size={14} />;
  }
};

export default async function HistoryPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: documents, error } = await supabase
    .from("documents")
    .select(
      `
      id, file_name, page_count, status, created_at,
      jobs (
        id, status, issue_count, summary, finished_at,
        issues ( id, risk_level )
      )
    `
    )
    .order("created_at", { ascending: false })
    .order("created_at", { foreignTable: "jobs", ascending: false });

  const docs = (documents || []) as any[];

  // Aggregate stats
  const totalDocs = docs.length;
  const totalIssues = docs.reduce(
    (sum: number, d: any) => sum + (d.jobs?.[0]?.issue_count || 0),
    0
  );
  const completedDocs = docs.filter((d: any) => d.status === "completed").length;

  return (
    <div className="min-h-screen bg-[var(--color-surface-950)] text-white">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
              <span className="text-lg font-bold tracking-tight">
                Contract<span className="gradient-text">Clear</span>
              </span>
            </Link>
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              <Link
                href="/dashboard"
                className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-400 hover:text-white transition-colors"
              >
                Dashboard
              </Link>
              <span className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]">
                History
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Analysis <span className="gradient-text">History</span>
            </h1>
            <p className="mt-2 text-gray-400 max-w-md">
              All your previously analyzed contracts and their risk assessments.
            </p>
          </div>

          {/* Stats summary */}
          <div className="flex gap-4">
            <div className="glass-card px-5 py-3 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Documents</p>
              <p className="text-xl font-bold">{totalDocs}</p>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Issues</p>
              <p className="text-xl font-bold">{totalIssues}</p>
            </div>
            <div className="glass-card px-5 py-3 rounded-2xl border border-white/5 text-center">
              <p className="text-[10px] text-gray-500 uppercase tracking-widest">Completed</p>
              <p className="text-xl font-bold text-green-400">{completedDocs}</p>
            </div>
          </div>
        </div>

        {docs.length === 0 ? (
          <div className="glass-card p-16 rounded-3xl text-center">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <FileText className="text-gray-600" size={32} />
            </div>
            <h2 className="text-xl font-bold mb-2">No analyses yet</h2>
            <p className="text-gray-500 text-sm max-w-sm mx-auto mb-6">
              Upload your first contract from the dashboard to see your analysis
              history here.
            </p>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-6 py-3 btn-primary rounded-2xl text-sm font-bold"
            >
              Go to Dashboard
              <ArrowRight size={16} />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {docs.map((doc: any) => {
              const job = doc.jobs?.[0];
              const issueCount = job?.issue_count || 0;
              const riskLevels: string[] =
                job?.issues?.map((i: any) => i.risk_level) || [];

              // Count risks by severity
              const riskBreakdown: Record<string, number> = {};
              riskLevels.forEach((r: string) => {
                riskBreakdown[r] = (riskBreakdown[r] || 0) + 1;
              });

              const highestRisk = (
                ["critical", "high", "medium", "low", "info"] as const
              ).find((r) => riskLevels.includes(r));

              const riskConfig = highestRisk
                ? RISK_LEVEL_CONFIG[highestRisk]
                : null;

              const statusColors: Record<string, string> = {
                completed: "text-green-400",
                processing: "text-yellow-400",
                failed: "text-red-400",
                pending: "text-gray-400",
                queued: "text-indigo-400",
              };

              return (
                <div
                  key={doc.id}
                  className="glass-card p-6 rounded-2xl border border-white/5 hover:border-white/10 transition-all group"
                >
                  <div className="flex flex-col md:flex-row md:items-center gap-4">
                    {/* Icon */}
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center border flex-shrink-0"
                      style={{
                        backgroundColor:
                          riskConfig?.bgColor || "rgba(255,255,255,0.05)",
                        borderColor:
                          riskConfig?.borderColor || "rgba(255,255,255,0.1)",
                      }}
                    >
                      <FileText
                        size={22}
                        style={{ color: riskConfig?.color || "#6B7280" }}
                      />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-base font-semibold text-white truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <span className="text-[11px] text-gray-500 flex items-center gap-1">
                          <Clock size={11} />
                          {new Date(doc.created_at).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        {doc.page_count && (
                          <span className="text-[11px] text-gray-500">
                            {doc.page_count} pages
                          </span>
                        )}
                        <span
                          className={`text-[11px] font-semibold capitalize ${
                            statusColors[doc.status] || "text-gray-400"
                          }`}
                        >
                          {doc.status}
                        </span>
                      </div>
                    </div>

                    {/* Risk breakdown pills */}
                    {issueCount > 0 && (
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {(
                          ["critical", "high", "medium", "low", "info"] as const
                        ).map((level) => {
                          const count = riskBreakdown[level];
                          if (!count) return null;
                          const cfg = RISK_LEVEL_CONFIG[level];
                          return (
                            <span
                              key={level}
                              className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full border"
                              style={{
                                color: cfg.color,
                                backgroundColor: cfg.bgColor,
                                borderColor: cfg.borderColor,
                              }}
                            >
                              <RiskIcon level={level} />
                              {count}
                            </span>
                          );
                        })}
                      </div>
                    )}

                    {/* Summary & Actions */}
                    {job && (
                      <Link
                        href={`/dashboard/report/${job.id}`}
                        className="flex items-center gap-2 px-4 py-2.5 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 text-xs font-semibold text-white transition-colors flex-shrink-0"
                      >
                        <BarChart3 size={14} />
                        View Report
                      </Link>
                    )}
                  </div>

                  {/* Job summary */}
                  {job?.summary && (
                    <p className="mt-4 text-sm text-gray-400 leading-relaxed border-t border-white/5 pt-4 line-clamp-2">
                      {job.summary}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}

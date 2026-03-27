"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FileText, AlertTriangle, TrendingUp, Clock } from "lucide-react";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface StatsData {
  totalDocs: number;
  totalIssues: number;
  dominantRisk: string;
  riskBreakdown: Record<string, number>;
  lastAnalysis: string | null;
}

export function StatsPanel({ refreshKey, userId }: { refreshKey?: number; userId: string | null }) {
  const [stats, setStats] = useState<StatsData>({
    totalDocs: 0,
    totalIssues: 0,
    dominantRisk: "—",
    riskBreakdown: {},
    lastAnalysis: null,
  });
  const supabase = createClient();

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;
      try {
        const { count: docsCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true })
          .eq("owner_id", userId);

        const { data: jobsData } = await supabase
          .from("jobs")
          .select("issue_count, created_at, issues(risk_level), documents!inner(owner_id)")
          .eq("documents.owner_id", userId)
          .order("created_at", { ascending: false });

        if (jobsData) {
          const issuesCount = jobsData.reduce((sum: number, j: any) => sum + (j.issue_count || 0), 0);
          const allRisks = jobsData.flatMap((j: any) =>
            (Array.isArray(j.issues) ? j.issues : []).map((i: any) => i.risk_level)
          );
          const counts: Record<string, number> = {};
          allRisks.forEach((r: string) => {
            if (r) counts[r] = (counts[r] || 0) + 1;
          });
          const domRisk = Object.entries(counts).sort((a, b) => b[1] - a[1])[0]?.[0] || "—";
          const lastAnalysis = jobsData[0]?.created_at || null;

          setStats({
            totalDocs: docsCount || 0,
            totalIssues: issuesCount,
            dominantRisk: domRisk,
            riskBreakdown: counts,
            lastAnalysis,
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    fetchStats();
  }, [supabase, refreshKey, userId]);

  const { totalDocs, totalIssues, dominantRisk, riskBreakdown, lastAnalysis } = stats;

  const dominantRiskColor =
    dominantRisk !== "—"
      ? RISK_LEVEL_CONFIG[dominantRisk as RiskLevel]?.color || "#6B7280"
      : "#6B7280";

  const formattedDate = lastAnalysis
    ? new Date(lastAnalysis).toLocaleDateString("en-US", { month: "short", day: "numeric" })
    : "—";

  const riskOrder: RiskLevel[] = ["critical", "high", "medium", "low", "info"];
  const maxRiskCount = Math.max(1, ...Object.values(riskBreakdown));

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
      <h3 className="text-sm font-bold text-[var(--color-surface-500)] uppercase tracking-wider">
        Activity
      </h3>

      {/* Stat cards — 2×2 grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Documents */}
        <div className="card-stats p-5">
          <FileText size={20} style={{ color: "var(--color-brand-600)" }} />
          <div className="stat-number text-[var(--color-surface-900)]">{totalDocs}</div>
          <div className="stat-label">Documents</div>
        </div>

        {/* Issues */}
        <div className="card-stats p-5">
          <AlertTriangle size={20} style={{ color: "var(--color-accent-600)" }} />
          <div className="stat-number text-[var(--color-surface-900)]">{totalIssues}</div>
          <div className="stat-label">Issues Found</div>
        </div>

        {/* Top Risk */}
        <div className="card-stats p-5">
          <TrendingUp size={20} style={{ color: dominantRiskColor }} />
          <div className="stat-number capitalize" style={{ color: dominantRiskColor }}>
            {dominantRisk}
          </div>
          <div className="stat-label">Top Risk</div>
        </div>

        {/* Last Run */}
        <div className="card-stats p-5">
          <Clock size={20} style={{ color: "var(--color-surface-500)" }} />
          <div className="stat-number text-[var(--color-surface-700)]">{formattedDate}</div>
          <div className="stat-label">Last Run</div>
        </div>
      </div>

      {/* Risk distribution chart */}
      {Object.keys(riskBreakdown).length > 0 && (
        <div className="card-stats p-6">
          <h3 className="text-sm font-bold text-[var(--color-surface-500)] uppercase tracking-wider mb-4">
            Risk Distribution
          </h3>
          <div className="space-y-3">
            {riskOrder.map((level) => {
              const count = riskBreakdown[level] || 0;
              if (count === 0) return null;
              const config = RISK_LEVEL_CONFIG[level];
              const pct = Math.round((count / maxRiskCount) * 100);
              return (
                <div key={level} className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold capitalize" style={{ color: config.color }}>
                      {config.label}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--color-surface-500)]">{count}</span>
                  </div>
                  <div className="h-1.5 bg-[var(--color-surface-200)] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: config.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

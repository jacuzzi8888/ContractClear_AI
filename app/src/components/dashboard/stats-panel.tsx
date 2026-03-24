"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { BarChart3, AlertCircle, AlertTriangle, CheckCircle2, Info, TrendingUp, Clock } from "lucide-react";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface StatsData {
  totalDocs: number;
  totalIssues: number;
  dominantRisk: string;
  riskBreakdown: Record<string, number>;
  lastAnalysis: string | null;
}

export function StatsPanel({ refreshKey }: { refreshKey?: number }) {
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
      try {
        const { count: docsCount } = await supabase
          .from("documents")
          .select("*", { count: "exact", head: true });

        const { data: jobsData } = await supabase
          .from("jobs")
          .select("issue_count, created_at, issues(risk_level)")
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
  }, [supabase, refreshKey]);

  const { totalDocs, totalIssues, dominantRisk, riskBreakdown, lastAnalysis } = stats;

  const dominantRiskColor =
    dominantRisk !== "—"
      ? RISK_LEVEL_CONFIG[dominantRisk as RiskLevel]?.color || "#9CA3AF"
      : "#9CA3AF";

  const riskOrder: RiskLevel[] = ["critical", "high", "medium", "low", "info"];
  const maxRiskCount = Math.max(1, ...Object.values(riskBreakdown));

  return (
    <div className="space-y-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
      {/* Stats cards */}
      <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10">
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
          Activity Snapshot
        </h3>
        <div className="space-y-3">
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
            <span className="text-xs text-gray-400 flex items-center gap-2">
              <TrendingUp size={12} /> Top Risk
            </span>
            <span
              className="text-sm font-bold capitalize"
              style={{ color: dominantRiskColor }}
            >
              {dominantRisk}
            </span>
          </div>
          {lastAnalysis && (
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
              <span className="text-xs text-gray-400 flex items-center gap-2">
                <Clock size={12} /> Last Analysis
              </span>
              <span className="text-xs font-medium text-gray-300">
                {new Date(lastAnalysis).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Risk distribution chart */}
      {Object.keys(riskBreakdown).length > 0 && (
        <div className="glass-card p-6 rounded-3xl border border-white/10">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
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
                    <span className="text-[11px] font-mono text-gray-500">{count}</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
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

"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";
import {
  BarChart3,
  FileText,
  AlertTriangle,
  Clock,
  Loader2,
  Zap,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

export default function UsagePage() {
  const supabase = createClient();
  const { userId } = useUser();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalDocs: 0,
    totalIssues: 0,
    totalJobs: 0,
    completedDocs: 0,
    failedDocs: 0,
    avgIssuesPerDoc: 0,
    riskBreakdown: {} as Record<string, number>,
    docsThisMonth: 0,
    lastAnalysis: null as string | null,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!userId) return;

      const { count: totalDocs } = await supabase
        .from("documents").select("*", { count: "exact", head: true })
        .eq("owner_id", userId);

      const { count: completedDocs } = await supabase
        .from("documents").select("*", { count: "exact", head: true })
        .eq("status", "completed").eq("owner_id", userId);

      const { count: failedDocs } = await supabase
        .from("documents").select("*", { count: "exact", head: true })
        .eq("status", "failed").eq("owner_id", userId);

      const { data: jobsData } = await supabase
        .from("jobs").select("issue_count, created_at, issues(risk_level), documents!inner(owner_id)")
        .eq("documents.owner_id", userId)
        .order("created_at", { ascending: false });

      const totalIssues = (jobsData || []).reduce((sum: number, j: any) => sum + (j.issue_count || 0), 0);
      const totalJobs = jobsData?.length || 0;
      const avgIssuesPerDoc = totalDocs ? Math.round(totalIssues / totalDocs) : 0;

      // Risk breakdown
      const allRisks = jobsData?.flatMap((j: any) =>
        (Array.isArray(j.issues) ? j.issues : []).map((i: any) => i.risk_level)
      ) || [];
      const riskBreakdown: Record<string, number> = {};
      allRisks.forEach((r: string) => { if (r) riskBreakdown[r] = (riskBreakdown[r] || 0) + 1; });

      // Docs this month
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);
      const { count: docsThisMonth } = await supabase
        .from("documents").select("*", { count: "exact", head: true })
        .eq("owner_id", userId)
        .gte("created_at", startOfMonth.toISOString());

      const lastAnalysis = jobsData?.[0]?.created_at || null;

      setStats({
        totalDocs: totalDocs || 0,
        totalIssues,
        totalJobs,
        completedDocs: completedDocs || 0,
        failedDocs: failedDocs || 0,
        avgIssuesPerDoc,
        riskBreakdown,
        docsThisMonth: docsThisMonth || 0,
        lastAnalysis,
      });
      setLoading(false);
    };
    fetchStats();
  }, [supabase, userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-[var(--color-brand-600)] animate-spin" />
      </div>
    );
  }

  const riskOrder: RiskLevel[] = ["critical", "high", "medium", "low", "info"];
  const maxRiskCount = Math.max(1, ...Object.values(stats.riskBreakdown));

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Usage & <span className="gradient-text">Billing</span>
        </h1>
        <p className="mt-2 text-[var(--color-surface-500)]">
          Track your analysis usage and account activity.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Documents", value: stats.totalDocs, icon: FileText, color: "text-[var(--color-brand-700)]" },
          { label: "Issues Found", value: stats.totalIssues, icon: AlertTriangle, color: "text-orange-400" },
          { label: "This Month", value: stats.docsThisMonth, icon: Calendar, color: "text-green-400" },
          { label: "Avg Issues/Doc", value: stats.avgIssuesPerDoc, icon: TrendingUp, color: "text-purple-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="glass-card p-5 rounded-2xl">
              <div className="flex items-center gap-2 mb-3">
                <Icon size={14} className={stat.color} />
                <span className="text-[10px] text-[var(--color-surface-500)] uppercase tracking-widest">{stat.label}</span>
              </div>
              <p className="text-3xl font-bold">{stat.value}</p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Success/failure */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-[var(--color-surface-500)] uppercase tracking-wider mb-4">Analysis Outcomes</h3>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--color-surface-500)]">Completed</span>
                <span className="text-xs font-mono text-green-400">{stats.completedDocs}</span>
              </div>
              <div className="h-2 bg-[var(--color-surface-200)] rounded-full overflow-hidden">
                <div className="h-full bg-green-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalDocs ? Math.round((stats.completedDocs / stats.totalDocs) * 100) : 0}%` }} />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs text-[var(--color-surface-500)]">Failed</span>
                <span className="text-xs font-mono text-red-400">{stats.failedDocs}</span>
              </div>
              <div className="h-2 bg-[var(--color-surface-200)] rounded-full overflow-hidden">
                <div className="h-full bg-red-500 rounded-full transition-all duration-500" style={{ width: `${stats.totalDocs ? Math.round((stats.failedDocs / stats.totalDocs) * 100) : 0}%` }} />
              </div>
            </div>
          </div>
          {stats.lastAnalysis && (
            <div className="mt-4 pt-4 border-t border-[var(--color-surface-200)] flex items-center gap-2 text-xs text-[var(--color-surface-500)]">
              <Clock size={12} /> Last analysis: {new Date(stats.lastAnalysis).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {/* Risk distribution */}
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-sm font-bold text-[var(--color-surface-500)] uppercase tracking-wider mb-4">Risk Distribution</h3>
          {Object.keys(stats.riskBreakdown).length === 0 ? (
            <p className="text-sm text-[var(--color-surface-500)] py-8 text-center">No risk data yet. Analyze your first contract to see the breakdown.</p>
          ) : (
            <div className="space-y-3">
              {riskOrder.map((level) => {
                const count = stats.riskBreakdown[level] || 0;
                if (count === 0) return null;
                const config = RISK_LEVEL_CONFIG[level];
                const pct = Math.round((count / maxRiskCount) * 100);
                return (
                  <div key={level} className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold capitalize" style={{ color: config.color }}>{config.label}</span>
                      <span className="text-xs font-mono text-[var(--color-surface-500)]">{count}</span>
                    </div>
                    <div className="h-2 bg-[var(--color-surface-200)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: config.color }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Plan info — placeholder */}
      <div className="glass-card p-6 rounded-2xl mt-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
            <Zap size={18} className="text-[var(--color-brand-700)]" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[var(--color-surface-900)]">Free Plan</h3>
            <p className="text-xs text-[var(--color-surface-500)]">Unlimited analyses during beta</p>
          </div>
        </div>
        <p className="text-sm text-[var(--color-surface-500)] leading-relaxed">
          You&apos;re on the free plan with unlimited contract analyses. We&apos;re currently in beta — enjoy full access while it lasts.
        </p>
      </div>
    </>
  );
}

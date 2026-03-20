import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

export const dynamic = "force-dynamic";

export default async function ReportPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login");
  }

  // Fetch job, document details, and all issues
  const { data: job, error: jobError } = await supabase
    .from("jobs")
    .select(`
      *,
      documents (*),
      issues (*)
    `)
    .eq("id", params.id)
    .single();

  // Basic check and ownership protection
  if (jobError || !job) return notFound();
  if (job.documents.user_id !== user.id) return notFound();

  // Sort issues by risk level (critical first, then high, medium, low, info)
  const severityOrder: Record<string, number> = {
    critical: 0,
    high: 1,
    medium: 2,
    low: 3,
    info: 4,
  };
  
  const sortedIssues = [...job.issues].sort((a, b) => 
    (severityOrder[a.risk_level] ?? 5) - (severityOrder[b.risk_level] ?? 5)
  );

  return (
    <div className="min-h-screen bg-white text-black p-8 md:p-16 max-w-5xl mx-auto print:p-0 font-sans">
      
      {/* Print Button (hidden when printing) */}
      <div className="mb-8 flex justify-end print:hidden">
        <button 
          onClick={() => {
            if (typeof window !== "undefined") window.print();
          }}
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg shadow-sm transition-all"
        >
          Print to PDF
        </button>
      </div>

      <header className="border-b-2 border-slate-200 pb-8 mb-8">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-2">Contract Risk Summary</h1>
            <p className="text-slate-500 text-lg">ContractClear AI Analysis Report</p>
          </div>
          <div className="text-right text-sm text-slate-500">
            <p><strong>Document:</strong> {job.documents.file_name}</p>
            <p><strong>Date:</strong> {new Date(job.created_at).toLocaleDateString()}</p>
            <p><strong>ID:</strong> {job.id.split("-")[0]}</p>
          </div>
        </div>
      </header>

      {/* Executive Summary */}
      <section className="mb-12">
        <h2 className="text-xl font-bold text-slate-800 mb-4 uppercase tracking-wider border-b border-slate-100 pb-2">Executive Summary</h2>
        <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
          <p className="text-slate-700 leading-relaxed text-lg">
            {job.summary || "No summary was generated for this document."}
          </p>
          <div className="mt-4 flex gap-6 text-sm">
            <div>
              <span className="font-semibold text-slate-500 block">Total Issues Found</span>
              <span className="text-2xl font-bold text-slate-900">{sortedIssues.length}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-500 block">Pages Analyzed</span>
              <span className="text-2xl font-bold text-slate-900">{job.documents.page_count || "N/A"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Detailed Findings */}
      <section>
        <h2 className="text-xl font-bold text-slate-800 mb-6 uppercase tracking-wider border-b border-slate-100 pb-2">Detailed Findings</h2>
        
        {sortedIssues.length === 0 ? (
          <p className="text-slate-500 italic">No significant risks were identified in this document.</p>
        ) : (
          <div className="space-y-8">
            {sortedIssues.map((issue, index) => {
              const config = RISK_LEVEL_CONFIG[issue.risk_level as RiskLevel] || RISK_LEVEL_CONFIG.info;
              
              // Map dark mode colors from config to print-friendly light mode colors
              let badgeBg = "bg-slate-100 text-slate-800 border-slate-300";
              if (issue.risk_level === "critical") badgeBg = "bg-red-50 text-red-700 border-red-200";
              else if (issue.risk_level === "high") badgeBg = "bg-orange-50 text-orange-700 border-orange-200";
              else if (issue.risk_level === "medium") badgeBg = "bg-yellow-50 text-yellow-700 border-yellow-200";
              else if (issue.risk_level === "low") badgeBg = "bg-green-50 text-green-700 border-green-200";

              return (
                <div key={issue.id} className="break-inside-avoid border border-slate-200 rounded-xl p-6 bg-white shadow-sm">
                  
                  {/* Issue Header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-slate-400">#{index + 1}</span>
                      <span className={`px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border ${badgeBg}`}>
                        {issue.risk_level}
                      </span>
                    </div>
                    <span className="text-sm font-mono text-slate-500 bg-slate-100 px-2 py-1 rounded">
                      Page {issue.page_number}
                    </span>
                  </div>

                  {/* Explanation */}
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Risk Analysis</h3>
                    <p className="text-slate-800 leading-relaxed font-medium">
                      {issue.explanation}
                    </p>
                  </div>

                  {/* Verbatim Quote */}
                  <div className="mb-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Verbatim Quote</h3>
                    <div className="bg-slate-50 border-l-4 border-slate-300 p-4 rounded-r-lg">
                      <p className="text-slate-600 font-serif italic text-sm leading-relaxed">
                        &ldquo;{issue.quote}&rdquo;
                      </p>
                    </div>
                  </div>

                  {/* Recommended Action */}
                  {issue.recommended_action && (
                    <div className="mt-4 pt-4 border-t border-slate-100">
                      <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Recommendation</h3>
                      <p className="text-slate-700 text-sm">
                        {issue.recommended_action}
                      </p>
                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}
      </section>

      <footer className="mt-16 pt-8 border-t border-slate-200 text-center text-slate-400 text-sm pb-8">
        <p>This report was automatically generated by ContractClear AI.</p>
        <p className="text-xs mt-1">Disclaimer: This automated analysis does not constitute formal legal advice.</p>
      </footer>

      {/* Global Print Styles to force background colors in Chrome/Safari/Edge */}
      <style dangerouslySetInnerHTML={{ __html: "@media print { body { -webkit-print-color-adjust: exact; print-color-adjust: exact; } @page { margin: 1cm; } }" }} />
    </div>
  );
}

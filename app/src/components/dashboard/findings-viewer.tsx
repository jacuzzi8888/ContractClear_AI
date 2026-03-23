"use client";

import { useState, useEffect } from "react";
import { 
  AlertCircle, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowUpRight, 
  Quote,
  Mail,
  Loader2,
  Copy,
  Check,
  FileText,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_LEVEL_CONFIG } from "@/lib/constants";
import type { RiskLevel } from "@/types";

interface RealTimeFinding {
  id: string;
  job_id: string;
  risk_level: RiskLevel;
  quote: string;
  page_number: number;
  explanation: string;
  recommended_action: string;
  confidence: number;
  created_at: string;
}

interface FindingsViewerProps {
  findings: RealTimeFinding[];
  isProcessing: boolean;
  status?: "idle" | "processing" | "completed" | "failed";
  errorMessage?: string | null;
}

const RiskIcon = ({ level }: { level: RiskLevel }) => {
  switch (level) {
    case "critical":
      return <AlertTriangle className="text-red-400" size={18} />;
    case "high":
      return <AlertCircle className="text-orange-400" size={18} />;
    case "medium":
      return <AlertCircle className="text-yellow-400" size={18} />;
    case "low":
      return <CheckCircle2 className="text-green-400" size={18} />;
    case "info":
    default:
      return <Info className="text-indigo-400" size={18} />;
  }
};

const config = (level: RiskLevel) => RISK_LEVEL_CONFIG[level] || RISK_LEVEL_CONFIG.info;

function FindingCard({ finding }: { finding: RealTimeFinding }) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftEmail, setDraftEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const riskConfig = config(finding.risk_level);

  const handleDraftEmail = async () => {
    setIsDrafting(true);
    setError(null);
    try {
      const res = await fetch(`/api/issues/${finding.id}/email`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate email");
      const data = await res.json();
      setDraftEmail(data);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setIsDrafting(false);
    }
  };

  const copyToClipboard = () => {
    if (!draftEmail) return;
    navigator.clipboard.writeText(`Subject: ${draftEmail.subject}\n\n${draftEmail.body}`);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="group relative overflow-hidden glass-card p-6 rounded-2xl border transition-all hover:scale-[1.005] animate-fade-in-up"
      style={{
        borderColor: riskConfig.borderColor,
        background: `linear-gradient(135deg, ${riskConfig.bgColor} 0%, transparent 60%)`,
      }}
    >
      {/* Header: Risk badge + Confidence */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <RiskIcon level={finding.risk_level} />
          <span
            className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border"
            style={{
              color: riskConfig.color,
              backgroundColor: riskConfig.bgColor,
              borderColor: riskConfig.borderColor,
            }}
          >
            {riskConfig.label}
          </span>
          <span className="text-[10px] text-gray-500 font-mono">
            p.{finding.page_number}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-gray-500">
            {Math.round(finding.confidence * 100)}% confidence
          </span>
          <button className="p-1 opacity-0 group-hover:opacity-100 transition-opacity text-gray-500 hover:text-white">
            <ArrowUpRight size={14} />
          </button>
        </div>
      </div>

      {/* Explanation */}
      <p className="text-sm text-gray-200 leading-relaxed mb-4">
        {finding.explanation}
      </p>

      {/* Verbatim Quote */}
      <div className="relative p-4 bg-white/[0.03] rounded-xl border border-white/5 mb-4">
        <Quote className="absolute top-3 left-3 text-white/10" size={16} />
        <p className="pl-6 text-[12px] text-gray-400 font-mono italic leading-relaxed">
          &ldquo;{finding.quote}&rdquo;
        </p>
      </div>

      {/* Recommended Action & Draft Email Button */}
      <div className="flex items-start justify-between gap-4 mt-4">
        {finding.recommended_action && (
          <div className="flex-1 flex items-start gap-2 p-3 bg-indigo-500/5 rounded-xl border border-indigo-500/10">
            <CheckCircle2 className="text-indigo-400 mt-0.5 flex-shrink-0" size={14} />
            <p className="text-[11px] text-indigo-300 leading-relaxed">
              <span className="font-bold uppercase tracking-wider text-[10px]">
                Action:{" "}
              </span>
              {finding.recommended_action}
            </p>
          </div>
        )}

        <button
          onClick={handleDraftEmail}
          disabled={isDrafting || draftEmail !== null}
          className="flex items-center gap-2 px-4 py-3 bg-white/5 hover:bg-white/10 text-white text-xs font-semibold rounded-xl border border-white/10 transition-colors disabled:opacity-50 flex-shrink-0"
        >
          {isDrafting ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Mail size={14} />
          )}
          {isDrafting ? "Drafting..." : draftEmail ? "Draft Created" : "Draft Email"}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <p className="text-red-400 text-xs mt-3 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {/* Draft Email View */}
      {draftEmail && (
        <div className="mt-4 p-4 bg-black/40 rounded-xl border border-white/10 animate-fade-in-up">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-white/10">
            <p className="text-xs font-semibold text-gray-300">
              <span className="text-gray-500 font-normal mr-2">Subject:</span>
              {draftEmail.subject}
            </p>
            <button
              onClick={copyToClipboard}
              className="p-1.5 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-md transition-colors"
              title="Copy to clipboard"
            >
              {isCopied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
            </button>
          </div>
          <div className="text-xs text-gray-300 leading-relaxed whitespace-pre-wrap font-mono [tab-size:2]">
            {draftEmail.body}
          </div>
        </div>
      )}
    </div>
  );
}

export function FindingsViewer({ findings, isProcessing, status = "idle", errorMessage }: FindingsViewerProps) {
  const [showCompleted, setShowCompleted] = useState(false);
  const [showFailed, setShowFailed] = useState(false);

  useEffect(() => {
    if (status === "completed") {
      setShowCompleted(true);
      setShowFailed(false);
      const timer = setTimeout(() => setShowCompleted(false), 8000);
      return () => clearTimeout(timer);
    }
    if (status === "failed") {
      setShowFailed(true);
      setShowCompleted(false);
    }
  }, [status]);

  if (findings.length === 0 && !isProcessing && status !== "completed" && status !== "failed") return null;

  const jobId = findings.length > 0 ? findings[0].job_id : null;

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Status banner: completed */}
      {showCompleted && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-2xl animate-fade-in-up">
          <CheckCircle2 className="text-green-400 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-400">Analysis Complete</p>
            <p className="text-xs text-green-400/70">
              {findings.length} issue{findings.length !== 1 ? "s" : ""} found in your contract.
            </p>
          </div>
          {jobId && (
            <a
              href={`/dashboard/report/${jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/20 hover:bg-green-500/30 text-green-300 text-xs font-semibold rounded-lg transition-colors"
            >
              <FileText size={13} />
              Export Report
            </a>
          )}
          <button
            onClick={() => setShowCompleted(false)}
            className="p-1 text-green-400/50 hover:text-green-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Status banner: failed */}
      {showFailed && (
        <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in-up">
          <AlertTriangle className="text-red-400 flex-shrink-0" size={20} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-400">Analysis Failed</p>
            <p className="text-xs text-red-400/70">{errorMessage || "An unexpected error occurred."}</p>
          </div>
          <button
            onClick={() => setShowFailed(false)}
            className="p-1 text-red-400/50 hover:text-red-400 transition-colors"
          >
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold">Risk Analysis</h2>
          {findings.length > 0 && (
            <span className="text-xs font-mono text-gray-500 bg-white/5 px-2 py-1 rounded-full">
              {findings.length} issue{findings.length !== 1 ? "s" : ""} found
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1 bg-indigo-500/10 rounded-full border border-indigo-500/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
              </span>
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-tighter">
                Analyzing...
              </span>
            </div>
          )}
          {jobId && !isProcessing && status !== "completed" && (
            <a
              href={`/dashboard/report/${jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-3 py-1.5 bg-white/10 hover:bg-white/15 text-white text-xs font-semibold rounded-lg border border-white/10 transition-colors"
            >
              <FileText size={14} />
              Export Report
            </a>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {findings.map((finding) => (
          <FindingCard key={finding.id} finding={finding} />
        ))}

        {/* Skeleton loader while processing */}
        {isProcessing && (
          <div className="glass-card p-6 rounded-2xl border border-dashed border-white/5 bg-white/[0.01] animate-pulse flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-full bg-white/5" />
              <div className="h-4 w-20 bg-white/5 rounded-full" />
              <div className="h-4 w-12 bg-white/5 rounded-full" />
            </div>
            <div className="h-4 w-3/4 bg-white/5 rounded-full" />
            <div className="h-16 w-full bg-white/5 rounded-xl" />
            <div className="h-10 w-full bg-white/5 rounded-xl" />
          </div>
        )}
      </div>
    </div>
  );
}

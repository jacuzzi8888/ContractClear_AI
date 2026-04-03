"use client";

import { useState, useEffect, useCallback } from "react";
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
  Mails,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { RISK_LEVEL_CONFIG, SUCCESS_BANNER_DURATION_MS } from "@/lib/constants";
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

const RiskIcon = ({ level, size = 20 }: { level: RiskLevel; size?: number }) => {
  switch (level) {
    case "critical":
      return <AlertTriangle className="text-red-600" size={size} />;
    case "high":
      return <AlertCircle className="text-orange-600" size={size} />;
    case "medium":
      return <AlertCircle className="text-yellow-600" size={size} />;
    case "low":
      return <CheckCircle2 className="text-green-600" size={size} />;
    case "info":
    default:
      return <Info className="text-[var(--color-brand-600)]" size={size} />;
  }
};

const cfg = (level: RiskLevel) => RISK_LEVEL_CONFIG[level] || RISK_LEVEL_CONFIG.info;

function FindingCard({ finding, viewMode }: { finding: RealTimeFinding; viewMode: "card" | "list" }) {
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftEmail, setDraftEmail] = useState<{ subject: string; body: string } | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const riskConfig = cfg(finding.risk_level);

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

  if (viewMode === "list") {
    return (
      <div
        className="glass-card p-5 rounded-xl border-l-4 animate-fade-in-up"
        style={{
          borderColor: riskConfig.borderColor,
          borderLeftColor: riskConfig.color,
          background: riskConfig.bgColor,
        }}
      >
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <RiskIcon level={finding.risk_level} size={18} />
            <span
              className="text-xs font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border"
              style={{
                color: riskConfig.color,
                backgroundColor: riskConfig.bgColor,
                borderColor: riskConfig.borderColor,
              }}
            >
              {riskConfig.label}
            </span>
            <span className="text-xs text-[var(--color-surface-500)] font-mono">
              Page {finding.page_number}
            </span>
          </div>
          <span className="text-xs text-[var(--color-surface-500)] font-mono">
            {Math.round(finding.confidence * 100)}% confidence
          </span>
        </div>
        
        <p className="text-sm text-[var(--color-surface-800)] leading-relaxed mt-3">
          {finding.explanation}
        </p>
        
        <div className="relative mt-3 p-3 bg-[var(--color-surface-50)]/80 rounded-lg border border-[var(--color-surface-200)]">
          <Quote className="absolute top-2 left-2 text-[var(--color-surface-300)]" size={12} />
          <p className="pl-5 text-xs text-[var(--color-surface-600)] font-mono italic leading-relaxed line-clamp-2">
            &ldquo;{finding.quote}&rdquo;
          </p>
        </div>

        <div className="flex items-center gap-2 mt-3">
          <button
            onClick={handleDraftEmail}
            disabled={isDrafting || draftEmail !== null}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-200)] text-[var(--color-surface-900)] text-xs font-semibold rounded-lg border border-[var(--color-surface-300)] transition-colors disabled:opacity-50"
          >
            {isDrafting ? <Loader2 size={12} className="animate-spin" /> : <Mail size={12} />}
            {isDrafting ? "Drafting..." : draftEmail ? "Drafted" : "Draft Email"}
          </button>
        </div>

        {error && (
          <p className="text-red-600 text-xs mt-2 flex items-center gap-1">
            <AlertCircle size={10} /> {error}
          </p>
        )}

        {draftEmail && (
          <div className="mt-3 p-3 bg-[var(--color-surface-50)] rounded-lg border border-[var(--color-surface-300)] text-xs">
            <div className="flex items-center justify-between mb-2 pb-2 border-b border-[var(--color-surface-200)]">
              <p className="font-semibold text-[var(--color-surface-700)] truncate">
                {draftEmail.subject}
              </p>
              <button
                onClick={copyToClipboard}
                className="p-1.5 text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] bg-[var(--color-surface-200)] rounded transition-colors"
                title="Copy to clipboard"
              >
                {isCopied ? <Check size={12} className="text-green-600" /> : <Copy size={12} />}
              </button>
            </div>
            <p className="text-[var(--color-surface-700)] leading-relaxed whitespace-pre-wrap font-mono line-clamp-3">
              {draftEmail.body}
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      className="deck-card p-8 border animate-fade-in-up"
      style={{
        borderColor: riskConfig.borderColor,
        background: riskConfig.bgColor,
      }}
    >
      <div className="flex items-start justify-between flex-wrap gap-2 mb-6">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center border"
            style={{
              backgroundColor: riskConfig.bgColor,
              borderColor: riskConfig.borderColor,
            }}
          >
            <RiskIcon level={finding.risk_level} size={24} />
          </div>
          <div>
            <span
              className="text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border inline-block"
              style={{
                color: riskConfig.color,
                backgroundColor: riskConfig.bgColor,
                borderColor: riskConfig.borderColor,
              }}
            >
              {riskConfig.label} Risk
            </span>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-[var(--color-surface-500)] font-mono">
                Page {finding.page_number}
              </span>
              <span className="text-xs text-[var(--color-surface-400)]">·</span>
              <span className="text-xs text-[var(--color-surface-500)] font-mono">
                {Math.round(finding.confidence * 100)}% confidence
              </span>
            </div>
          </div>
        </div>
      </div>

      <p className="text-base text-[var(--color-surface-800)] leading-relaxed mb-5">
        {finding.explanation}
      </p>

      <div className="relative p-5 bg-[var(--color-surface-50)]/80 rounded-xl border border-[var(--color-surface-200)] mb-5">
        <Quote className="absolute top-3.5 left-3.5 text-[var(--color-surface-300)]" size={16} />
        <p className="pl-6 text-sm text-[var(--color-surface-600)] font-mono italic leading-relaxed">
          &ldquo;{finding.quote}&rdquo;
        </p>
      </div>

      {finding.recommended_action && (
        <div className="flex items-start gap-3 p-4 bg-[var(--color-brand-50)] rounded-xl border border-[var(--color-brand-200)] mb-5">
          <CheckCircle2 className="text-[var(--color-brand-600)] mt-0.5 flex-shrink-0" size={16} />
          <p className="text-sm text-[var(--color-brand-700)] leading-relaxed">
            <span className="font-bold uppercase tracking-wider text-xs block mb-0.5">
              Recommended Action
            </span>
            {finding.recommended_action}
          </p>
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          onClick={handleDraftEmail}
          disabled={isDrafting || draftEmail !== null}
          className="flex items-center gap-2 px-5 py-2.5 bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-200)] text-[var(--color-surface-900)] text-sm font-semibold rounded-xl border border-[var(--color-surface-300)] transition-colors disabled:opacity-50"
        >
          {isDrafting ? <Loader2 size={16} className="animate-spin" /> : <Mail size={16} />}
          {isDrafting ? "Drafting Email..." : draftEmail ? "Email Drafted" : "Draft Email"}
        </button>
      </div>

      {error && (
        <p className="text-red-600 text-xs mt-3 flex items-center gap-1">
          <AlertCircle size={12} /> {error}
        </p>
      )}

      {draftEmail && (
        <div className="mt-5 p-5 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-300)] animate-fade-in-up">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-surface-200)]">
            <p className="text-sm font-semibold text-[var(--color-surface-700)]">
              <span className="text-[var(--color-surface-500)] font-normal mr-2">Subject:</span>
              {draftEmail.subject}
            </p>
            <button
              onClick={copyToClipboard}
              className="p-2 text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] bg-[var(--color-surface-200)] hover:bg-[var(--color-surface-300)] rounded-lg transition-colors"
              title="Copy to clipboard"
            >
              {isCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
            </button>
          </div>
          <div className="text-sm text-[var(--color-surface-700)] leading-relaxed whitespace-pre-wrap font-mono [tab-size:2]">
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
  const [isDraftingSummary, setIsDraftingSummary] = useState(false);
  const [summaryEmail, setSummaryEmail] = useState<{ subject: string; body: string } | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [isSummaryCopied, setIsSummaryCopied] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [viewMode, setViewMode] = useState<"card" | "list">("card");

  useEffect(() => {
    if (status === "completed") {
      setShowCompleted(true);
      setShowFailed(false);
      const timer = setTimeout(() => setShowCompleted(false), SUCCESS_BANNER_DURATION_MS);
      return () => clearTimeout(timer);
    }
    if (status === "failed") {
      setShowFailed(true);
      setShowCompleted(false);
    }
  }, [status]);

  useEffect(() => {
    setCurrentIndex(0);
  }, [findings.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => Math.max(0, i - 1));
  }, []);
  const goNext = useCallback(() => {
    setCurrentIndex((i) => Math.min(findings.length - 1, i + 1));
  }, [findings.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (viewMode === "card") {
        if (e.key === "ArrowLeft") goPrev();
        if (e.key === "ArrowRight") goNext();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [goPrev, goNext, viewMode]);

  if (findings.length === 0 && !isProcessing && status !== "completed" && status !== "failed") return null;

  const jobId = findings.length > 0 ? findings[0].job_id : null;

  const handleDraftSummaryEmail = async () => {
    if (!jobId) return;
    setIsDraftingSummary(true);
    setSummaryError(null);
    try {
      const res = await fetch(`/api/jobs/${jobId}/email`, { method: "POST" });
      if (!res.ok) throw new Error("Failed to generate summary email");
      const data = await res.json();
      setSummaryEmail(data);
    } catch (err: any) {
      setSummaryError(err.message);
    } finally {
      setIsDraftingSummary(false);
    }
  };

  const copySummaryToClipboard = () => {
    if (!summaryEmail) return;
    navigator.clipboard.writeText(`Subject: ${summaryEmail.subject}\n\n${summaryEmail.body}`);
    setIsSummaryCopied(true);
    setTimeout(() => setIsSummaryCopied(false), 2000);
  };

  const isTouchDevice = typeof window !== "undefined" && ("ontouchstart" in window || navigator.maxTouchPoints > 0);

  return (
    <div className="space-y-6 animate-fade-in-up">
      {showCompleted && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-5 py-4 bg-green-50 border border-green-200 rounded-2xl animate-fade-in-up">
          <CheckCircle2 className="text-green-600 flex-shrink-0" size={22} />
          <div className="flex-1">
            <p className="text-sm font-bold text-green-700">Analysis Complete</p>
            <p className="text-xs text-green-600">
              {findings.length} issue{findings.length !== 1 ? "s" : ""} found in your contract.
            </p>
          </div>
          {jobId && (
            <a
              href={`/dashboard/report/${jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold rounded-lg transition-colors"
            >
              <FileText size={13} />
              Export Report
            </a>
          )}
          <button onClick={() => setShowCompleted(false)} className="p-1 text-green-400 hover:text-green-600 transition-colors" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      {showFailed && (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3 px-5 py-4 bg-red-50 border border-red-200 rounded-2xl animate-fade-in-up">
          <AlertTriangle className="text-red-600 flex-shrink-0" size={22} />
          <div className="flex-1">
            <p className="text-sm font-bold text-red-700">Analysis Failed</p>
            <p className="text-xs text-red-600">{errorMessage || "An unexpected error occurred."}</p>
          </div>
          <button onClick={() => setShowFailed(false)} className="p-1 text-red-400 hover:text-red-600 transition-colors" aria-label="Dismiss">
            <X size={14} />
          </button>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold text-[var(--color-surface-900)]">Risk Analysis</h2>
          {findings.length > 0 && (
            <span className="text-xs font-mono text-[var(--color-surface-500)] bg-red-50 px-2.5 py-1 rounded-full border border-red-100">
              {findings.length} issue{findings.length !== 1 ? "s" : ""}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {isProcessing && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 rounded-full border border-red-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
              </span>
              <span className="text-[10px] font-bold text-red-700 uppercase tracking-tighter">Analyzing...</span>
            </div>
          )}
          
          {findings.length > 1 && (
            <div className="flex items-center border border-[var(--color-surface-200)] rounded-lg overflow-hidden">
              <button
                onClick={() => setViewMode("card")}
                className={`p-2 transition-colors ${viewMode === "card" ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]" : "text-[var(--color-surface-500)] hover:bg-[var(--color-surface-100)]"}`}
                title="Card view"
                aria-label="Card view"
                aria-pressed={viewMode === "card"}
              >
                <LayoutGrid size={16} />
              </button>
              <button
                onClick={() => setViewMode("list")}
                className={`p-2 transition-colors ${viewMode === "list" ? "bg-[var(--color-brand-50)] text-[var(--color-brand-600)]" : "text-[var(--color-surface-500)] hover:bg-[var(--color-surface-100)]"}`}
                title="List view"
                aria-label="List view"
                aria-pressed={viewMode === "list"}
              >
                <List size={16} />
              </button>
            </div>
          )}

          {findings.length > 0 && !isProcessing && (
            <button
              onClick={handleDraftSummaryEmail}
              disabled={isDraftingSummary || summaryEmail !== null}
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-200)] hover:bg-[var(--color-surface-300)] text-[var(--color-surface-900)] text-xs font-semibold rounded-lg border border-[var(--color-surface-300)] transition-colors disabled:opacity-50"
            >
              {isDraftingSummary ? <Loader2 size={14} className="animate-spin" /> : <Mails size={14} />}
              {isDraftingSummary ? "Drafting..." : summaryEmail ? "Summary Draft Created" : "Draft Summary Email"}
            </button>
          )}
          {jobId && !isProcessing && status !== "completed" && (
            <a
              href={`/dashboard/report/${jobId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-[var(--color-surface-50)] hover:bg-[var(--color-surface-200)] text-[var(--color-surface-700)] text-xs font-semibold rounded-lg border border-[var(--color-surface-300)] transition-colors"
            >
              <FileText size={14} />
              Export Report
            </a>
          )}
        </div>
      </div>

      {summaryError && <p className="text-red-600 text-xs flex items-center gap-1"><AlertCircle size={12} /> {summaryError}</p>}

      {summaryEmail && (
        <div className="p-5 bg-[var(--color-surface-50)] rounded-2xl border border-[var(--color-surface-300)] animate-fade-in-up">
          <div className="flex items-center justify-between mb-3 pb-3 border-b border-[var(--color-surface-200)]">
            <div className="flex items-center gap-2">
              <Mails size={16} className="text-[var(--color-surface-500)]" />
              <p className="text-sm font-semibold text-[var(--color-surface-700)]">
                <span className="text-[var(--color-surface-500)] font-normal mr-2">Subject:</span>
                {summaryEmail.subject}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={copySummaryToClipboard} className="p-2 text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] bg-[var(--color-surface-200)] hover:bg-[var(--color-surface-300)] rounded-lg transition-colors" title="Copy">
                {isSummaryCopied ? <Check size={16} className="text-green-600" /> : <Copy size={16} />}
              </button>
              <button onClick={() => setSummaryEmail(null)} className="p-2 text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] bg-[var(--color-surface-200)] hover:bg-[var(--color-surface-300)] rounded-lg transition-colors" title="Dismiss">
                <X size={16} />
              </button>
            </div>
          </div>
          <div className="text-sm text-[var(--color-surface-700)] leading-relaxed whitespace-pre-wrap font-mono [tab-size:2]">
            {summaryEmail.body}
          </div>
        </div>
      )}

      {findings.length > 0 && (
        viewMode === "list" ? (
          <div className="space-y-4">
            {findings.map((finding) => (
              <FindingCard key={finding.id} finding={finding} viewMode="list" />
            ))}
          </div>
        ) : (
          <div className="card-deck">
            <button
              onClick={goPrev}
              disabled={currentIndex === 0}
              className={cn(
                "deck-nav deck-nav--prev",
                isTouchDevice && "opacity-100"
              )}
              aria-label="Previous finding"
            >
              <ChevronLeft size={18} className="text-[var(--color-surface-600)]" />
            </button>
            <button
              onClick={goNext}
              disabled={currentIndex === findings.length - 1}
              className={cn(
                "deck-nav deck-nav--next",
                isTouchDevice && "opacity-100"
              )}
              aria-label="Next finding"
            >
              <ChevronRight size={18} className="text-[var(--color-surface-600)]" />
            </button>

            <FindingCard key={findings[currentIndex].id} finding={findings[currentIndex]} viewMode="card" />

            <div className="flex items-center justify-center gap-4 mt-5">
              <button
                onClick={goPrev}
                disabled={currentIndex === 0}
                className="text-xs text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] disabled:opacity-30 transition-colors flex items-center gap-1 min-h-[32px] px-2"
              >
                <ChevronLeft size={14} /> Previous
              </button>

              <div className="flex items-center gap-1.5" role="tablist" aria-label="Findings pagination">
                {findings.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentIndex(i)}
                    role="tab"
                    aria-selected={i === currentIndex}
                    aria-label={`Go to finding ${i + 1}`}
                    className={cn(
                      "w-2.5 h-2.5 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)] focus:ring-offset-2",
                      i === currentIndex
                        ? "bg-red-500 scale-110"
                        : "bg-[var(--color-surface-300)] hover:bg-[var(--color-surface-400)]"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={currentIndex === findings.length - 1}
                className="text-xs text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] disabled:opacity-30 transition-colors flex items-center gap-1 min-h-[32px] px-2"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>

            <div className="text-center mt-2">
              <span className="text-xs text-[var(--color-surface-400)] font-mono">
                {currentIndex + 1} of {findings.length}
              </span>
            </div>
          </div>
        )
      )}

      {isProcessing && findings.length === 0 && (
        <div className="card-findings p-8 rounded-2xl animate-pulse flex flex-col gap-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-[var(--color-surface-200)]" />
            <div className="flex-1 space-y-2">
              <div className="h-5 w-24 bg-[var(--color-surface-200)] rounded-full" />
              <div className="h-3 w-32 bg-[var(--color-surface-200)] rounded-full" />
            </div>
          </div>
          <div className="h-4 w-3/4 bg-[var(--color-surface-200)] rounded-full" />
          <div className="h-4 w-1/2 bg-[var(--color-surface-200)] rounded-full" />
          <div className="h-20 w-full bg-[var(--color-surface-200)] rounded-xl" />
          <div className="h-12 w-full bg-[var(--color-surface-200)] rounded-xl" />
          <div className="h-10 w-36 bg-[var(--color-surface-200)] rounded-xl" />
        </div>
      )}
    </div>
  );
}

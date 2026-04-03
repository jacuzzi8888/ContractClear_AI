"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { GEMINI_MODEL_DISPLAY, MAX_FILE_SIZE_DISPLAY } from "@/lib/constants";
import {
  FileSearch,
  Zap,
  Quote,
  ArrowRight,
  Upload,
  Loader2,
  FileUp,
  ScanSearch,
  FileCheck,
  Lock,
  Eye,
  Trash2,
} from "lucide-react";
import { SharedNavbar } from "@/components/shared/navbar";

export default function HomePage() {
  const [hasMounted, setHasMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setHasMounted(true);
    fetch("/api/user")
      .then((res) => res.json())
      .then((data) => {
        if (data.userId) setIsLoggedIn(true);
      })
      .catch(() => {});
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-100)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-[var(--color-brand-600)] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <SharedNavbar variant="home" user={isLoggedIn ? { name: "User" } : null} />

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center relative">
        <div className="animate-fade-in-up relative z-10 max-w-3xl">
          <div className="status-badge mb-6 inline-flex border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-50)] text-[var(--color-brand-700)]">
            <span className="pulse-dot bg-[var(--color-brand-600)]" />
            Powered by {GEMINI_MODEL_DISPLAY}
          </div>

          <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-7xl text-[var(--color-surface-900)]">
            Know your contracts.
            <br />
            <span className="gradient-text">Trust the evidence.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-surface-600)] leading-relaxed">
            Upload any legal PDF. ContractClear AI extracts risks with exact
            quotes and page references — no hallucinations, no guesswork.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn-primary text-base px-6 py-3 min-h-[48px]">
                Go to Dashboard <ArrowRight className="h-5 w-5" />
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn-primary text-base px-6 py-3 w-full sm:w-auto min-h-[48px]">
                  <Upload className="h-5 w-5" />
                  Analyze a Contract
                </Link>
                <Link href="/signup" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto min-h-[48px]">
                  Create Free Account
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Feature Cards ─────────────────────────────────── */}
        <div
          className="animate-fade-in-up relative z-10 mx-auto mt-28 grid max-w-5xl gap-6 sm:grid-cols-3"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="glass-card p-6 text-left">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-50)]">
              <FileSearch className="h-5 w-5 text-[var(--color-brand-600)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-900)]">
              Evidence-First Extraction
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-600)] leading-relaxed">
              Every risk is backed by an exact quote and page number. Issues
              without evidence are automatically dropped.
            </p>
          </div>

          <div className="glass-card p-6 text-left">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-accent-50)]">
              <Zap className="h-5 w-5 text-[var(--color-accent-600)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-900)]">
              Streaming Risk Dashboard
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-600)] leading-relaxed">
              Watch risks appear in real-time as the AI analyzes your contract.
              No waiting for a full report.
            </p>
          </div>

          <div className="glass-card p-6 text-left">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-50)]">
              <Quote className="h-5 w-5 text-[var(--color-brand-600)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-900)]">
              Actionable Outcomes
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-600)] leading-relaxed">
              Generate negotiation emails and fallback clauses directly from
              each identified risk.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--color-surface-300)] bg-[var(--color-surface-50)]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--color-surface-900)]">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-3 text-[var(--color-surface-600)] max-w-lg mx-auto">
              Three steps from PDF to actionable risk intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <FileUp className="h-7 w-7 text-[var(--color-brand-600)]" />
              </div>
              <div className="text-xs font-bold text-[var(--color-brand-600)] uppercase tracking-widest mb-2">
                Step 1
              </div>
              <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">Upload Your Contract</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                Drag and drop any legal PDF up to {MAX_FILE_SIZE_DISPLAY}. We accept NDAs, SaaS agreements, leases, and more.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-accent-50)] border border-[var(--color-accent-200)] flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <ScanSearch className="h-7 w-7 text-[var(--color-accent-600)]" />
              </div>
              <div className="text-xs font-bold text-[var(--color-accent-600)] uppercase tracking-widest mb-2">
                Step 2
              </div>
              <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">AI Analyzes Every Clause</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                {GEMINI_MODEL_DISPLAY} reads the full document, identifies risks, and extracts verbatim quotes with page references.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <FileCheck className="h-7 w-7 text-[var(--color-brand-600)]" />
              </div>
              <div className="text-xs font-bold text-[var(--color-brand-600)] uppercase tracking-widest mb-2">
                Step 3
              </div>
              <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">Review & Take Action</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                Get a severity-ranked risk report. Draft negotiation emails or export a PDF summary with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Security ────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-[var(--color-surface-300)]">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-[var(--color-surface-900)]">
              Built for <span className="gradient-text">Trust</span>
            </h2>
            <p className="mt-3 text-[var(--color-surface-600)] max-w-lg mx-auto">
              Your contracts are sensitive. We treat them that way.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-low-bg)] border border-[var(--color-low-border)] flex items-center justify-center mx-auto mb-4">
                <Lock className="h-5 w-5 text-[var(--color-low)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-surface-900)] mb-2">End-to-End Encryption</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                Documents are encrypted in transit and at rest. Your data never leaves the secure pipeline.
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center mx-auto mb-4">
                <Eye className="h-5 w-5 text-[var(--color-brand-600)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-surface-900)] mb-2">Evidence Grounding</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                Every claim is tied to an exact quote. No hallucinations — if there&apos;s no evidence, the issue is dropped.
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-critical-bg)] border border-[var(--color-critical-border)] flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-5 w-5 text-[var(--color-critical)]" />
              </div>
              <h3 className="text-sm font-bold text-[var(--color-surface-900)] mb-2">Your Data, Your Control</h3>
              <p className="text-sm text-[var(--color-surface-600)] leading-relaxed">
                Documents are stored in your private account. Delete them anytime — we don&apos;t retain copies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      {!isLoggedIn && (
        <section className="px-6 py-24 border-t border-[var(--color-surface-300)] bg-[var(--color-brand-900)]">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4 text-white">
              Ready to <span className="text-[var(--color-brand-300)]">clear</span> your contracts?
            </h2>
            <p className="text-[var(--color-brand-200)] mb-8 max-w-md mx-auto">
              Start analyzing contracts in seconds. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="bg-white text-[var(--color-brand-900)] font-semibold px-8 py-3 rounded-xl text-base hover:bg-[var(--color-brand-50)] transition-colors w-full sm:w-auto inline-flex items-center justify-center gap-2 min-h-[48px]">
                Get Started Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/login" className="border border-white/30 text-white font-semibold px-8 py-3 rounded-xl text-base hover:bg-white/10 transition-colors w-full sm:w-auto inline-flex items-center justify-center min-h-[48px]">
                Sign In
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-[var(--color-surface-300)] py-8 text-center text-xs text-[var(--color-surface-500)]">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 mb-3">
          <Link href="/help" className="hover:text-[var(--color-surface-700)] transition-colors py-2 px-1">Help</Link>
          <span className="text-[var(--color-surface-300)]" aria-hidden="true">|</span>
          <Link href="/terms" className="hover:text-[var(--color-surface-700)] transition-colors py-2 px-1">Terms</Link>
          <span className="text-[var(--color-surface-300)]" aria-hidden="true">|</span>
          <Link href="/privacy" className="hover:text-[var(--color-surface-700)] transition-colors py-2 px-1">Privacy</Link>
          <span className="text-[var(--color-surface-300)]" aria-hidden="true">|</span>
          <Link href="/login" className="hover:text-[var(--color-surface-700)] transition-colors py-2 px-1">Sign In</Link>
        </div>
        <p>
          ContractClear AI is not a substitute for legal counsel. All outputs
          are for informational purposes only.
        </p>
      </footer>
    </div>
  );
}

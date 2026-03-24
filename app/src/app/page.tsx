"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Shield,
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

export default function HomePage() {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-950)] flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
            <span className="text-lg font-bold tracking-tight">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn-secondary text-sm hidden sm:inline-flex">
              Sign In
            </Link>
            <Link href="/dashboard" className="btn-primary text-sm">
              Launch App <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center relative">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-20"
          style={{
            background: "radial-gradient(ellipse, rgba(99,102,241,0.3), transparent 70%)",
          }}
        />

        <div className="animate-fade-in-up relative z-10 max-w-3xl">
          <div className="status-badge mb-6 inline-flex border border-[var(--color-brand-500)]/30 bg-[var(--color-brand-500)]/10 text-[var(--color-brand-300)]">
            <span className="pulse-dot bg-[var(--color-brand-400)]" />
            Powered by Gemini 3 Flash
          </div>

          <h1 className="text-5xl font-extrabold leading-tight tracking-tight sm:text-6xl lg:text-7xl">
            Know your contracts.
            <br />
            <span className="gradient-text">Trust the evidence.</span>
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-lg text-[var(--color-surface-400)] leading-relaxed">
            Upload any legal PDF. ContractClear AI extracts risks with exact
            quotes and page references — no hallucinations, no guesswork.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="btn-primary text-base px-6 py-3 w-full sm:w-auto">
              <Upload className="h-5 w-5" />
              Analyze a Contract
            </Link>
            <Link href="/signup" className="btn-secondary text-base px-6 py-3 w-full sm:w-auto">
              Create Free Account
            </Link>
          </div>
        </div>

        {/* ── Feature Cards ─────────────────────────────────── */}
        <div
          className="animate-fade-in-up relative z-10 mx-auto mt-28 grid max-w-5xl gap-6 sm:grid-cols-3"
          style={{ animationDelay: "0.2s" }}
        >
          <div className="glass-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-500)]/10">
              <FileSearch className="h-5 w-5 text-[var(--color-brand-400)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-100)]">
              Evidence-First Extraction
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-400)] leading-relaxed">
              Every risk is backed by an exact quote and page number. Issues
              without evidence are automatically dropped.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-500)]/10">
              <Zap className="h-5 w-5 text-[var(--color-brand-400)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-100)]">
              Streaming Risk Dashboard
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-400)] leading-relaxed">
              Watch risks appear in real-time as the AI analyzes your contract.
              No waiting for a full report.
            </p>
          </div>

          <div className="glass-card p-6">
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-brand-500)]/10">
              <Quote className="h-5 w-5 text-[var(--color-brand-400)]" />
            </div>
            <h3 className="text-base font-semibold text-[var(--color-surface-100)]">
              Actionable Outcomes
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-400)] leading-relaxed">
              Generate negotiation emails and fallback clauses directly from
              each identified risk.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-white/5 relative">
        <div
          className="pointer-events-none absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full opacity-10"
          style={{
            background: "radial-gradient(ellipse, rgba(139,92,246,0.4), transparent 70%)",
          }}
        />
        <div className="mx-auto max-w-4xl relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              How It <span className="gradient-text">Works</span>
            </h2>
            <p className="mt-3 text-[var(--color-surface-400)] max-w-lg mx-auto">
              Three steps from PDF to actionable risk intelligence.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <FileUp className="h-7 w-7 text-[var(--color-brand-400)]" />
              </div>
              <div className="text-[10px] font-bold text-[var(--color-brand-400)] uppercase tracking-widest mb-2">
                Step 1
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Upload Your Contract</h3>
              <p className="text-sm text-[var(--color-surface-400)] leading-relaxed">
                Drag and drop any legal PDF up to 50MB. We accept NDAs, SaaS agreements, leases, and more.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <ScanSearch className="h-7 w-7 text-[var(--color-brand-400)]" />
              </div>
              <div className="text-[10px] font-bold text-[var(--color-brand-400)] uppercase tracking-widest mb-2">
                Step 2
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Analyzes Every Clause</h3>
              <p className="text-sm text-[var(--color-surface-400)] leading-relaxed">
                Gemini 3 Flash reads the full document, identifies risks, and extracts verbatim quotes with page references.
              </p>
            </div>

            <div className="text-center group">
              <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-500)]/10 border border-[var(--color-brand-500)]/20 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
                <FileCheck className="h-7 w-7 text-[var(--color-brand-400)]" />
              </div>
              <div className="text-[10px] font-bold text-[var(--color-brand-400)] uppercase tracking-widest mb-2">
                Step 3
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Review & Take Action</h3>
              <p className="text-sm text-[var(--color-surface-400)] leading-relaxed">
                Get a severity-ranked risk report. Draft negotiation emails or export a PDF summary with one click.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust & Security ────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-4xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Built for <span className="gradient-text">Trust</span>
            </h2>
            <p className="mt-3 text-[var(--color-surface-400)] max-w-lg mx-auto">
              Your contracts are sensitive. We treat them that way.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-4">
                <Lock className="h-5 w-5 text-green-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">End-to-End Encryption</h3>
              <p className="text-xs text-[var(--color-surface-400)] leading-relaxed">
                Documents are encrypted in transit and at rest. Your data never leaves the secure pipeline.
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center mx-auto mb-4">
                <Eye className="h-5 w-5 text-indigo-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Evidence Grounding</h3>
              <p className="text-xs text-[var(--color-surface-400)] leading-relaxed">
                Every claim is tied to an exact quote. No hallucinations — if there&apos;s no evidence, the issue is dropped.
              </p>
            </div>

            <div className="glass-card p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-5 w-5 text-red-400" />
              </div>
              <h3 className="text-sm font-bold text-white mb-2">Your Data, Your Control</h3>
              <p className="text-xs text-[var(--color-surface-400)] leading-relaxed">
                Documents are stored in your private account. Delete them anytime — we don&apos;t retain copies.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA ─────────────────────────────────────────────── */}
      <section className="px-6 py-24 border-t border-white/5">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Ready to <span className="gradient-text">clear</span> your contracts?
          </h2>
          <p className="text-[var(--color-surface-400)] mb-8 max-w-md mx-auto">
            Start analyzing contracts in seconds. No credit card required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-primary text-base px-8 py-3 w-full sm:w-auto">
              Get Started Free <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/login" className="btn-secondary text-base px-8 py-3 w-full sm:w-auto">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center text-xs text-[var(--color-surface-500)]">
        <p>
          ContractClear AI is not a substitute for legal counsel. All outputs
          are for informational purposes only.
        </p>
      </footer>
    </div>
  );
}

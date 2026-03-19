import {
  Shield,
  FileSearch,
  Zap,
  Quote,
  ArrowRight,
  Upload,
} from "lucide-react";

export default function HomePage() {
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
          <a href="/dashboard" className="btn-primary text-sm">
            Launch App <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </nav>

      {/* ── Hero ────────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-24 text-center">
        {/* Ambient glow */}
        <div
          className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 h-[600px] w-[800px] rounded-full opacity-20"
          style={{
            background:
              "radial-gradient(ellipse, rgba(99,102,241,0.3), transparent 70%)",
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

          <div className="mt-10 flex items-center justify-center gap-4">
            <a href="/dashboard" className="btn-primary text-base px-6 py-3">
              <Upload className="h-5 w-5" />
              Analyze a Contract
            </a>
            <button className="btn-secondary text-base px-6 py-3">
              See Demo
            </button>
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
      </main>

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

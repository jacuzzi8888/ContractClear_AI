import { Shield, Upload, FileText } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="min-h-screen">
      {/* ── Sidebar-style Top Nav ─────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <a href="/" className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
            <span className="text-lg font-bold tracking-tight">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </a>
          <div className="flex items-center gap-3">
            <span className="text-sm text-[var(--color-surface-400)]">
              Dashboard
            </span>
          </div>
        </div>
      </nav>

      {/* ── Main Content ─────────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="animate-fade-in-up">
          <h1 className="text-3xl font-bold tracking-tight">
            Contract Analysis
          </h1>
          <p className="mt-2 text-[var(--color-surface-400)]">
            Upload a contract to begin risk extraction.
          </p>
        </div>

        {/* ── Upload Zone ─────────────────────────────────── */}
        <div
          className="animate-fade-in-up mt-10"
          style={{ animationDelay: "0.1s" }}
        >
          <div className="glass-card flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-white/10 p-16 text-center transition-colors hover:border-[var(--color-brand-500)]/30">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-brand-500)]/10 mb-5">
              <Upload className="h-8 w-8 text-[var(--color-brand-400)]" />
            </div>
            <h3 className="text-lg font-semibold text-[var(--color-surface-100)]">
              Drop your contract PDF here
            </h3>
            <p className="mt-2 text-sm text-[var(--color-surface-400)]">
              or click to browse — supports PDFs up to 50MB
            </p>
            <button className="btn-primary mt-6">
              <FileText className="h-4 w-4" />
              Select PDF
            </button>
          </div>
        </div>

        {/* ── Recent Analyses (Placeholder) ───────────────── */}
        <div
          className="animate-fade-in-up mt-12"
          style={{ animationDelay: "0.2s" }}
        >
          <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
          <div className="glass-card p-8 text-center">
            <p className="text-[var(--color-surface-500)] text-sm">
              No contracts analyzed yet. Upload your first PDF above to get
              started.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

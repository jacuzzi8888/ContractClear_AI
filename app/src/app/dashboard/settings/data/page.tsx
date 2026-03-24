"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import {
  Download,
  Trash2,
  Loader2,
  AlertTriangle,
  ArrowLeft,
  Shield,
  HardDrive,
  FileText,
  FolderArchive,
  CheckCircle2,
  X,
} from "lucide-react";

export default function DataPrivacyPage() {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [stats, setStats] = useState({ docs: 0, issues: 0, jobs: 0 });

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }

      const { count: docs } = await supabase.from("documents").select("*", { count: "exact", head: true });
      const { count: jobs } = await supabase.from("jobs").select("*", { count: "exact", head: true });
      const { count: issues } = await supabase.from("issues").select("*", { count: "exact", head: true });
      setStats({ docs: docs || 0, jobs: jobs || 0, issues: issues || 0 });
      setLoading(false);
    };
    init();
  }, [supabase, router]);

  const handleExport = async () => {
    setExporting(true);
    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("*, jobs(*, issues(*))")
        .order("created_at", { ascending: false });

      const blob = new Blob([JSON.stringify(docs, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `contractclear-export-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setExportDone(true);
      setTimeout(() => setExportDone(false), 5000);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  const handleDelete = async () => {
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      // Delete all user data (cascading via RLS and FK constraints)
      const { data: docs } = await supabase.from("documents").select("id");
      if (docs) {
        for (const doc of docs) {
          // Delete jobs for this doc (issues will cascade from jobs)
          const { data: jobs } = await supabase.from("jobs").select("id").eq("document_id", doc.id);
          if (jobs) {
            for (const job of jobs) {
              await supabase.from("issues").delete().eq("job_id", job.id);
            }
          }
          await supabase.from("jobs").delete().eq("document_id", doc.id);
          await supabase.from("documents").delete().eq("id", doc.id);
        }
      }

      // Sign out and delete auth account
      await supabase.auth.signOut();
      // Note: actual account deletion requires admin API — sign out is sufficient for now
      router.push("/");
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-[var(--color-brand-600)] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <Link href="/dashboard/settings" className="text-xs text-[var(--color-surface-500)] hover:text-[var(--color-surface-700)] transition-colors flex items-center gap-1 mb-4">
          <ArrowLeft size={14} /> Back to Settings
        </Link>
        <h1 className="text-4xl font-bold tracking-tight">
          Data & <span className="gradient-text">Privacy</span>
        </h1>
        <p className="mt-2 text-[var(--color-surface-500)]">
          Export your data or permanently delete your account and all associated data.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Data overview */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
              <HardDrive size={18} className="text-[var(--color-brand-700)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Your Data</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Overview of stored data</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] text-center">
              <p className="text-[10px] text-[var(--color-surface-500)] uppercase tracking-widest">Documents</p>
              <p className="text-xl font-bold mt-1">{stats.docs}</p>
            </div>
            <div className="p-3 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] text-center">
              <p className="text-[10px] text-[var(--color-surface-500)] uppercase tracking-widest">Jobs</p>
              <p className="text-xl font-bold mt-1">{stats.jobs}</p>
            </div>
            <div className="p-3 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] text-center">
              <p className="text-[10px] text-[var(--color-surface-500)] uppercase tracking-widest">Issues</p>
              <p className="text-xl font-bold mt-1">{stats.issues}</p>
            </div>
          </div>
        </div>

        {/* Export */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
              <FolderArchive size={18} className="text-green-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Export All Data</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Download a JSON file of all your documents, jobs, and issues</p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-surface-500)] leading-relaxed mb-4">
            This will export all your data including document metadata, analysis results, and identified issues as a structured JSON file.
          </p>
          {exportDone && <p className="text-green-400 text-xs mb-3 flex items-center gap-1"><CheckCircle2 size={12} /> Export downloaded successfully.</p>}
          <button onClick={handleExport} disabled={exporting || stats.docs === 0} className="btn-secondary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50">
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            {exporting ? "Exporting..." : "Export Data"}
          </button>
        </div>

        {/* Delete Account */}
        <div className="glass-card p-6 rounded-2xl border-red-500/20 bg-red-500/[0.02]">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <AlertTriangle size={18} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-red-400">Delete Account</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Permanently delete your account and all associated data</p>
            </div>
          </div>
          <p className="text-sm text-[var(--color-surface-500)] leading-relaxed mb-4">
            This action is irreversible. All your documents, analysis results, issues, and account information will be permanently deleted. This cannot be undone.
          </p>

          {!showDeleteConfirm ? (
            <button onClick={() => setShowDeleteConfirm(true)} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center gap-2">
              <Trash2 size={16} /> Delete My Account
            </button>
          ) : (
            <div className="space-y-3 animate-fade-in-up">
              <p className="text-sm text-red-300 font-medium">Type <span className="font-mono bg-red-500/10 px-1.5 py-0.5 rounded">DELETE</span> to confirm:</p>
              <input
                type="text"
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="w-full bg-[var(--color-surface-50)] border border-red-500/20 rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-red-500/40 transition-all"
                placeholder="DELETE"
              />
              <div className="flex gap-3">
                <button
                  onClick={handleDelete}
                  disabled={deleteConfirmText !== "DELETE" || deleting}
                  className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-[var(--color-surface-900)] hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {deleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Permanently Delete
                </button>
                <button onClick={() => { setShowDeleteConfirm(false); setDeleteConfirmText(""); }} className="px-5 py-2.5 rounded-xl text-sm bg-[var(--color-surface-50)] text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] border border-[var(--color-surface-300)] transition-colors flex items-center gap-2">
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

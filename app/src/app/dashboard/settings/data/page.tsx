"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { useUser } from "@/context/user-context";
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
  Clock,
  CheckSquare,
  Square,
  ListChecks,
} from "lucide-react";

export default function DataPrivacyPage() {
  const router = useRouter();
  const supabase = createClient();
  const { user } = useUser();
  const userId = user.userId;
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [stats, setStats] = useState({ docs: 0, issues: 0, jobs: 0 });
  const [historyDocs, setHistoryDocs] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deletingHistory, setDeletingHistory] = useState(false);
  const [showHistoryConfirm, setShowHistoryConfirm] = useState(false);

  useEffect(() => {
    const init = async () => {
      if (!userId) return;

      const { count: docs } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("owner_id", userId);
      const { count: jobs } = await supabase.from("jobs").select("*, documents!inner(owner_id)", { count: "exact", head: true }).eq("documents.owner_id", userId);
      const { count: issues } = await supabase.from("issues").select("*, jobs!inner(documents!inner(owner_id))", { count: "exact", head: true }).eq("jobs.documents.owner_id", userId);
      setStats({ docs: docs || 0, jobs: jobs || 0, issues: issues || 0 });

      const { data: historyData } = await supabase
        .from("documents")
        .select("id, file_name, status, created_at, jobs(id, issue_count)")
        .eq("owner_id", userId)
        .order("created_at", { ascending: false });
      if (historyData) setHistoryDocs(historyData);

      setLoading(false);
    };
    init();
  }, [supabase, router, userId]);

  const handleExport = async () => {
    if (!userId) return;
    setExporting(true);
    try {
      const { data: docs } = await supabase
        .from("documents")
        .select("*, jobs(*, issues(*))")
        .eq("owner_id", userId)
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
    if (!userId) return;
    if (deleteConfirmText !== "DELETE") return;
    setDeleting(true);
    try {
      const { data: docs } = await supabase.from("documents").select("id").eq("owner_id", userId);
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

      window.location.href = "/auth/logout";
    } catch (err) {
      console.error("Deletion failed:", err);
    } finally {
      setDeleting(false);
    }
  };

  const refreshStats = async () => {
    if (!userId) return;
    const { count: d } = await supabase.from("documents").select("*", { count: "exact", head: true }).eq("owner_id", userId);
    const { count: j } = await supabase.from("jobs").select("*, documents!inner(owner_id)", { count: "exact", head: true }).eq("documents.owner_id", userId);
    const { count: i } = await supabase.from("issues").select("*, jobs!inner(documents!inner(owner_id))", { count: "exact", head: true }).eq("jobs.documents.owner_id", userId);
    setStats({ docs: d || 0, jobs: j || 0, issues: i || 0 });
  };

  const allSelected = historyDocs.length > 0 && selectedIds.size === historyDocs.length;
  const toggleSelectAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(historyDocs.map((d: any) => d.id)));
  };
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    setDeletingHistory(true);
    try {
      for (const docId of selectedIds) {
        const { data: jobs } = await supabase.from("jobs").select("id").eq("document_id", docId);
        if (jobs) {
          for (const job of jobs) {
            await supabase.from("issues").delete().eq("job_id", job.id);
          }
        }
        await supabase.from("jobs").delete().eq("document_id", docId);
        await supabase.from("documents").delete().eq("id", docId);
      }
      setHistoryDocs((prev) => prev.filter((d: any) => !selectedIds.has(d.id)));
      setSelectedIds(new Set());
      setShowHistoryConfirm(false);
      await refreshStats();
    } catch (err) {
      console.error("Bulk delete failed:", err);
    } finally {
      setDeletingHistory(false);
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
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Data & <span className="gradient-text">Privacy</span>
        </h1>
        <p className="mt-2 text-[var(--color-surface-500)]">
          Manage your extraction history, export data, or delete your account.
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

        {/* Extraction History */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
                <ListChecks size={18} className="text-[var(--color-brand-700)]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-[var(--color-surface-900)]">Extraction History</h2>
                <p className="text-xs text-[var(--color-surface-500)]">Select and delete individual extractions</p>
              </div>
            </div>
            {historyDocs.length > 0 && (
              <button
                onClick={() => setShowHistoryConfirm(true)}
                disabled={selectedIds.size === 0}
                className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <Trash2 size={14} />
                Delete Selected ({selectedIds.size})
              </button>
            )}
          </div>

          {historyDocs.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="mx-auto mb-3 text-[var(--color-surface-300)]" size={32} />
              <p className="text-sm text-[var(--color-surface-400)]">No extraction history</p>
            </div>
          ) : (
            <>
              <button
                onClick={toggleSelectAll}
                className="flex items-center gap-3 w-full px-3 py-2.5 mb-2 rounded-xl hover:bg-[var(--color-surface-100)] transition-colors text-left"
              >
                {allSelected ? (
                  <CheckSquare size={18} className="text-[var(--color-brand-600)] flex-shrink-0" />
                ) : (
                  <Square size={18} className="text-[var(--color-surface-400)] flex-shrink-0" />
                )}
                <span className="text-xs font-medium text-[var(--color-surface-600)]">
                  {allSelected ? "Deselect All" : "Select All"} ({historyDocs.length} documents)
                </span>
              </button>

              <div className="max-h-[400px] overflow-y-auto space-y-1 border border-[var(--color-surface-200)] rounded-xl">
                {historyDocs.map((doc: any) => {
                  const isSelected = selectedIds.has(doc.id);
                  const issueCount = doc.jobs?.[0]?.issue_count || 0;
                  return (
                    <button
                      key={doc.id}
                      onClick={() => toggleSelect(doc.id)}
                      className={`flex items-center gap-3 w-full px-3 py-3 text-left transition-colors border-b border-[var(--color-surface-100)] last:border-b-0 ${
                        isSelected ? "bg-[var(--color-brand-50)]" : "hover:bg-[var(--color-surface-50)]"
                      }`}
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-[var(--color-brand-600)] flex-shrink-0" />
                      ) : (
                        <Square size={18} className="text-[var(--color-surface-400)] flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-[var(--color-surface-900)] truncate">{doc.file_name}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-[11px] text-[var(--color-surface-400)] flex items-center gap-1">
                            <Clock size={11} />
                            {new Date(doc.created_at).toLocaleDateString()}
                          </span>
                          <span className={`text-[11px] font-medium capitalize ${
                            doc.status === "completed" ? "text-green-600" :
                            doc.status === "processing" ? "text-yellow-600" :
                            doc.status === "failed" ? "text-red-600" :
                            "text-[var(--color-surface-400)]"
                          }`}>
                            {doc.status}
                          </span>
                          {issueCount > 0 && (
                            <span className="text-[11px] text-[var(--color-surface-400)]">{issueCount} issue{issueCount !== 1 ? "s" : ""}</span>
                          )}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {showHistoryConfirm && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3 animate-fade-in-up">
              <p className="text-sm text-red-700 font-medium">
                Delete {selectedIds.size} selected document{selectedIds.size !== 1 ? "s" : ""} and all associated analysis data?
              </p>
              <p className="text-xs text-red-500">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={handleBulkDelete}
                  disabled={deletingHistory}
                  className="px-4 py-2.5 rounded-xl text-sm font-semibold bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                >
                  {deletingHistory ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                  Confirm Delete
                </button>
                <button
                  onClick={() => setShowHistoryConfirm(false)}
                  className="px-4 py-2.5 rounded-xl text-sm bg-white text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] border border-[var(--color-surface-300)] transition-colors flex items-center gap-2"
                >
                  <X size={16} /> Cancel
                </button>
              </div>
            </div>
          )}
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

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  Upload,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  LogOut,
  ArrowRight,
  Search,
} from "lucide-react";
import { FileUpload } from "@/components/dashboard/file-upload";
import { FindingsViewer } from "@/components/dashboard/findings-viewer";


export default function DashboardPage() {
  const [user, setUser] = useState<any>(null);
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [activeJobId, setActiveJobId] = useState<string | null>(null);
  const [findings, setFindings] = useState<any[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  // ── Real-time Listener ──────────────────────────────────
  useEffect(() => {
    if (!activeJobId) return;

    setIsProcessing(true);
    setFindings([]);

    // Subscribe to new issues for THIS job
    const channel = supabase
      .channel(`job-findings-${activeJobId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "issues",
          filter: `job_id=eq.${activeJobId}`,
        },
        (payload) => {
          setFindings((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [activeJobId, supabase]);

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
    };
    getUser();
  }, [router, supabase]);

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-[var(--color-surface-950)] text-white">
      {/* ... nav remains same ... */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <a href="/" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
              <span className="text-lg font-bold tracking-tight">
                Contract<span className="gradient-text">Clear</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              <button className="px-3 py-1.5 text-xs font-medium rounded-md bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]">
                Dashboard
              </button>
              <button className="px-3 py-1.5 text-xs font-medium rounded-md text-gray-400 hover:text-white transition-colors">
                History
              </button>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end mr-2">
              <span className="text-xs font-medium text-white">
                {user.user_metadata?.full_name || user.email}
              </span>
              <span className="text-[10px] text-gray-500">Legal Reviewer</span>
            </div>
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              title="Sign Out"
            >
              {isSignOutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </button>
          </div>
        </div>
      </nav>

      {/* ── Main Dashboard ───────────────────────────────── */}
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">
              Contract <span className="gradient-text">Analysis</span>
            </h1>
            <p className="mt-2 text-gray-400 max-w-md">
              Securely scan legal documents for risks, liabilities, and missing
              clauses with AI precision.
            </p>
          </div>
          <div className="flex gap-3">
            <div className="glass-card flex items-center gap-3 px-4 py-3 rounded-2xl border border-white/5">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-gray-300">
                Gemini 3 Flash Online
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload & Actions */}
          <div className="lg:col-span-2 space-y-12">
            <FileUpload onJobStart={(id) => setActiveJobId(id)} />

            {/* Findings Viewer (Replaces Recent Extractions when active) */}
            <FindingsViewer findings={findings} isProcessing={isProcessing} />

            {!activeJobId && (
              <div className="glass-card p-6 md:p-8 rounded-3xl animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold">Recent Extractions</h2>
                  <button className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1 group">
                    View all <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                  </button>
                </div>

                <div className="bg-white/[0.02] border border-dashed border-white/10 rounded-2xl p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4">
                    <FileText className="text-gray-600" size={24} />
                  </div>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto">
                    New analyses will appear here. Start by dropping a file in the zone above.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Active Status / Quick Stats */}
          <div className="space-y-8 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="glass-card p-6 rounded-3xl bg-gradient-to-br from-indigo-500/5 to-purple-500/5 border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                Activity Snapshot
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-400">Monthly Usage</span>
                  <span className="text-sm font-bold">12 / 100</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-xs text-gray-400">Avg. Risk Level</span>
                  <span className="text-sm font-bold text-yellow-400">Medium</span>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 rounded-3xl border border-white/10">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">
                System Health
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-500 mb-1">OCR Status</p>
                  <p className="text-xs font-bold text-green-400">Active</p>
                </div>
                <div className="p-4 bg-white/5 rounded-2xl text-center">
                  <p className="text-[10px] text-gray-500 mb-1">LLM Latency</p>
                  <p className="text-xs font-bold text-green-400">Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

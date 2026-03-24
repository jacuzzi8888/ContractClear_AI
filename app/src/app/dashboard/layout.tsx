"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Loader2, AlertTriangle } from "lucide-react";
import { Navbar } from "@/components/dashboard/navbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      if (!supabase) {
        setLoading(false);
        return;
      }
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push("/login");
      } else {
        setUser(user);
      }
      setLoading(false);
    };
    getUser();
  }, [router, supabase]);

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[var(--color-surface-950)] flex items-center justify-center">
        {!supabase ? (
          <div className="glass-card p-8 rounded-3xl border border-red-500/30 bg-red-500/5 text-center max-w-md">
            <AlertTriangle className="h-10 w-10 text-red-500 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Configuration Error</h2>
            <p className="text-gray-400 text-sm mb-6">
              Supabase environment variables are missing. Please ensure{" "}
              <code className="mx-1 px-1 py-0.5 bg-white/5 rounded text-indigo-300">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
              and{" "}
              <code className="mx-1 px-1 py-0.5 bg-white/5 rounded text-indigo-300">NEXT_PUBLIC_SUPABASE_ANON_KEY</code>{" "}
              are set in Vercel settings.
            </p>
            <button onClick={() => window.location.reload()} className="btn-secondary text-xs">
              Retry Connection
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 text-indigo-500 animate-spin" />
            <p className="text-gray-500 text-sm font-medium animate-pulse">
              Initializing Secure Dashboard...
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-surface-950)] text-white">
      <Navbar user={user} />
      <main className="mx-auto max-w-7xl px-6 pt-28 pb-16">{children}</main>
    </div>
  );
}

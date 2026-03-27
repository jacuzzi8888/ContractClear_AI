"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, LogIn, Mail, Lock, Loader2, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed");
        return;
      }

      // Also trigger Auth0 callback to sync session
      await fetch("/api/auth/callback", { method: "POST" });
      
      router.push("/dashboard");
    } catch (err) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="h-8 w-8 text-[var(--color-brand-600)]" />
            <span className="text-2xl font-bold tracking-tight text-[var(--color-surface-900)]">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </Link>
        </div>

        <div className="glass-card p-6 sm:p-8 md:p-10">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-[var(--color-surface-900)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Sign in to your ContractClear account
            </p>
          </div>

          {/* Tabs */}
          <div className="flex border border-[var(--color-surface-200)] rounded-xl mb-6 overflow-hidden">
            <button
              onClick={() => setActiveTab("google")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "google"
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "bg-[var(--color-surface-50)] text-[var(--color-surface-500)] hover:bg-[var(--color-surface-100)]"
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setActiveTab("email")}
              className={`flex-1 py-3 text-sm font-medium transition-colors ${
                activeTab === "email"
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "bg-[var(--color-surface-50)] text-[var(--color-surface-500)] hover:bg-[var(--color-surface-100)]"
              }`}
            >
              Email / Password
            </button>
          </div>

          {activeTab === "google" ? (
            <>
              <a
                href="/auth/login?returnTo=/dashboard"
                className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
              >
                <LogIn className="mr-2" size={20} />
                Sign In with Google
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>

              <p className="text-center mt-6 text-sm text-[var(--color-surface-500)]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[var(--color-brand-600)] font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="Min 6 characters"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[var(--color-surface-500)]">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-[var(--color-brand-600)] font-medium hover:underline">
                  Create one
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

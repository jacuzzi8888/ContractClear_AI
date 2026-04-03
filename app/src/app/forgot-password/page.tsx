"use client";

import { useState } from "react";
import Link from "next/link";
import { Shield, ArrowRight, Mail, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to send reset email");
        return;
      }

      setSuccess(true);
    } catch {
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
              Reset Your Password
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>
          </div>

          {success ? (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
              <p className="text-sm text-[var(--color-surface-600)]">
                Check your email for a link to reset your password. If it doesn&apos;t appear within a few minutes, check your spam folder.
              </p>
              <Link
                href="/login"
                className="btn-secondary inline-flex items-center gap-2 px-6 py-3"
              >
                Back to Sign In
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm" role="alert">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="email" className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">
                  Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="you@example.com"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center transition-all disabled:opacity-50 min-h-[48px]"
              >
                {isLoading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    Send Reset Link
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[var(--color-surface-500)]">
                Remember your password?{" "}
                <Link href="/login" className="text-[var(--color-brand-600)] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

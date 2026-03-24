"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { Shield, Mail, ArrowLeft, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/login`,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSent(true);
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
        <div className="w-full max-w-md relative text-center">
          <div className="glass-card p-10 space-y-6">
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                <CheckCircle2 size={40} />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-surface-900)]">Check your email</h1>
            <p className="text-[var(--color-surface-500)] leading-relaxed">
              We&apos;ve sent a password reset link to{" "}
              <span className="text-[var(--color-surface-800)] font-medium">{email}</span>.
              Check your inbox and follow the instructions.
            </p>
            <Link
              href="/login"
              className="block w-full text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] font-medium transition-colors pt-4"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }

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
        <div className="glass-card p-8 md:p-10">
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)] mb-2">Reset Password</h1>
          <p className="text-[var(--color-surface-500)] mb-8 text-sm">
            Enter your email and we&apos;ll send you a link to reset your password.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[var(--color-surface-600)] ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-surface-400)] group-focus-within:text-[var(--color-brand-500)] transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-[var(--color-surface-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)] transition-all placeholder:text-[var(--color-surface-400)]"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 text-sm py-3 px-4 rounded-xl text-center">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
            >
              {loading ? (
                <Loader2 className="animate-spin mr-2" size={20} />
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-[var(--color-surface-500)]">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] font-medium transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

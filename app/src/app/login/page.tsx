"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  // Redirect if already authenticated
  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        router.push("/dashboard");
      }
    };
    checkUser();
  }, [supabase, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
      router.refresh();
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="w-full max-w-md relative">
        <div className="glass-card p-8 md:p-10">
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--color-surface-900)] mb-2">
              Welcome Back
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Sign in to your ContractClear account
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
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

            <div className="space-y-2">
              <div className="flex justify-between items-center ml-1">
                <label className="text-sm font-medium text-[var(--color-surface-600)]">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-[var(--color-surface-400)] group-focus-within:text-[var(--color-brand-500)] transition-colors">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-12 text-[var(--color-surface-800)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)] transition-all placeholder:text-[var(--color-surface-400)]"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-[var(--color-surface-400)] hover:text-[var(--color-surface-600)] transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
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
                  Sign In
                  <ArrowRight
                    className="ml-2 group-hover:translate-x-1 transition-transform"
                    size={20}
                  />
                </>
              )}
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-[var(--color-surface-500)]">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] font-medium transition-colors"
            >
              Create one for free
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

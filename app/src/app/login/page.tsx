"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, LogIn, Mail, Loader2, AlertCircle } from "lucide-react";
import { PasswordInput } from "@/components/shared/password-input";

export default function LoginPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!email) {
      errors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Please enter a valid email";
    }
    if (!password) {
      errors.password = "Password is required";
    } else if (password.length < 6) {
      errors.password = "Password must be at least 6 characters";
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) return;

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

      await fetch("/api/auth/callback", { method: "POST" });
      router.push("/dashboard");
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
              Welcome Back
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Sign in to your ContractClear account
            </p>
          </div>

          <div className="flex border border-[var(--color-surface-200)] rounded-xl mb-6 overflow-hidden" role="tablist">
            <button
              onClick={() => setActiveTab("google")}
              role="tab"
              aria-selected={activeTab === "google"}
              className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[48px] ${
                activeTab === "google"
                  ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                  : "bg-[var(--color-surface-50)] text-[var(--color-surface-500)] hover:bg-[var(--color-surface-100)]"
              }`}
            >
              Google
            </button>
            <button
              onClick={() => setActiveTab("email")}
              role="tab"
              aria-selected={activeTab === "email"}
              className={`flex-1 py-3 text-sm font-medium transition-colors min-h-[48px] ${
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
                className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all min-h-[52px]"
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
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
                    }}
                    required
                    autoComplete="email"
                    className={`w-full bg-[var(--color-surface-50)] border rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all ${
                      fieldErrors.email ? "border-red-300" : "border-[var(--color-surface-300)]"
                    }`}
                    placeholder="you@example.com"
                  />
                </div>
                {fieldErrors.email && (
                  <p className="text-xs text-red-500 mt-1.5 ml-1">{fieldErrors.email}</p>
                )}
              </div>

              <PasswordInput
                id="password"
                value={password}
                onChange={(v) => {
                  setPassword(v);
                  if (fieldErrors.password) setFieldErrors((prev) => ({ ...prev, password: undefined }));
                }}
                placeholder="Enter your password"
                required
                autoComplete="current-password"
                error={fieldErrors.password}
              />

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className="text-xs text-[var(--color-brand-600)] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary w-full py-3 rounded-xl text-white font-semibold flex items-center justify-center transition-all disabled:opacity-50 min-h-[48px]"
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

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, ArrowRight, UserPlus, Mail, Lock, User, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";

export default function SignupPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"google" | "email">("google");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, fullName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

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
              Create Your Account
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Start analyzing contracts with AI-powered risk detection
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
                href="/auth/login?screen_hint=signup&returnTo=/dashboard"
                className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
              >
                <UserPlus className="mr-2" size={20} />
                Sign Up with Google
                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
              </a>

              <p className="text-center mt-6 text-sm text-[var(--color-surface-500)]">
                Already have an account?{" "}
                <Link href="/login" className="text-[var(--color-brand-600)] font-medium hover:underline">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            <form onSubmit={handleEmailSignup} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  <AlertCircle size={16} />
                  {error}
                </div>
              )}

              <div>
                <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="John Doe"
                  />
                </div>
              </div>

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

              <div>
                <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-surface-400)]" size={18} />
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-3 pl-10 pr-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="Confirm your password"
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
                    Create Account
                    <ArrowRight className="ml-2" size={20} />
                  </>
                )}
              </button>

              <p className="text-center text-sm text-[var(--color-surface-500)]">
                Already have an account?{" "}
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

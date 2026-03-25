"use client";

import Link from "next/link";
import { Shield, ArrowRight, UserPlus } from "lucide-react";

export default function SignupPage() {
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
          <div className="text-center mb-10">
            <h1 className="text-3xl font-bold text-[var(--color-surface-900)] mb-2">
              Create Your Account
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Start analyzing contracts with AI-powered risk detection
            </p>
          </div>

          <a
            href="/auth/login?screen_hint=signup&returnTo=/dashboard"
            className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
          >
            <UserPlus className="mr-2" size={20} />
            Sign Up with Auth0
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </a>

          <p className="text-center mt-8 text-sm text-[var(--color-surface-500)]">
            Already have an account?{" "}
            <a
              href="/auth/login?returnTo=/dashboard"
              className="text-[var(--color-brand-600)] hover:text-[var(--color-brand-500)] font-medium transition-colors"
            >
              Sign in
            </a>
          </p>

          <p className="text-center mt-4 text-xs text-[var(--color-surface-400)]">
            Secured by Auth0
          </p>
        </div>
      </div>
    </main>
  );
}

"use client";

import Link from "next/link";
import { Shield, ArrowRight, LogIn } from "lucide-react";

export default function LoginPage() {
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
              Welcome Back
            </h1>
            <p className="text-[var(--color-surface-500)]">
              Sign in to your ContractClear account
            </p>
          </div>

          <a
            href="/auth/login?returnTo=/dashboard"
            className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
          >
            <LogIn className="mr-2" size={20} />
            Sign In with Auth0
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </a>

          <a
            href="/auth/login?screen_hint=signup&returnTo=/dashboard"
            className="btn-secondary w-full py-4 rounded-xl font-semibold flex items-center justify-center group transition-all mt-4"
          >
            Create Account
            <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
          </a>

          <p className="text-center mt-8 text-xs text-[var(--color-surface-400)]">
            Secured by Auth0
          </p>
        </div>
      </div>
    </main>
  );
}

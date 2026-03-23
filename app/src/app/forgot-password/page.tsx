import Link from "next/link";
import { Shield, Mail, ArrowLeft, ArrowRight } from "lucide-react";

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
           <Link href="/" className="flex items-center gap-2.5">
            <Shield className="h-8 w-8 text-[var(--color-brand-400)]" />
            <span className="text-2xl font-bold tracking-tight text-white">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </Link>
        </div>
        <div className="glass-card p-8 md:p-10">
          <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
          <p className="text-gray-400 mb-8 text-sm">
            Enter your email and we'll send you a link to reset your password.
          </p>
          
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300 ml-1">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-500 group-focus-within:text-indigo-400 transition-colors">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  required
                  className="w-full bg-gray-900/50 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/50 transition-all placeholder:text-gray-600"
                  placeholder="name@company.com"
                />
              </div>
            </div>

            <button
              type="submit"
              className="btn-primary w-full py-4 rounded-xl text-white font-semibold flex items-center justify-center group transition-all"
            >
              Send Reset Link
              <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={18} />
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-500">
            Remember your password?{" "}
            <Link
              href="/login"
              className="text-indigo-400 hover:text-indigo-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              <ArrowLeft size={14} /> Back to Login
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}

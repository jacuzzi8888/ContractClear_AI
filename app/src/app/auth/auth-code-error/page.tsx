import Link from "next/link";
import { Shield, AlertCircle } from "lucide-react";

export default function AuthCodeErrorPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-8 flex justify-center">
          <Shield className="h-12 w-12 text-red-500" />
        </div>
        <div className="glass-card p-6 sm:p-8 md:p-10 border-red-200">
          <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="text-red-500" size={32} />
          </div>
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)] mb-4">Authentication Error</h1>
          <p className="text-[var(--color-surface-600)] mb-8">
            We couldn&apos;t verify your login. This might be due to an expired link or a connection issue.
          </p>
          <div className="space-y-4">
            <Link
              href="/login"
              className="btn-primary w-full py-3.5 rounded-xl font-semibold flex items-center justify-center"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

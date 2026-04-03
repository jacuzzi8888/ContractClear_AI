"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  useEffect(() => {
    console.error("Error caught by boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-[var(--color-surface-900)]">
            Something went wrong
          </h1>
          <p className="text-sm text-[var(--color-surface-500)]">
            An unexpected error occurred. Please try again or contact support if the problem persists.
          </p>
        </div>

        {process.env.NODE_ENV === "development" && (
          <div className="p-4 bg-[var(--color-surface-100)] rounded-xl text-left">
            <p className="text-xs font-mono text-red-600 break-all">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 min-h-[48px]"
          >
            <RefreshCw size={18} />
            Try Again
          </button>
          <Link
            href="/"
            className="btn-secondary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Home size={18} />
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}

"use client";

import Link from "next/link";
import { FileQuestion, Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center space-y-6">
        <div className="w-20 h-20 rounded-full bg-[var(--color-surface-100)] flex items-center justify-center mx-auto">
          <FileQuestion className="h-10 w-10 text-[var(--color-surface-400)]" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold text-[var(--color-surface-900)]">
            Page Not Found
          </h1>
          <p className="text-sm text-[var(--color-surface-500)]">
            The page you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="btn-primary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 min-h-[48px]"
          >
            <Home size={18} />
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="btn-secondary px-6 py-3 rounded-xl inline-flex items-center justify-center gap-2 min-h-[48px]"
          >
            <ArrowLeft size={18} />
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
}

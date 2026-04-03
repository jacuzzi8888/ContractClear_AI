"use client";

import { Loader2 } from "lucide-react";

export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 text-[var(--color-brand-600)] animate-spin" />
        <p className="text-sm text-[var(--color-surface-500)]">Loading...</p>
      </div>
    </div>
  );
}

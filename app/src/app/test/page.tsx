"use client";

import { useState, useEffect } from "react";

export default function TestPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-black text-white flex items-center justify-center font-sans">
      <div className="p-10 border border-white/10 rounded-3xl bg-white/5">
        <h1 className="text-3xl font-bold mb-4">Framework Test</h1>
        <p className="text-gray-400">
          Status: {mounted ? "✅ Mounted on Client" : "⏳ Pre-rendering on Server"}
        </p>
      </div>
    </div>
  );
}

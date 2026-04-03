"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SharedNavbar } from "@/components/shared/navbar";
import { Loader2 } from "lucide-react";

interface DashboardNavbarProps {
  user: { sub?: string; name?: string; email?: string; picture?: string } | null;
}

export function Navbar({ user }: DashboardNavbarProps) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const router = useRouter();

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      window.location.href = "/auth/logout";
    } catch {
      window.location.href = "/auth/logout";
    }
  };

  return (
    <SharedNavbar
      variant="dashboard"
      user={user}
      onLogout={handleLogout}
      isLoggingOut={isLoggingOut}
    />
  );
}

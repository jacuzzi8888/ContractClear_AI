"use client";

import { UserProvider } from "@/context/user-context";

export function DashboardWrapper({ children }: { children: React.ReactNode }) {
  return <UserProvider>{children}</UserProvider>;
}

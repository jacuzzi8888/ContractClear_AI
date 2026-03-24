"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import {
  Shield,
  LogOut,
  Loader2,
  Menu,
  X,
  LayoutDashboard,
  History,
  Upload,
  Settings,
  BarChart3,
  HelpCircle,
} from "lucide-react";

interface NavbarProps {
  user: { email?: string; user_metadata?: { full_name?: string } } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [isSignOutLoading, setIsSignOutLoading] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    setIsSignOutLoading(true);
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
              <span className="text-lg font-bold tracking-tight">
                Contract<span className="gradient-text">Clear</span>
              </span>
            </Link>

            {/* Desktop tabs */}
            <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    isActive(link.href)
                      ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* User info — hidden on small screens */}
            {user && (
              <div className="hidden sm:flex flex-col items-end mr-1">
                <span className="text-xs font-medium text-white">
                  {user.user_metadata?.full_name || user.email}
                </span>
                <span className="text-[10px] text-gray-500">Legal Reviewer</span>
              </div>
            )}

            {/* Sign out — desktop */}
            <Link
              href="/dashboard/settings"
              className="hidden md:flex p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
            </Link>
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="hidden md:flex p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group"
              title="Sign Out"
            >
              {isSignOutLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-gray-400 group-hover:text-red-400 transition-colors" />
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-2 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
            >
              <Menu className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer */}
          <div className="absolute right-0 top-0 bottom-0 w-72 bg-[var(--color-surface-950)] border-l border-white/10 p-6 flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--color-brand-400)]" />
                <span className="text-sm font-bold">
                  Contract<span className="gradient-text">Clear</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* User card */}
            {user && (
              <div className="p-3 bg-white/5 rounded-xl border border-white/5 mb-6">
                <p className="text-sm font-medium text-white truncate">
                  {user.user_metadata?.full_name || user.email}
                </p>
                <p className="text-[10px] text-gray-500 mt-0.5">Legal Reviewer</p>
              </div>
            )}

            {/* Nav links */}
            <div className="space-y-1 flex-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive(link.href)
                        ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]"
                        : "text-gray-400 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <Icon size={18} />
                    {link.label}
                  </Link>
                );
              })}
              <Link
                href="/dashboard"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <Upload size={18} />
                New Analysis
              </Link>

              <div className="border-t border-white/5 my-2" />

              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/dashboard/settings")
                    ? "bg-[var(--color-brand-500)]/10 text-[var(--color-brand-400)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Settings size={18} />
                Settings
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
              >
                <HelpCircle size={18} />
                Help
              </Link>
            </div>

            {/* Sign out */}
            <button
              onClick={handleSignOut}
              disabled={isSignOutLoading}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-colors mt-4 w-full"
            >
              {isSignOutLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <LogOut size={18} />
              )}
              Sign Out
            </button>
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  Shield,
  LogOut,
  Menu,
  X,
  LayoutDashboard,
  History,
  Upload,
  Settings,
  BarChart3,
  HelpCircle,
  Loader2,
} from "lucide-react";

interface NavbarProps {
  user: { sub?: string; name?: string; email?: string; picture?: string } | null;
}

export function Navbar({ user }: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname === path;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Clear local session
      await fetch("/api/auth/logout", { method: "POST" });
      // Redirect to Auth0 logout (which will clear Auth0 session and redirect to home)
      window.location.href = "/auth/logout";
    } catch {
      // Still try Auth0 logout
      window.location.href = "/auth/logout";
    }
  };

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/history", label: "History", icon: History },
    { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
  ];

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-surface-300)] bg-[var(--color-surface-50)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-600)]" />
              <span className="text-lg font-bold tracking-tight text-[var(--color-surface-900)]">
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
                      ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                      : "text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)]"
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
                <span className="text-xs font-medium text-[var(--color-surface-900)]">
                  {user.name || user.email}
                </span>
              </div>
            )}

            {/* Sign out — desktop */}
            <Link
              href="/dashboard/settings"
              className="hidden md:flex p-2 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-white/10 transition-colors"
              title="Settings"
            >
              <Settings className="h-5 w-5 text-[var(--color-surface-500)] hover:text-white transition-colors" />
            </Link>
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="hidden md:flex p-2 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-white/10 transition-colors group"
              title="Sign Out"
            >
              {isLoggingOut ? (
                <Loader2 className="h-5 w-5 text-[var(--color-surface-500)] animate-spin" />
              ) : (
                <LogOut className="h-5 w-5 text-[var(--color-surface-500)] group-hover:text-red-500 transition-colors" />
              )}
            </button>

            {/* Hamburger — mobile */}
            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-3 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-white/10 transition-colors"
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
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[var(--color-surface-50)] border-l border-[var(--color-surface-300)] p-6 flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-[var(--color-brand-600)]" />
                <span className="text-sm font-bold">
                  Contract<span className="gradient-text">Clear</span>
                </span>
              </div>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-lg bg-[var(--color-surface-100)] hover:bg-[var(--color-surface-200)] transition-colors"
              >
                <X className="h-4 w-4 text-gray-400" />
              </button>
            </div>

            {/* User card */}
            {user && (
              <div className="p-3 bg-[var(--color-surface-100)] rounded-xl border border-[var(--color-surface-200)] mb-6">
                <p className="text-sm font-medium text-[var(--color-surface-900)] truncate">
                  {user.name || user.email}
                </p>
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
                        ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                        : "text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)]"
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
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors"
              >
                <Upload size={18} />
                New Analysis
              </Link>

              <div className="border-t border-[var(--color-surface-200)] my-2" />

              <Link
                href="/dashboard/settings"
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                  isActive("/dashboard/settings")
                    ? "bg-[var(--color-brand-50)] text-[var(--color-brand-700)]"
                    : "text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)]"
                }`}
              >
                <Settings size={18} />
                Settings
              </Link>
              <Link
                href="/help"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors"
              >
                <HelpCircle size={18} />
                Help
              </Link>
            </div>

            {/* Sign out */}
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4"
            >
              {isLoggingOut ? (
                <Loader2 size={18} className="animate-spin" />
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

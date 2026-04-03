"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Shield,
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
  History,
  BarChart3,
  Settings,
  LogOut,
  Loader2,
  HelpCircle,
  Upload,
} from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
}

const dashboardLinks: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/usage", label: "Usage", icon: BarChart3 },
];

interface SharedNavbarProps {
  variant?: "home" | "dashboard";
  user?: { name?: string; email?: string } | null;
  onLogout?: () => void;
  isLoggingOut?: boolean;
}

export function SharedNavbar({ 
  variant = "home", 
  user, 
  onLogout,
  isLoggingOut = false 
}: SharedNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && mobileOpen) {
        setMobileOpen(false);
      }
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [mobileOpen]);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-surface-300)] bg-[var(--color-surface-50)]/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href={variant === "dashboard" ? "/dashboard" : "/"} className="flex items-center gap-2.5">
              <Shield className="h-6 w-6 text-[var(--color-brand-600)]" />
              <span className="text-lg font-bold tracking-tight text-[var(--color-surface-900)]">
                Contract<span className="gradient-text">Clear</span>
              </span>
            </Link>

            {variant === "dashboard" && (
              <div className="hidden md:flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                {dashboardLinks.map((link) => {
                  const Icon = link.icon;
                  return (
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
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {variant === "home" ? (
              <>
                {!user && (
                  <Link href="/login" className="btn-secondary text-sm hidden sm:inline-flex">
                    Sign In
                  </Link>
                )}
                <Link href={user ? "/dashboard" : "/login"} className="btn-primary text-sm">
                  {user ? "Dashboard" : "Launch App"} <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            ) : (
              <>
                {user && (
                  <div className="hidden sm:flex flex-col items-end mr-1">
                    <span className="text-xs font-medium text-[var(--color-surface-900)]">
                      {user.name || user.email}
                    </span>
                  </div>
                )}

                <Link
                  href="/dashboard/settings"
                  className="hidden md:flex p-2 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-[var(--color-surface-200)] transition-colors"
                  title="Settings"
                  aria-label="Settings"
                >
                  <Settings className="h-5 w-5 text-[var(--color-surface-500)]" />
                </Link>
                <button
                  onClick={onLogout}
                  disabled={isLoggingOut}
                  className="hidden md:flex p-2 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-[var(--color-surface-200)] transition-colors group"
                  title="Sign Out"
                  aria-label="Sign Out"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-5 w-5 text-[var(--color-surface-500)] animate-spin" />
                  ) : (
                    <LogOut className="h-5 w-5 text-[var(--color-surface-500)] group-hover:text-red-500 transition-colors" />
                  )}
                </button>
              </>
            )}

            <button
              onClick={() => setMobileOpen(true)}
              className="md:hidden p-3 rounded-xl bg-[var(--color-surface-100)] border border-[var(--color-surface-300)] hover:bg-[var(--color-surface-200)] transition-colors"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5 text-[var(--color-surface-500)]" />
            </button>
          </div>
        </div>
      </nav>

      {mobileOpen && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-0 bottom-0 w-72 max-w-[85vw] bg-[var(--color-surface-50)] border-l border-[var(--color-surface-300)] p-6 flex flex-col animate-fade-in-up">
            <div className="flex items-center justify-between mb-8">
              <Link 
                href={variant === "dashboard" ? "/dashboard" : "/"} 
                className="flex items-center gap-2"
                onClick={() => setMobileOpen(false)}
              >
                <Shield className="h-5 w-5 text-[var(--color-brand-600)]" />
                <span className="text-sm font-bold">
                  Contract<span className="gradient-text">Clear</span>
                </span>
              </Link>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2.5 rounded-lg bg-[var(--color-surface-100)] hover:bg-[var(--color-surface-200)] transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                aria-label="Close menu"
              >
                <X className="h-4 w-4 text-[var(--color-surface-500)]" />
              </button>
            </div>

            {user && (
              <div className="p-3 bg-[var(--color-surface-100)] rounded-xl border border-[var(--color-surface-200)] mb-6">
                <p className="text-sm font-medium text-[var(--color-surface-900)] truncate">
                  {user.name || user.email}
                </p>
              </div>
            )}

            <div className="space-y-1 flex-1">
              {variant === "dashboard" ? (
                <>
                  {dashboardLinks.map((link) => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors min-h-[48px]"
                  >
                    <Upload size={18} />
                    New Analysis
                  </Link>
                  <div className="border-t border-[var(--color-surface-200)] my-2" />
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors min-h-[48px] ${
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
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors min-h-[48px]"
                  >
                    <HelpCircle size={18} />
                    Help
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors min-h-[48px]"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-[var(--color-surface-600)] hover:text-[var(--color-surface-900)] hover:bg-[var(--color-surface-100)] transition-colors min-h-[48px]"
                  >
                    Create Account
                  </Link>
                </>
              )}
            </div>

            {variant === "dashboard" && (
              <button
                onClick={() => {
                  setMobileOpen(false);
                  onLogout?.();
                }}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors mt-4 min-h-[48px]"
              >
                {isLoggingOut ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <LogOut size={18} />
                )}
                Sign Out
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

"use client";

import { useState } from "react";
import { useUser } from "@/context/user-context";
import {
  User,
  Lock,
  Bell,
  Database,
  Loader2,
  ExternalLink,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { userId, isLoading } = useUser();

  // Notification prefs (local state for now)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifComplete, setNotifComplete] = useState(true);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="h-8 w-8 text-[var(--color-brand-600)] animate-spin" />
      </div>
    );
  }

  return (
    <>
      <div className="mb-8 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight">
          Account <span className="gradient-text">Settings</span>
        </h1>
        <p className="mt-2 text-[var(--color-surface-500)]">
          Manage your profile, security, and preferences.
        </p>
      </div>

      <div className="max-w-2xl space-y-6">
        {/* Profile Info */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
              <User size={18} className="text-[var(--color-brand-700)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Profile</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Your account information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">User ID</label>
              <p className="text-sm text-[var(--color-surface-600)] py-2.5 px-4 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] font-mono text-xs break-all">{userId}</p>
            </div>
          </div>

          <p className="text-xs text-[var(--color-surface-400)] mt-4">
            Profile details are managed through your Auth0 account.
          </p>
        </div>

        {/* Security */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Lock size={18} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Security</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Password and authentication settings</p>
            </div>
          </div>

          <p className="text-sm text-[var(--color-surface-600)] mb-4">
            Manage your password, two-factor authentication, and connected accounts through Auth0.
          </p>

          <a
            href="https://manage.auth0.com"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary px-5 py-2.5 rounded-xl text-sm inline-flex items-center gap-2"
          >
            <Shield size={16} />
            Manage in Auth0
            <ExternalLink size={14} />
          </a>
        </div>

        {/* Notifications */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center">
              <Bell size={18} className="text-purple-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Notifications</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Choose what you get notified about</p>
            </div>
          </div>

          <div className="space-y-3">
            <label className="flex items-center justify-between p-3 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] cursor-pointer hover:bg-[var(--color-surface-100)] transition-colors">
              <div>
                <p className="text-sm font-medium text-[var(--color-surface-900)]">Email Notifications</p>
                <p className="text-xs text-[var(--color-surface-500)]">Receive email updates for your account</p>
              </div>
              <input type="checkbox" checked={notifEmail} onChange={(e) => setNotifEmail(e.target.checked)} className="w-5 h-5 rounded border-[var(--color-surface-300)] bg-[var(--color-surface-50)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]/50 cursor-pointer" />
            </label>

            <label className="flex items-center justify-between p-3 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)] cursor-pointer hover:bg-[var(--color-surface-100)] transition-colors">
              <div>
                <p className="text-sm font-medium text-[var(--color-surface-900)]">Analysis Complete</p>
                <p className="text-xs text-[var(--color-surface-500)]">Get notified when a contract analysis finishes</p>
              </div>
              <input type="checkbox" checked={notifComplete} onChange={(e) => setNotifComplete(e.target.checked)} className="w-5 h-5 rounded border-[var(--color-surface-300)] bg-[var(--color-surface-50)] text-[var(--color-brand-600)] focus:ring-[var(--color-brand-500)]/50 cursor-pointer" />
            </label>
          </div>
        </div>

        {/* Data & Privacy link */}
        <Link href="/dashboard/settings/data" className="glass-card p-6 rounded-2xl flex items-center justify-between group hover:border-[var(--color-surface-300)] transition-all">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
              <Database size={18} className="text-red-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Data & Privacy</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Export your data or delete your account</p>
            </div>
          </div>
          <ArrowRight size={16} className="text-[var(--color-surface-400)] group-hover:text-[var(--color-surface-500)] group-hover:translate-x-1 transition-all" />
        </Link>
      </div>
    </>
  );
}

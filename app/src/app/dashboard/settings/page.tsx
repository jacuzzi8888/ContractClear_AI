"use client";

import { useState } from "react";
import { useUser } from "@/context/user-context";
import {
  User,
  Lock,
  Bell,
  Database,
  Loader2,
  Shield,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Key,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const { user, isLoading } = useUser();

  // Notification prefs (local state for now)
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifComplete, setNotifComplete] = useState(true);

  // Backup password state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const handleSetPassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }

    setSavingPassword(true);
    setPasswordError(null);

    try {
      const res = await fetch("/api/user/password", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: newPassword, confirmPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Failed to set password");
        return;
      }

      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordForm(false);
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch {
      setPasswordError("An error occurred");
    } finally {
      setSavingPassword(false);
    }
  };

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
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Email</label>
              <p className="text-sm text-[var(--color-surface-600)] py-2.5 px-4 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)]">{user.email || "Not set"}</p>
            </div>
            {user.fullName && (
              <div>
                <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Name</label>
                <p className="text-sm text-[var(--color-surface-600)] py-2.5 px-4 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)]">{user.fullName}</p>
              </div>
            )}
          </div>
        </div>

        {/* Backup Password */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Key size={18} className="text-yellow-500" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Backup Password</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Set a password to access your account if Auth0 is unavailable</p>
            </div>
          </div>

          {passwordSuccess && (
            <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-xl text-green-600 text-sm mb-4">
              <CheckCircle2 size={16} />
              Password set successfully
            </div>
          )}

          {user.hasPassword && !showPasswordForm ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-[var(--color-surface-600)]">
                <CheckCircle2 size={16} className="text-green-500" />
                You have a backup password set
              </div>
              <button
                onClick={() => setShowPasswordForm(true)}
                className="text-sm text-[var(--color-brand-600)] font-medium hover:underline"
              >
                Change
              </button>
            </div>
          ) : (
            <>
              {passwordError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm mb-4">
                  <AlertCircle size={16} />
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="Min 6 characters"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                    placeholder="Confirm your password"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleSetPassword}
                    disabled={savingPassword || !newPassword || !confirmPassword}
                    className="btn-primary px-5 py-2.5 rounded-xl text-sm disabled:opacity-50 flex items-center gap-2"
                  >
                    {savingPassword && <Loader2 size={16} className="animate-spin" />}
                    Save Password
                  </button>
                  {user.hasPassword && (
                    <button
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordError(null);
                        setNewPassword("");
                        setConfirmPassword("");
                      }}
                      className="btn-secondary px-5 py-2.5 rounded-xl text-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
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

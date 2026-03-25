"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import {
  User,
  Lock,
  Bell,
  Database,
  Loader2,
  Save,
  CheckCircle2,
  AlertCircle,
  Shield,
  ArrowRight,
} from "lucide-react";
import Link from "next/link";

export default function SettingsPage() {
  const router = useRouter();
  const supabase = createClient();

  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [fullName, setFullName] = useState("");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  // Email state
  const [newEmail, setNewEmail] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);
  const [emailSuccess, setEmailSuccess] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);

  // Notification prefs
  const [notifEmail, setNotifEmail] = useState(true);
  const [notifComplete, setNotifComplete] = useState(true);
  const [savingNotifs, setSavingNotifs] = useState(false);
  const [notifSuccess, setNotifSuccess] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setUser(user);
      setFullName(user.user_metadata?.full_name || "");
      setNewEmail(user.email || "");

      // Load notification prefs from user metadata
      const prefs = user.user_metadata?.notification_prefs || {};
      setNotifEmail(prefs.email_notifications ?? true);
      setNotifComplete(prefs.analysis_complete ?? true);

      setLoading(false);
    };
    getUser();
  }, [supabase, router]);

  const handleSaveProfile = async () => {
    setSavingProfile(true);
    setProfileError(null);
    setProfileSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });
      if (error) throw error;
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err: any) {
      setProfileError(err.message);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }
    setSavingPassword(true);
    setPasswordError(null);
    setPasswordSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setPasswordSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setPasswordSuccess(false), 3000);
    } catch (err: any) {
      setPasswordError(err.message);
    } finally {
      setSavingPassword(false);
    }
  };

  const handleUpdateEmail = async () => {
    if (!newEmail || newEmail === user?.email) return;
    setSavingEmail(true);
    setEmailError(null);
    setEmailSuccess(false);
    try {
      const { error } = await supabase.auth.updateUser({ email: newEmail });
      if (error) throw error;
      setEmailSuccess(true);
      setTimeout(() => setEmailSuccess(false), 5000);
    } catch (err: any) {
      setEmailError(err.message);
    } finally {
      setSavingEmail(false);
    }
  };

  const handleSaveNotifs = async () => {
    setSavingNotifs(true);
    try {
      await supabase.auth.updateUser({
        data: {
          notification_prefs: {
            email_notifications: notifEmail,
            analysis_complete: notifComplete,
          },
        },
      });
      setNotifSuccess(true);
      setTimeout(() => setNotifSuccess(false), 3000);
    } catch (err) {
      // silently fail — prefs are non-critical
    } finally {
      setSavingNotifs(false);
    }
  };

  if (loading) {
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
        {/* ── Profile ─────────────────────────────────── */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
              <User size={18} className="text-[var(--color-brand-700)]" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Profile</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Your name and display information</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all"
                placeholder="Your full name"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Email</label>
              <p className="text-sm text-[var(--color-surface-600)] py-2.5 px-4 bg-[var(--color-surface-50)] rounded-xl border border-[var(--color-surface-200)]">{user?.email}</p>
            </div>
          </div>

          {profileError && <p className="text-red-400 text-xs mt-3 flex items-center gap-1"><AlertCircle size={12} /> {profileError}</p>}
          {profileSuccess && <p className="text-green-400 text-xs mt-3 flex items-center gap-1"><CheckCircle2 size={12} /> Profile updated.</p>}

          <button onClick={handleSaveProfile} disabled={savingProfile} className="btn-primary mt-4 px-5 py-2.5 rounded-xl text-sm">
            {savingProfile ? <Loader2 size={16} className="animate-spin mr-2" /> : <Save size={16} className="mr-2" />}
            Save Changes
          </button>
        </div>

        {/* ── Security: Password ──────────────────────── */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
              <Lock size={18} className="text-yellow-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Password</h2>
              <p className="text-xs text-[var(--color-surface-500)]">Update your account password</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">New Password</label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all" placeholder="Min 6 characters" />
            </div>
            <div>
              <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">Confirm Password</label>
              <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all" placeholder="Re-enter new password" />
            </div>
          </div>

          {passwordError && <p className="text-red-400 text-xs mt-3 flex items-center gap-1"><AlertCircle size={12} /> {passwordError}</p>}
          {passwordSuccess && <p className="text-green-400 text-xs mt-3 flex items-center gap-1"><CheckCircle2 size={12} /> Password updated.</p>}

          <button onClick={handleUpdatePassword} disabled={savingPassword || !newPassword || !confirmPassword} className="btn-primary mt-4 px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">
            {savingPassword ? <Loader2 size={16} className="animate-spin mr-2" /> : <Lock size={16} className="mr-2" />}
            Update Password
          </button>
        </div>

        {/* ── Security: Email ─────────────────────────── */}
        <div className="glass-card p-6 rounded-2xl">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
              <Shield size={18} className="text-blue-400" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[var(--color-surface-900)]">Change Email</h2>
              <p className="text-xs text-[var(--color-surface-500)]">We'll send a confirmation to the new address</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-[var(--color-surface-500)] ml-1 mb-1.5 block">New Email Address</label>
            <input type="email" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} className="w-full bg-[var(--color-surface-50)] border border-[var(--color-surface-300)] rounded-xl py-2.5 px-4 text-sm text-[var(--color-surface-900)] focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500)]/40 focus:border-[var(--color-brand-500)]/50 transition-all" placeholder="new@email.com" />
          </div>

          {emailError && <p className="text-red-400 text-xs mt-3 flex items-center gap-1"><AlertCircle size={12} /> {emailError}</p>}
          {emailSuccess && <p className="text-green-400 text-xs mt-3 flex items-center gap-1"><CheckCircle2 size={12} /> Confirmation sent to your new email. Check your inbox.</p>}

          <button onClick={handleUpdateEmail} disabled={savingEmail || !newEmail || newEmail === user?.email} className="btn-primary mt-4 px-5 py-2.5 rounded-xl text-sm disabled:opacity-50">
            {savingEmail ? <Loader2 size={16} className="animate-spin mr-2" /> : <Shield size={16} className="mr-2" />}
            Update Email
          </button>
        </div>

        {/* ── Notifications ───────────────────────────── */}
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

          {notifSuccess && <p className="text-green-400 text-xs mt-3 flex items-center gap-1"><CheckCircle2 size={12} /> Preferences saved.</p>}

          <button onClick={handleSaveNotifs} disabled={savingNotifs} className="btn-secondary mt-4 px-5 py-2.5 rounded-xl text-sm">
            {savingNotifs ? <Loader2 size={16} className="animate-spin mr-2" /> : null}
            Save Preferences
          </button>
        </div>

        {/* ── Data & Privacy link ─────────────────────── */}
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

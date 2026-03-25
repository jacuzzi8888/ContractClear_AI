"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[var(--color-surface-200)] bg-[var(--color-surface-50)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
            <span className="text-lg font-bold tracking-tight">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-[var(--color-surface-500)] hover:text-[var(--color-surface-900)] transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-16 animate-fade-in">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight mb-2">Privacy Policy</h1>
        <p className="text-sm text-[var(--color-surface-500)] mb-10">Last updated: March 24, 2026</p>

        <div className="prose prose-sm max-w-none space-y-8 text-[var(--color-surface-600)] leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">1. Information We Collect</h2>
            <p><strong className="text-[var(--color-surface-900)]">Account Information:</strong> When you create an account, we collect your email address, name, and authentication credentials via Supabase.</p>
            <p className="mt-2"><strong className="text-[var(--color-surface-900)]">Documents:</strong> When you upload contracts for analysis, we process the PDF content through Google&apos;s Gemini AI API. Documents are stored in our secure Supabase database associated with your account.</p>
            <p className="mt-2"><strong className="text-[var(--color-surface-900)]">Usage Data:</strong> We collect information about your interactions with the service, including documents analyzed, features used, and timestamps.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">2. How We Use Your Information</h2>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>To provide and improve the contract analysis service</li>
              <li>To process your uploaded documents through AI models for risk extraction</li>
              <li>To maintain your analysis history and account functionality</li>
              <li>To communicate with you about your account and service updates</li>
              <li>To monitor and analyze usage patterns for service improvement</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">3. Third-Party Services</h2>
            <p>We rely on the following third-party services to operate:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li><strong className="text-[var(--color-surface-900)]">Supabase:</strong> Database, authentication, and file storage</li>
              <li><strong className="text-[var(--color-surface-900)]">Google Gemini API:</strong> AI-powered document analysis</li>
              <li><strong className="text-[var(--color-surface-900)]">Vercel:</strong> Application hosting and deployment</li>
              <li><strong className="text-[var(--color-surface-900)]">Inngest:</strong> Background job processing</li>
            </ul>
            <p className="mt-2">Your documents may be processed by these third-party services. We recommend reviewing their respective privacy policies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">4. Data Retention</h2>
            <p>Your documents and analysis results are retained in your account until you choose to delete them. You can delete individual documents or your entire account through your account settings at any time.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">5. Data Security</h2>
            <p>We implement industry-standard security measures to protect your data, including encrypted storage, secure authentication, and access controls. However, no method of electronic transmission or storage is 100% secure.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Access all data associated with your account</li>
              <li>Export your data in a machine-readable format</li>
              <li>Delete your data and account at any time</li>
              <li>Request corrections to your account information</li>
            </ul>
            <p className="mt-2">These actions are available through your account settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">7. Cookies</h2>
            <p>We use essential cookies for authentication and session management. We do not use tracking cookies or third-party advertising cookies.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">8. Children&apos;s Privacy</h2>
            <p>ContractClear AI is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">9. Changes to This Policy</h2>
            <p>We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the &quot;Last updated&quot; date and, where appropriate, by email.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-[var(--color-surface-900)] mb-3">10. Contact</h2>
            <p>Questions about this privacy policy can be directed to our support team through the Help page.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-[var(--color-surface-200)] text-center">
          <Link href="/terms" className="text-sm text-[var(--color-brand-600)] hover:text-[var(--color-brand-700)] transition-colors">
            View Terms of Service
          </Link>
        </div>
      </main>

      <footer className="border-t border-[var(--color-surface-200)] py-8 text-center text-xs text-[var(--color-surface-500)]">
        <p>ContractClear AI is not a substitute for legal counsel. All outputs are for informational purposes only.</p>
      </footer>
    </div>
  );
}

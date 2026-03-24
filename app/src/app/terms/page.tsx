"use client";

import Link from "next/link";
import { Shield, ArrowLeft } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[var(--color-surface-950)]/80 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <Shield className="h-6 w-6 text-[var(--color-brand-400)]" />
            <span className="text-lg font-bold tracking-tight">
              Contract<span className="gradient-text">Clear</span>
            </span>
          </Link>
          <Link href="/" className="text-sm text-gray-400 hover:text-white transition-colors flex items-center gap-1">
            <ArrowLeft size={14} /> Back to Home
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-3xl px-6 pt-28 pb-16 animate-fade-in">
        <h1 className="text-4xl font-bold tracking-tight mb-2">Terms of Service</h1>
        <p className="text-sm text-gray-500 mb-10">Last updated: March 24, 2026</p>

        <div className="prose prose-invert prose-sm max-w-none space-y-8 text-gray-300 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-white mb-3">1. Acceptance of Terms</h2>
            <p>By accessing or using ContractClear AI, you agree to be bound by these Terms of Service. If you do not agree to these terms, you may not use the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">2. Description of Service</h2>
            <p>ContractClear AI is an artificial intelligence-powered tool that analyzes legal contracts to identify potential risks, liabilities, and issues. The service processes uploaded PDF documents using AI models to extract risks, provide verbatim quotes, and generate recommendations.</p>
            <p className="mt-2"><strong className="text-white">Important:</strong> ContractClear AI is not a law firm and does not provide legal advice. The analysis output is for informational purposes only and should not be relied upon as a substitute for professional legal counsel.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">3. User Responsibilities</h2>
            <p>You are responsible for:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1">
              <li>Ensuring you have the right to upload and analyze any documents submitted to the service</li>
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activity that occurs under your account</li>
              <li>Complying with all applicable laws when using the service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">4. Data and Privacy</h2>
            <p>Your uploaded documents are processed by third-party AI services (Google Gemini). While we take reasonable measures to protect your data, you acknowledge that uploading sensitive documents to any cloud-based service carries inherent risks. Please review our Privacy Policy for details on how your data is handled.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">5. Limitation of Liability</h2>
            <p>ContractClear AI is provided &quot;as is&quot; without warranties of any kind. We do not guarantee the accuracy, completeness, or reliability of the AI-generated analysis. In no event shall ContractClear AI be liable for any direct, indirect, incidental, special, or consequential damages arising from the use of the service.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">6. Intellectual Property</h2>
            <p>The ContractClear AI service, including its software, design, and branding, is owned by us. You retain ownership of your uploaded documents and analysis results.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">7. Termination</h2>
            <p>We reserve the right to suspend or terminate your access to the service at any time, with or without cause. You may delete your account and data at any time through your account settings.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">8. Changes to Terms</h2>
            <p>We may update these Terms of Service from time to time. Continued use of the service after changes constitutes acceptance of the revised terms.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-white mb-3">9. Contact</h2>
            <p>Questions about these terms should be directed to our support team through the Help page.</p>
          </section>
        </div>

        <div className="mt-12 pt-6 border-t border-white/5 text-center">
          <Link href="/privacy" className="text-sm text-indigo-400 hover:text-indigo-300 transition-colors">
            View Privacy Policy
          </Link>
        </div>
      </main>

      <footer className="border-t border-white/5 py-8 text-center text-xs text-[var(--color-surface-500)]">
        <p>ContractClear AI is not a substitute for legal counsel. All outputs are for informational purposes only.</p>
      </footer>
    </div>
  );
}

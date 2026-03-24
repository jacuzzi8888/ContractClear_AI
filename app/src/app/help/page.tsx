"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Shield,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Zap,
  Lock,
  CreditCard,
  HelpCircle,
} from "lucide-react";

interface FAQItem {
  question: string;
  answer: string;
}

const faqSections: { title: string; icon: typeof HelpCircle; items: FAQItem[] }[] = [
  {
    title: "Getting Started",
    icon: Zap,
    items: [
      {
        question: "What file types are supported?",
        answer: "ContractClear AI accepts PDF files up to 50MB. We process scanned and text-based PDFs. Other formats (Word, images) are not currently supported.",
      },
      {
        question: "How long does analysis take?",
        answer: "Analysis time depends on the document length. A typical 10-page contract takes 30-60 seconds. Longer documents (50+ pages) may take up to 3-5 minutes.",
      },
      {
        question: "What types of contracts can I analyze?",
        answer: "Our AI is trained to analyze a wide variety of legal documents including NDAs, SaaS agreements, employment contracts, commercial leases, vendor agreements, software licenses, and more.",
      },
    ],
  },
  {
    title: "Understanding the Analysis",
    icon: FileQuestion,
    items: [
      {
        question: "How accurate is the AI analysis?",
        answer: "Our analysis is powered by Gemini 3 Flash, a state-of-the-art AI model. Every identified risk is grounded in a verbatim quote from the document — the AI does not hallucinate or invent clauses. However, the analysis is not infallible and should be reviewed by a qualified legal professional.",
      },
      {
        question: "What do the risk levels mean?",
        answer: "Critical: Major legal or financial risk requiring immediate attention. High: Significant concern that likely needs negotiation. Medium: Potential issue worth reviewing. Low: Minor concern or informational note. Info: General observation about the contract structure.",
      },
      {
        question: "What is 'evidence grounding'?",
        answer: "Every risk identified by our AI includes an exact verbatim quote from the contract and a page reference. If the AI cannot cite specific evidence for a risk, that finding is automatically discarded. This prevents hallucinations and ensures every claim is backed by the actual document.",
      },
      {
        question: "What is 'confidence' in the risk cards?",
        answer: "Confidence represents how certain the AI is about the identified risk, on a scale of 0-100%. Risks below 60% confidence are automatically filtered out. Higher confidence does not replace legal judgment — it simply indicates the AI's certainty based on the text.",
      },
    ],
  },
  {
    title: "Email Drafting",
    icon: HelpCircle,
    items: [
      {
        question: "How do I draft negotiation emails?",
        answer: "There are two options: 1) Draft Email — click the button on any individual risk card to generate an email for that specific issue. 2) Draft Summary Email — click the button in the Risk Analysis header to generate one consolidated email covering all issues found in the contract.",
      },
      {
        question: "Can I edit the drafted emails?",
        answer: "Yes, the drafted emails are displayed as text that you can copy and paste into your email client. You are free to edit them before sending. The drafts are suggestions — always review before sending to a counterparty.",
      },
    ],
  },
  {
    title: "Account & Data",
    icon: Lock,
    items: [
      {
        question: "How is my data stored?",
        answer: "Your documents and analysis results are stored in Supabase with encryption at rest and in transit. Documents are processed through Google's Gemini API for analysis. We do not share your data with third parties beyond what is necessary to provide the service.",
      },
      {
        question: "Can I delete my data?",
        answer: "Yes. You can delete individual documents from the dashboard, or delete your entire account and all data from Settings > Data & Privacy. Deletion is permanent and cannot be undone.",
      },
      {
        question: "Can I export my data?",
        answer: "Yes. Go to Settings > Data & Privacy and click 'Export Data'. This will download a JSON file containing all your documents, analysis results, and issues.",
      },
    ],
  },
  {
    title: "Billing",
    icon: CreditCard,
    items: [
      {
        question: "Is ContractClear AI free?",
        answer: "We are currently in beta and offering free unlimited analyses. We may introduce paid plans in the future, but existing users will be given advance notice.",
      },
      {
        question: "Do I need a credit card to sign up?",
        answer: "No. You can create a free account and start analyzing contracts immediately with no credit card required.",
      },
    ],
  },
];

function FAQSection({ title, icon: Icon, items }: { title: string; icon: typeof HelpCircle; items: FAQItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="glass-card p-6 rounded-2xl">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-8 h-8 rounded-lg bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center">
          <Icon size={16} className="text-[var(--color-brand-700)]" />
        </div>
        <h2 className="text-lg font-bold text-[var(--color-surface-900)]">{title}</h2>
      </div>
      <div className="space-y-2">
        {items.map((item, index) => (
          <div key={index} className="border border-[var(--color-surface-200)] rounded-xl overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full flex items-center justify-between p-4 text-left hover:bg-[var(--color-surface-100)] transition-colors"
            >
              <span className="text-sm font-medium text-[var(--color-surface-900)] pr-4">{item.question}</span>
              {openIndex === index ? (
                <ChevronUp size={16} className="text-[var(--color-surface-500)] flex-shrink-0" />
              ) : (
                <ChevronDown size={16} className="text-[var(--color-surface-500)] flex-shrink-0" />
              )}
            </button>
            {openIndex === index && (
              <div className="px-4 pb-4 animate-fade-in-up">
                <p className="text-sm text-[var(--color-surface-500)] leading-relaxed">{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HelpPage() {
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
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-[var(--color-brand-50)] border border-[var(--color-brand-200)] flex items-center justify-center mx-auto mb-4">
            <HelpCircle size={28} className="text-[var(--color-brand-700)]" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">
            Help & <span className="gradient-text">FAQ</span>
          </h1>
          <p className="text-[var(--color-surface-500)] max-w-md mx-auto">
            Find answers to common questions about ContractClear AI.
          </p>
        </div>

        <div className="space-y-6">
          {faqSections.map((section) => (
            <FAQSection key={section.title} {...section} />
          ))}
        </div>

        <div className="mt-12 glass-card p-8 rounded-2xl text-center">
          <h3 className="text-lg font-bold text-[var(--color-surface-900)] mb-2">Still have questions?</h3>
          <p className="text-sm text-[var(--color-surface-500)] mb-4 max-w-sm mx-auto">
            If you can&apos;t find the answer you&apos;re looking for, check our legal pages for more details.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/terms" className="text-sm text-[var(--color-brand-700)] hover:text-[var(--color-brand-700)] transition-colors">
              Terms of Service
            </Link>
            <span className="text-[var(--color-surface-400)]">|</span>
            <Link href="/privacy" className="text-sm text-[var(--color-brand-700)] hover:text-[var(--color-brand-700)] transition-colors">
              Privacy Policy
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[var(--color-surface-200)] py-8 text-center text-xs text-[var(--color-surface-500)]">
        <p>ContractClear AI is not a substitute for legal counsel. All outputs are for informational purposes only.</p>
      </footer>
    </div>
  );
}

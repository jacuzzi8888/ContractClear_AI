import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport = { width: "device-width", initialScale: 1 };

export const metadata: Metadata = {
  title: "ContractClear AI — AI-Powered Contract Risk Analysis",
  description:
    "Upload legal contracts, extract risks with strict evidence, and stream a visual risk dashboard. Every claim is grounded in exact quotes and page references.",
  keywords: [
    "contract analysis",
    "legal AI",
    "risk assessment",
    "evidence grounding",
    "PDF analysis",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased">
        <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:p-4 focus:bg-white focus:text-black">
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
        <Toaster theme="light" position="top-right" richColors closeButton />
      </body>
    </html>
  );
}

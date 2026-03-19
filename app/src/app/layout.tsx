import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}

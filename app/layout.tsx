import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NextSSRPlugin } from "@uploadthing/react/next-ssr-plugin";
import { ourFileRouter } from "./api/uploadthing/core";
import { extractRouterConfig } from "uploadthing/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CurigenX - AI-Powered Regulatory Document Analysis",
  description: "SaaS for regulatory, clinical, and medical writing teams. Automate and streamline QC of Clinical Study Reports (CSRs) for regulatory dossier accuracy, consistency, and scientific integrity.",
  keywords: ["regulatory compliance", "clinical study reports", "CSR", "pharma", "biotech", "AI analysis", "document QC"],
  authors: [{ name: "CurigenX Team" }],
  openGraph: {
    title: "CurigenX - AI-Powered Regulatory Document Analysis",
    description: "Automate and streamline QC of Clinical Study Reports (CSRs) for regulatory dossier accuracy, consistency, and scientific integrity.",
    type: "website",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-b from-gray-50 to-white`}
      >
        <NextSSRPlugin
          routerConfig={extractRouterConfig(ourFileRouter)}
        />
        <main className="relative z-10">
          {children}
        </main>
      </body>
    </html>
  );
}

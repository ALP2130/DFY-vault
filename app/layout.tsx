import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AtlasAI — AI-Powered Marketing",
  description: "Generate a month of marketing content in minutes. AI-powered social posts, blogs, emails, and ad copy for your business.",
  openGraph: {
    title: "AtlasAI — AI-Powered Marketing",
    description: "Generate a month of marketing content in minutes.",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className} suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}

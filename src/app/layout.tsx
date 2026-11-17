import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DotCoder | Enterprise Campus Placement, Coding Lab & Proctored Assessment SaaS",
  description:
    "Flagship coding lab, proctored examinations, and placement readiness platform designed for engineering and arts colleges.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-500/20 selection:text-indigo-900`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

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
    <html lang="en" className="dark h-full">
      <body className={`${inter.className} min-h-screen bg-[#09090B] text-slate-100 antialiased selection:bg-indigo-500/30 selection:text-indigo-200`}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}

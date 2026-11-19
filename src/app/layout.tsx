import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";
import { LoadingProvider } from "@/components/shared/global-loading-screen";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "EQLV CODE | Enterprise Campus Placement, Coding Lab & Proctored Assessment SaaS",
  description:
    "Flagship coding lab, proctored examinations, and placement readiness platform designed for engineering and arts colleges.",
  icons: {
    icon: "/logo.png",
    shortcut: "/favicon.ico",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} min-h-screen bg-[#F8FAFC] text-slate-900 antialiased selection:bg-indigo-500/20 selection:text-indigo-900`}>
        <LoadingProvider>
          <AppShell>{children}</AppShell>
        </LoadingProvider>
      </body>
    </html>
  );
}

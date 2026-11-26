import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { AppShell } from "@/components/shared/app-shell";
import { LoadingProvider } from "@/components/shared/global-loading-screen";

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin.woff2",
  weight: "300 700",
  variable: "--font-display",
  display: "swap",
  preload: false,
});

const plusJakarta = localFont({
  src: "./fonts/plus-jakarta-sans-latin.woff2",
  weight: "200 800",
  variable: "--font-sans",
  display: "swap",
  preload: true,
});

const jetbrainsMono = localFont({
  src: "./fonts/jetbrains-mono-latin.woff2",
  weight: "100 800",
  variable: "--font-mono",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "EQLV CODE | Enterprise Campus Placement, Coding Lab & Proctored Assessment SaaS",
  description:
    "Obsidian-grade coding lab, AI-proctored examinations, and campus placement intelligence platform engineered for universities and hiring teams.",
  icons: {
    icon: "/icon-64.png",
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
    <html
      lang="en"
      suppressHydrationWarning
      data-scroll-behavior="smooth"
      className={`dark h-full ${spaceGrotesk.variable} ${plusJakarta.variable} ${jetbrainsMono.variable}`}
    >
      <body
        suppressHydrationWarning
        className="min-h-screen bg-[#070B09] text-[#F4F7F5] font-sans antialiased selection:bg-[#9DFF00]/25 selection:text-[#9DFF00]"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#9DFF00] focus:text-[#070B09] focus:font-bold focus:rounded-lg focus:shadow-lg focus:outline-none"
        >
          Skip to main content
        </a>
        <LoadingProvider>
          <AppShell>{children}</AppShell>
        </LoadingProvider>
      </body>
    </html>
  );
}

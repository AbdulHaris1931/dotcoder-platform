"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#070B09] text-white flex items-center justify-center p-6 font-sans antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-[#9DFF00] focus:text-black focus:rounded-md focus:font-bold"
        >
          Skip to main content
        </a>
        <main id="main-content" className="w-full max-w-md rounded-3xl bg-[#0C120F] border border-[#1E2C24] p-8 text-center space-y-5 shadow-2xl">
          <div className="w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
          </div>
          <div className="space-y-2">
            <h1 className="font-display text-xl font-bold tracking-tight text-[#F4F7F5]">
              Critical Application Error
            </h1>
            <p className="text-xs text-[#99A9A0] leading-relaxed">
              The EQLV CODE shell encountered an unrecoverable error. Please reload to restore your workspace.
            </p>
            {error.digest && (
              <p className="text-[11px] font-mono text-[#85998D]">
                Reference ID: {error.digest}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={() => reset()}
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reload Application</span>
          </button>
        </main>
      </body>
    </html>
  );
}

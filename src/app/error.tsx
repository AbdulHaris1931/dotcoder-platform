"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function RouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[EQLV CODE Route Error]:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-[#0C120F] border border-[#1E2C24] p-8 text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6 text-amber-400" />
        </div>

        <div className="space-y-2">
          <h1 className="font-display text-xl font-bold tracking-tight text-[#F4F7F5]">
            Something went wrong
          </h1>
          <p className="text-xs text-[#99A9A0] leading-relaxed">
            An unexpected interruption occurred while rendering this view. Your saved progress and local backups remain intact.
          </p>
          {error.digest && (
            <p className="text-[11px] font-mono text-[#85998D] pt-1">
              Reference ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            type="button"
            onClick={() => reset()}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-[#F4F7F5] text-xs font-bold transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

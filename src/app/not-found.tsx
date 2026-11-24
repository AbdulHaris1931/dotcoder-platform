import Link from "next/link";
import { ArrowRight, Compass, Home } from "lucide-react";

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-[#070B09] text-[#F4F7F5] flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md rounded-3xl bg-[#0C120F] border border-[#1E2C24] p-8 text-center space-y-5 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-[#9DFF00]/10 border border-[#9DFF00]/30 flex items-center justify-center mx-auto">
          <Compass className="w-6 h-6 text-[#9DFF00]" />
        </div>

        <div className="space-y-2">
          <div className="text-xs font-mono font-bold text-[#9DFF00] uppercase tracking-widest">
            Error 404
          </div>
          <h1 className="font-display text-2xl font-bold tracking-tight text-[#F4F7F5]">
            Page Not Found
          </h1>
          <p className="text-xs text-[#99A9A0] leading-relaxed">
            The requested route does not exist or may have been moved. Sign in to access your institutional portal.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/login"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] text-xs font-extrabold transition-all"
          >
            <span>Portal Login</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#121B16] hover:bg-[#18241D] border border-[#2C4034] text-[#F4F7F5] text-xs font-bold transition-all"
          >
            <Home className="w-4 h-4" />
            <span>Landing Page</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from "next/link";
import { FileText, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Terms of Service | EQLV CODE",
  description: "Terms of service and academic integrity agreement for EQLV CODE institutional users.",
};

export default function TermsOfServicePage() {
  return (
    <main className="min-h-[100dvh] bg-[#070B09] bg-obsidian-grid text-[#F4F7F5] font-sans py-14 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        <div className="space-y-3 border-b border-[#1E2C24] pb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 min-h-[36px] text-xs font-mono font-semibold text-[#A3B4AA] hover:text-[#9DFF00] transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to EQLV CODE</span>
          </Link>
          <div className="flex items-center gap-2 text-[#9DFF00] text-xs font-mono font-bold uppercase tracking-wider">
            <FileText className="w-4 h-4" />
            <span>Institutional Terms</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F5]">
            Terms of Service
          </h1>
          <p className="text-xs text-[#85998D] font-mono">
            Last Updated: November 2026 &bull; EQLV CODE Campus Placement Platform
          </p>
        </div>

        <div className="space-y-5">
          {[
            {
              title: "1. Authorized Access",
              body: "Platform accounts are provisioned exclusively by authorized institutional administrators. Sharing login credentials, attempting to bypass role restrictions, or impersonating another student or faculty member is prohibited and may result in immediate account suspension.",
            },
            {
              title: "2. Academic Integrity & Proctored Exams",
              body: "During proctored assessments, students must remain within the exam workspace. Automated proctoring logs tab switches, window focus changes, and fullscreen exits to calculate an objective integrity trust score reviewed by institutional faculty.",
            },
            {
              title: "3. Fair Usage & Sandbox Execution",
              body: "Code execution sandboxes and AI tutoring tools are rate-limited per verified student to maintain stable performance across campus lab networks. Deliberate denial-of-service loops, sandbox escape attempts, or automated scraping are prohibited.",
            },
            {
              title: "4. Service Availability",
              body: "EQLV CODE is engineered for high-concurrency campus drives with automatic local exam recovery. Scheduled maintenance windows are coordinated directly with subscribing college placement cells.",
            },
          ].map((sec) => (
            <section
              key={sec.title}
              className="p-6 rounded-2xl bg-[#0C120F] border border-[#1E2C24] space-y-2.5"
            >
              <h2 className="font-display text-lg font-bold text-[#F4F7F5]">{sec.title}</h2>
              <p className="text-sm text-[#99A9A0] leading-relaxed">{sec.body}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}

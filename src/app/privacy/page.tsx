import Link from "next/link";
import { ShieldCheck, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Privacy Policy | EQLV CODE",
  description: "Data protection, student privacy, and institutional compliance standards for EQLV CODE.",
};

export default function PrivacyPolicyPage() {
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
            <ShieldCheck className="w-4 h-4" />
            <span>Institutional Data Governance</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-[#F4F7F5]">
            Privacy Policy
          </h1>
          <p className="text-xs text-[#85998D] font-mono">
            Last Updated: November 2026 &bull; Applicable to Colleges, Faculty, TPOs, and Students
          </p>
        </div>

        <div className="space-y-5">
          {[
            {
              title: "1. Institutional Data Ownership",
              body: "EQLV CODE operates as a data processor on behalf of subscribed colleges and universities. All student academic profiles, roll numbers, coding submissions, assessment transcripts, and placement readiness records remain strictly owned by the respective institution.",
            },
            {
              title: "2. Information We Collect",
              body: "We store institution-provisioned account identity (full name, institutional email, roll number, department, batch year), coding telemetry (code submissions, execution pass rates, curriculum progress), and proctored exam integrity logs (tab switches, fullscreen exits, timestamps) strictly during active assessments.",
            },
            {
              title: "3. Multi-Tenant Isolation & Security",
              body: "Access to student records is enforced using PostgreSQL Row Level Security (RLS) across all 31 tables, server-verified JWT sessions, and role-based access control (RBAC). Students view only their own records; faculty and Placement Officers access only their authorized cohorts.",
            },
            {
              title: "4. Data Retention & Deletion",
              body: "Institutions may archive or permanently erase graduated cohorts at any time through the Super Admin enclave. Upon deletion, associated Auth credentials and student PII are removed from active storage.",
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

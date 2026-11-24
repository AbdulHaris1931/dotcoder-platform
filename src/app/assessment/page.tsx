"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AssessmentRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/student/assessments");
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#0F1412] text-white flex items-center justify-center font-mono text-sm">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#9DFF00] animate-pulse" />
        <span>Redirecting to Student Assessment Hub...</span>
      </div>
    </div>
  );
}

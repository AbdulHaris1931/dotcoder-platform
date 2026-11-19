"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PracticeRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // Default directly to the flagship warmup problem in DotLab
    router.replace("/practice/two-sum");
  }, [router]);

  return (
    <div className="h-screen w-full bg-[#0B0F17] text-white flex items-center justify-center font-mono text-xs">
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#9DFF00] animate-pulse" />
        <span>Loading DotLab Coding Workspace...</span>
      </div>
    </div>
  );
}

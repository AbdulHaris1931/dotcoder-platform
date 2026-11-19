"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function CodingLabPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  useEffect(() => {
    const target = slug || "two-sum";
    router.replace(`/practice/${target}`);
  }, [slug, router]);

  return (
    <div className="h-screen w-full bg-[#0F1412] text-white flex items-center justify-center font-mono text-sm">
      <div className="flex items-center gap-3">
        <span className="w-2.5 h-2.5 rounded-full bg-[#9DFF00] animate-pulse" />
        <span>Loading DotLab IDE...</span>
      </div>
    </div>
  );
}

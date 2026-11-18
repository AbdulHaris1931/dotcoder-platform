"use client";

import React from "react";
import Link from "next/link";

interface DotCoderLogoProps {
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
}

export function DotCoderLogo({
  theme = "light",
  size = "md",
  href = "/",
  className = "",
}: DotCoderLogoProps) {
  const isDark = theme === "dark";

  const dotSizes = {
    sm: "w-1.5 h-1.5 rounded-[2px]",
    md: "w-2.5 h-2.5 rounded-[3px]",
    lg: "w-3 h-3 rounded-[4px]",
  };

  const textSizes = {
    sm: "text-base tracking-tight",
    md: "text-xl tracking-tight",
    lg: "text-2xl tracking-tight",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* 4-dot Matrix Icon */}
      <div className="grid grid-cols-2 gap-1 p-0.5">
        <div className={`${dotSizes[size]} bg-[#3B82F6] shadow-xs`} />
        <div className={`${dotSizes[size]} bg-[#22C55E] shadow-xs`} />
        <div className={`${dotSizes[size]} bg-[#F97316] shadow-xs`} />
        <div className={`${dotSizes[size]} bg-[#8B5CF6] shadow-xs`} />
      </div>

      {/* Wordmark */}
      <span className={`font-bold font-sans ${textSizes[size]}`}>
        <span className={isDark ? "text-white" : "text-slate-900"}>dot</span>
        <span className={isDark ? "text-indigo-400" : "text-[#4F46E5]"}>coder</span>
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center hover:opacity-90 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}

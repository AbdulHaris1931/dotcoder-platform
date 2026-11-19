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
  theme = "dark",
  size = "md",
  href = "/",
  className = "",
}: DotCoderLogoProps) {
  const isDark = theme === "dark";

  const textSizes = {
    sm: "text-base",
    md: "text-lg",
    lg: "text-2xl",
  };

  const tagSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const content = (
    <div className={`inline-flex items-center gap-2 select-none font-sans font-bold tracking-tight ${className}`}>
      <span className={`font-mono font-black text-[#C4F82A] ${tagSizes[size]}`}>
        &lt;/&gt;
      </span>
      <span className={`${textSizes[size]} ${isDark ? "text-white" : "text-slate-900"}`}>
        DotCoder
      </span>
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

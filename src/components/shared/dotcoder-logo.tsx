"use client";

import React from "react";
import Link from "next/link";

interface DotCoderLogoProps {
  theme?: "light" | "dark";
  size?: "sm" | "md" | "lg";
  href?: string;
  className?: string;
  showText?: boolean;
}

export function DotCoderLogo({
  theme = "dark",
  size = "md",
  href = "/",
  className = "",
  showText = true,
}: DotCoderLogoProps) {
  const isDark = theme === "dark";

  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const imgSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none font-sans font-black tracking-tight ${className}`}>
      <img
        src="/logo.png"
        alt="EQLV CODE"
        className={`${imgSizes[size]} object-contain rounded-lg flex-shrink-0`}
      />
      {showText && (
        <span className={`${textSizes[size]} ${isDark ? "text-white" : "text-slate-900"} font-black tracking-tight`}>
          EQLV CODE
        </span>
      )}
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

// Named alias
export const EqlvLogo = DotCoderLogo;


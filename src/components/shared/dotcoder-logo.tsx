"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";

interface DotCoderLogoProps {
  theme?: "light" | "dark" | "auto";
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
  const textSizes = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  const codeSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  const imgSizes = {
    sm: "w-6 h-6",
    md: "w-7 h-7",
    lg: "w-9 h-9",
  };

  const pixelSizes = {
    sm: 24,
    md: 28,
    lg: 36,
  };

  const eqlvColor = theme === "light" ? "text-slate-950" : "text-[#F4F7F5]";
  const codeColor = theme === "light" ? "text-emerald-700" : "text-[#9DFF00]";

  const content = (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      <Image
        src="/logo.png"
        alt="EQLV CODE"
        width={pixelSizes[size]}
        height={pixelSizes[size]}
        priority
        className={`${imgSizes[size]} object-contain rounded-lg flex-shrink-0 ring-1 ring-white/10`}
      />
      {showText && (
        <span className={`inline-flex items-baseline gap-1.5 ${textSizes[size]}`}>
          <span className={`font-display font-bold tracking-tight ${eqlvColor}`}>
            EQLV
          </span>
          <span className={`font-mono font-bold tracking-wider ${codeSizes[size]} ${codeColor}`}>
            CODE
          </span>
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="focus:outline-none focus-visible:ring-2 focus-visible:ring-[#9DFF00] rounded-lg flex items-center">
        {content}
      </Link>
    );
  }

  return content;
}

export const EqlvLogo = DotCoderLogo;

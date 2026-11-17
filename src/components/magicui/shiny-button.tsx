"use client";

import React from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface ShinyButtonProps extends HTMLMotionProps<"button"> {
  children: React.ReactNode;
  className?: string;
}

export function ShinyButton({
  children,
  className,
  ...props
}: ShinyButtonProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-xl px-6 py-3 font-medium transition-all duration-300",
        "bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-luxury hover:shadow-indigo-500/30",
        "border border-indigo-400/30 active:scale-95",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide">
        {children}
      </span>
      <span
        className="pointer-events-none absolute -inset-full top-0 block -rotate-45 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{ animation: "shimmer 2.5s infinite" }}
      />
    </motion.button>
  );
}

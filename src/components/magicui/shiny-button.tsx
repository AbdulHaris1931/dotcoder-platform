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
        "relative rounded-xl px-5 py-2.5 font-medium backdrop-blur-xl transition-all duration-300",
        "bg-gradient-to-r from-indigo-500 via-indigo-600 to-indigo-700 text-white shadow-glow hover:shadow-indigo-500/50",
        "border border-white/20 active:scale-95",
        "overflow-hidden",
        className
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center justify-center gap-2 text-sm font-semibold tracking-wide">
        {children}
      </span>
      <span
        className="pointer-events-none absolute -inset-full top-0 block -rotate-45 bg-gradient-to-r from-transparent via-white/25 to-transparent opacity-0 transition-opacity duration-500 hover:opacity-100"
        style={{ animation: "shimmer 2.5s infinite" }}
      />
    </motion.button>
  );
}

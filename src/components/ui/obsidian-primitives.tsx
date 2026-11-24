import React from "react";
import { cn } from "@/lib/utils";

export function ObsidianCard({
  className,
  interactive = false,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { interactive?: boolean }) {
  return (
    <div
      className={cn(
        "rounded-2xl bg-[#0C120F] border border-[#1E2C24] shadow-obsidian",
        interactive &&
          "transition-all duration-200 hover:bg-[#111915] hover:border-[#9DFF00]/35 hover:-translate-y-0.5",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export function MetricTile({
  label,
  value,
  subtext,
  icon: Icon,
  accent = "lime",
}: {
  label: string;
  value: string | number;
  subtext?: string;
  icon: React.ComponentType<{ className?: string }>;
  accent?: "lime" | "emerald" | "amber" | "rose" | "sky" | "neutral";
}) {
  const accentMap = {
    lime: "text-[#9DFF00] bg-[#9DFF00]/10 border-[#9DFF00]/25",
    emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
    amber: "text-amber-400 bg-amber-500/10 border-amber-500/25",
    rose: "text-rose-400 bg-rose-500/10 border-rose-500/25",
    sky: "text-sky-400 bg-sky-500/10 border-sky-500/25",
    neutral: "text-[#99A9A0] bg-[#121B16] border-[#1E2C24]",
  };

  return (
    <ObsidianCard interactive className="p-5 flex flex-col justify-between gap-4">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-mono uppercase tracking-wider text-[#99A9A0] font-semibold">
          {label}
        </span>
        <span className={cn("p-2 rounded-xl border", accentMap[accent])}>
          <Icon className="w-4 h-4" />
        </span>
      </div>
      <div>
        <div className="text-3xl font-display font-bold tracking-tight text-[#F4F7F5] tabular-nums">
          {value}
        </div>
        {subtext && (
          <p className="text-xs text-[#85998D] mt-1 font-medium">{subtext}</p>
        )}
      </div>
    </ObsidianCard>
  );
}

export function EmptyStatePanel({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-[#2C4034] bg-[#0C120F]/70 p-10 text-center flex flex-col items-center justify-center gap-3">
      <div className="w-11 h-11 rounded-2xl bg-[#121B16] border border-[#1E2C24] flex items-center justify-center text-[#9DFF00]">
        <Icon className="w-5 h-5" />
      </div>
      <div className="space-y-1 max-w-md">
        <h3 className="text-sm font-display font-bold text-[#F4F7F5]">{title}</h3>
        <p className="text-xs text-[#99A9A0] leading-relaxed">{description}</p>
      </div>
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}

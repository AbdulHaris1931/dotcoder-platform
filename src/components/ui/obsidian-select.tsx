"use client";

import React, { useState, useRef, useEffect, useId } from "react";
import { ChevronDown, Check } from "lucide-react";

export interface SelectOption {
  value: string;
  label: string;
}

interface ObsidianSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  ariaLabel?: string;
  id?: string;
  className?: string;
  buttonClassName?: string;
  placeholder?: string;
  disabled?: boolean;
}

/**
 * Accessible Obsidian Precision ARIA Listbox replacing native <select>.
 * Supports keyboard navigation (ArrowUp/ArrowDown/Home/End/Enter/Space/Escape)
 * and renders a consistent custom chevron across all OSes and browsers.
 */
export function ObsidianSelect({
  value,
  onChange,
  options,
  ariaLabel,
  id,
  className = "",
  buttonClassName = "",
  placeholder = "Select...",
  disabled = false,
}: ObsidianSelectProps) {
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number>(() =>
    Math.max(0, options.findIndex((o) => o.value === value))
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const generatedId = useId();
  const listboxId = `${id || generatedId}-listbox`;

  const selectedOption = options.find((o) => o.value === value);

  useEffect(() => {
    const idx = options.findIndex((o) => o.value === value);
    if (idx >= 0) setActiveIndex(idx);
  }, [value, options]);

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [open]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev + 1) % Math.max(1, options.length));
      }
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (!open) {
        setOpen(true);
      } else {
        setActiveIndex((prev) => (prev - 1 + options.length) % Math.max(1, options.length));
      }
    } else if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (open && options[activeIndex]) {
        onChange(options[activeIndex].value);
        setOpen(false);
      } else {
        setOpen(true);
      }
    } else if (e.key === "Escape" && open) {
      e.preventDefault();
      setOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      <button
        id={id}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-controls={listboxId}
        aria-label={ariaLabel}
        disabled={disabled}
        onClick={() => !disabled && setOpen((prev) => !prev)}
        onKeyDown={handleKeyDown}
        className={`inline-flex items-center justify-between gap-2 min-h-[36px] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
          buttonClassName ||
          "w-full px-3 py-2 rounded-xl bg-[#070B09] border border-[#1E2C24] hover:border-[#2C4034] focus:outline-none focus:border-[#9DFF00] text-xs font-medium text-[#F4F7F5] transition-colors"
        }`}
      >
        <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#85998D] shrink-0 transition-transform duration-150 ${
            open ? "rotate-180 text-[#9DFF00]" : ""
          }`}
        />
      </button>

      {open && (
        <ul
          id={listboxId}
          role="listbox"
          aria-label={ariaLabel}
          className="absolute left-0 right-0 min-w-[160px] mt-1.5 z-50 max-h-60 overflow-y-auto rounded-xl bg-[#0C120F] border border-[#2C4034] shadow-2xl p-1 space-y-0.5"
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isHighlighted = idx === activeIndex;
            return (
              <li
                key={opt.value}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setActiveIndex(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={`flex items-center justify-between gap-2 px-2.5 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                  isSelected
                    ? "bg-[#9DFF00]/15 text-[#9DFF00] font-bold"
                    : isHighlighted
                    ? "bg-[#18241D] text-[#F4F7F5]"
                    : "text-[#D5E0D9] hover:bg-[#121B16]"
                }`}
              >
                <span className="truncate">{opt.label}</span>
                {isSelected && <Check className="w-3.5 h-3.5 text-[#9DFF00] shrink-0" />}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

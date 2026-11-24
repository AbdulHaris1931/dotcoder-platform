---
version: "2.0"
name: EQLV CODE — Obsidian Precision
description: World-class unified Obsidian & Electric Lime design system for enterprise campus placement, coding labs, and AI-proctored engineering assessments.
colors:
  primary: "#9DFF00"
  primary-hover: "#8CE600"
  primary-muted: "#1A2E05"
  void: "#070B09"
  surface: "#0C120F"
  surface-elevated: "#121B16"
  surface-hover: "#18241D"
  border-hairline: "#1E2C24"
  border-strong: "#2C4034"
  text-primary: "#F4F7F5"
  text-secondary: "#99A9A0"
  text-muted: "#85998D"
  success: "#10B981"
  warning: "#F59E0B"
  error: "#F43F5E"
  info: "#38BDF8"
typography:
  display-xl:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "64px"
    fontWeight: 700
    lineHeight: 1.02
    letterSpacing: "-0.04em"
  display-lg:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "44px"
    fontWeight: 700
    lineHeight: 1.08
    letterSpacing: "-0.03em"
  headline-lg:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "26px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline-md:
    fontFamily: "Space Grotesk, sans-serif"
    fontSize: "18px"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.015em"
  body-md:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "14px"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "0em"
  body-sm:
    fontFamily: "Plus Jakarta Sans, sans-serif"
    fontSize: "12px"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.005em"
  mono-metric:
    fontFamily: "JetBrains Mono, monospace"
    fontSize: "13px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "-0.01em"
rounded:
  sm: "6px"
  md: "10px"
  lg: "14px"
  xl: "20px"
  2xl: "28px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  2xl: "48px"
components:
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.xl}"
    padding: "20px"
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#070B09"
    rounded: "{rounded.md}"
    padding: "10px 18px"
---

# EQLV CODE — Obsidian Precision Design System

## Overview
EQLV CODE is an institutional coding lab, AI-proctored examination engine, and campus placement intelligence SaaS built for colleges, faculty mentors, placement officers (TPOs), and hiring teams. Its unified visual language blends **Obsidian Carbon surfaces** with **Electric Lime (`#9DFF00`) telemetry accents** and architectural precision — delivering the focus of Linear/Raycast with zero visual clutter or generic AI gradients.

## Colors
- **Primary Brand Signal:** Electric Lime (`#9DFF00`) with hover (`#8CE600`) reserved strictly for primary CTAs, active navigation rails, live proctoring beacons, and verified readiness indicators.
- **Unified Obsidian Surfaces:** Void Carbon (`#070B09`) canvas, Obsidian Surface (`#0C120F`) containers, Elevated Panel (`#121B16`), and Interactive Hover (`#18241D`).
- **Tinted Neutral Grays:** Warm-emerald-tinted dark borders (`#1E2C24`, `#2C4034`) and balanced neutral text (`#F4F7F5`, `#99A9A0`, `#85998D`) to eliminate harsh pure-white-on-pure-black glare.
- **Semantic Telemetry:** Emerald (`#10B981`) for accepted submissions, Amber (`#F59E0B`) for warnings/review flags, Rose (`#F43F5E`) for critical violations/errors, Sky (`#38BDF8`) for faculty/cohort metadata.
- **Strict Ban:** Zero purple, violet, or indigo gradients across the entire platform.

## Typography
- **Display (`Space Grotesk`):** Tight negative tracking (`-0.03em` to `-0.04em`), balanced wrapping, unmistakable architectural presence on landing headlines and portal headers.
- **Body (`Plus Jakarta Sans`):** Crisp medium/regular hierarchy (`400`, `500`, `600`, `700`) capped at `65ch` for readable descriptions and instructions.
- **Monospace (`JetBrains Mono`):** Always paired with `tabular-nums` for student roll numbers, exam timers, test-case runtimes, readiness scores, and source code.

## Layout
- **Marketing & Auth:** Asymmetric editorial grids with `max-w-7xl` containment, generous vertical breathing room, and `min-h-[100dvh]` viewport stability.
- **Portals & Dashboards:** Unified Obsidian `AppShell` with slim collapsible sidebar, translucent top command bar (`⌘K`), and high-density data tables with crisp 1px hairline dividers.
- **IDE & Exams:** Strict `h-screen overflow-hidden` split-pane workspaces with persistent divider memory.

## Elevation & Depth
- Layered tonal obsidian surfaces separated by `1px solid #1E2C24` hairlines and top-edge inner specular highlights (`inset 0 1px 0 rgba(255,255,255,0.04)`).
- Subtle radial lime ambience reserved exclusively for hero focal points and active primary CTAs.

## Shapes
- Progressive radii: tighter `rounded-lg`/`rounded-xl` on buttons, badges, and inputs; softer `rounded-2xl`/`rounded-3xl` on primary containers and floating panels.

## Components
- **Brand Mark:** `/logo.png` paired with `EQLV` (`font-display font-bold tracking-tight text-white`) + `CODE` (`font-mono font-bold tracking-wider text-[#9DFF00]`).
- **Primary Action:** Solid `#9DFF00` fill with `#070B09` bold text, crisp hover luminance shift, and tactile `active:scale-[0.98]`.
- **Composed Empty States:** Every clean-slate dashboard (0 students / 0 submissions) renders an intentional onboarding card with clear next action rather than blank tables.

## Do's and Don'ts
- **DO** enforce WCAG AA contrast (`>= 4.5:1` for text, `#070B09` black text on `#9DFF00` lime fills).
- **DO** use `tabular-nums` on every KPI, timer, percentage, and roll number.
- **DON'T** mix random white light-mode pages into the unified obsidian portal shell.
- **DON'T** use purple/violet/indigo gradients, generic 3-equal-card SaaS rows, or emoji clutter.

---
name: obsidian-ui-audit
description: Full-platform visual, typography, WCAG 2.1 contrast, and Obsidian & Electric Lime token audit for Next.js App Router pages and components.
when_to_use: "When auditing or fixing abnormal text colors, low-contrast typography, light-mode leaks inside a dark Obsidian shell, purple/indigo leftovers, or UI inconsistencies across pages. NOT for backend-only API or SQL tasks."
allowed-tools: Read, Write, Edit, Grep, Glob, Bash
version: 1.0.0
effort: high
---

# Obsidian UI Audit — Full-Platform Contrast, Typography & Theme Lock

> One dark Obsidian Precision system across every route. Zero invisible dark-on-dark text, zero blinding white light-mode cards inside the dark shell, zero WCAG AA contrast failures.

## Overview
This skill codifies a repeatable two-layer audit (static AST/token scan + live headless Chrome computed-style WCAG 2.1 contrast measurement) anchored to `DESIGN.md` ("EQLV CODE — Obsidian Precision"). It detects and remediates every color, contrast, typography, and layout anomaly across all App Router pages and shared components.

## When to Use
- ✅ Auditing all pages after a partial redesign or before shipping
- ✅ Fixing unreadable text colors (e.g., `text-slate-900` / `text-slate-600` on `#070B09`, or `text-slate-500` failing WCAG AA)
- ✅ Eliminating light-mode islands (`bg-white`, `bg-slate-50`) inside the `#070B09` dark shell
- ✅ Eradicating banned purple/violet/indigo classes and mismatched legacy dark palettes (`#161B22`, `#0D1117`, `#0B0F17`, `#121824`)
- ❌ Not for intentional print artifacts (e.g., `.paper-resume` A4 print preview on `/student/resume`)

---

## Canonical Token Mapping (`DESIGN.md` v2.0)

| Legacy / Abnormal Class | Canonical Obsidian Replacement | Purpose / Contrast |
|---|---|---|
| `bg-white`, `bg-slate-50`, `bg-gray-50`, `bg-[#161B22]`, `bg-[#121824]` | `bg-[#0C120F]` (or `surface-card`) | Primary card / container surface |
| `bg-slate-100`, `bg-[#21262D]`, `bg-[#161F30]`, `bg-[#111114]` | `bg-[#121B16]` | Elevated panel, table header, pill, sub-card |
| `bg-[#0D1117]`, `bg-[#0B0F17]`, `bg-[#09090B]`, `bg-[#0E131A]` | `bg-[#070B09]` | Page void canvas / form input inset |
| `hover:bg-slate-50`, `hover:bg-slate-100`, `hover:bg-[#21262D]` | `hover:bg-[#18241D]` | Interactive hover surface |
| `border-slate-200`, `border-slate-300`, `border-[#30363D]`, `border-[#1E293B]` | `border-[#1E2C24]` | 1px hairline border |
| `border-slate-400`, `border-[#22314E]` | `border-[#2C4034]` | Strong / focus / hover border |
| `text-slate-900`, `text-slate-800`, `text-gray-900`, `text-black` (on dark) | `text-[#F4F7F5]` | Primary heading & body text (`~18:1` contrast) |
| `text-slate-700`, `text-slate-600`, `text-gray-700`, `text-slate-300` | `text-[#99A9A0]` (secondary) or `text-[#D5E0D9]` (readable copy) | Secondary copy (`>= 7.5:1` on `#0C120F`) |
| `text-slate-500`, `text-gray-500`, `text-slate-400` | `text-[#85998D]` (muted labels) or `text-[#99A9A0]` | WCAG AA-verified muted text (`>= 5.5:1` on `#0C120F`) |
| `bg-blue-50 text-blue-700 border-blue-200` | `bg-sky-500/10 text-sky-300 border-sky-500/25` | Info semantic badge |
| `bg-emerald-50 text-emerald-700 border-emerald-200` | `bg-emerald-500/10 text-emerald-300 border-emerald-500/25` | Success semantic badge |
| `bg-amber-50 text-amber-700 border-amber-200` | `bg-amber-500/10 text-amber-300 border-amber-500/25` | Warning semantic badge |
| `bg-rose-50 text-rose-700 border-rose-200` | `bg-rose-500/10 text-rose-300 border-rose-500/25` | Error / alert semantic badge |
| `indigo-*`, `purple-*`, `violet-*`, `fuchsia-*` | `#9DFF00` (primary CTA/accent) or `sky-*` / `emerald-*` / `amber-*` | Strict Purple/Indigo Ban |
| `bg-[#0F1412] text-white` active tab | `bg-[#9DFF00] text-[#070B09] font-bold` | High-contrast active tab / CTA |
| Primary CTA buttons | `bg-[#9DFF00] hover:bg-[#8CE600] text-[#070B09] font-bold` | Brand primary signal (`15.6:1` contrast) |

---

## Typography Lock
1. **Page Titles & Section Headings (`h1`, `h2`):** Add `font-display tracking-tight text-[#F4F7F5]` (`Space Grotesk`).
2. **Body & Descriptions:** `font-sans text-[#99A9A0]` (`Plus Jakarta Sans`), never darker than `#85998D` on `#070B09`/`#0C120F`.
3. **KPIs, Roll Numbers, Scores, Timers, Badges:** `font-mono tabular-nums`.
4. **Form Inputs & `<select>`:** `bg-[#070B09] border border-[#1E2C24] text-[#F4F7F5] placeholder:text-[#85998D] focus:border-[#9DFF00] focus:outline-none`.

---

## Protocol

### Step 1: Static Token Scan
Scan every `.tsx` file in `src/app/` and `src/components/` for:
- Light backgrounds (`bg-white`, `bg-slate-50`, `bg-slate-100`, `bg-blue-50`, `bg-emerald-50`, `bg-amber-50`, `bg-rose-50`) outside `.paper-resume` or intentional `bg-white/...` alpha modifiers.
- Dark text classes (`text-slate-900`, `text-slate-800`, `text-slate-700`, `text-slate-600`, `text-gray-900`) sitting on dark surfaces.
- Sub-AA muted grays (`text-slate-500`, `text-gray-500`, `text-zinc-500`).
- Banned purple/violet/indigo/fuchsia utilities.
- Off-palette legacy dark hexes (`#161B22`, `#0D1117`, `#0B0F17`, `#121824`, `#161F30`, `#30363D`, `#21262D`, `#1E293B`).

### Step 2: Live Browser WCAG 2.1 Contrast & Geometry Audit
Visit every route across all authenticated roles (`student`, `teacher`, `tpo`, `super_admin`) plus public routes (`/`, `/login`, `/forgot-password`, `/privacy`, `/terms`, `/verify/[id]`) in headless Chrome and measure for every visible element:
1. Effective background color (walking up DOM ancestors until alpha > 0, compositing semi-transparent overlays).
2. Exact WCAG 2.1 contrast ratio: `(L1 + 0.05) / (L2 + 0.05)`. Flag `< 4.5` for normal text (`< 18px` regular / `< 14px` bold) and `< 3.0` for large text.
3. Light-card leak detection: flag non-paper elements with `width > 120px && height > 40px` whose background luminance `L > 0.6` inside the Obsidian dark shell.
4. Horizontal overflow (`document.documentElement.scrollWidth > window.innerWidth + 1`).
5. Zero console errors, zero page errors, zero broken `<img>` elements.

### Step 3: Batch Remediation
- Prioritize severe broken-contrast pages first (light-mode pages inside dark shell), then legacy-dark & component harmonization.
- Preserve 100% of business logic, event handlers, API calls, and accessibility attributes (`aria-label`, `htmlFor`, `type="button"`).
- Keep `.paper-resume` white paper styling intact on `/student/resume` for clean print/PDF export.

### Step 4: Verification Gate
1. Re-run static scanner → verify `0` light-mode leaks (excluding `.paper-resume`), `0` dark-text-on-dark-bg, `0` purple/indigo leftovers.
2. Re-run live Chrome WCAG contrast sweep across all routes → verify `0` contrast failures, `0` white-box leaks, `0` overflow, `0` runtime errors.
3. Run full engineering gate: `npm test && npx tsc --noEmit && npm run lint && npm run build`.

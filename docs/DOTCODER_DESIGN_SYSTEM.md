# DotCoder 2.0 — Design System Specification

> **System Name:** DotCoder 2.0 Design System  
> **Aesthetic Philosophy:** Obsidian Charcoal, Mint Canvas & Electric Lime Precision  
> **Target Audience:** Engineering Students, College Placement Officers, Corporate Recruiters  
> **Accessibility Standard:** WCAG 2.2 Level AA Compliance  
> **Date:** November 2026

---

## 1. Core Brand Identity & Color Grammar

The DotCoder 2.0 design grammar is built on an intentional **70 / 20 / 10 visual balance**:
* **70% Neutral Surfaces:** Crisp white cards (`#FFFFFF`) and soft mint-tinted canvas surfaces (`#F5F6F3`) that minimize eye strain during extended study and grading sessions.
* **20% Dark Structural Surfaces:** Deep Forest (`#17251B`), Graphite (`#242424`), and Obsidian Charcoal (`#111111`) for persistent navigation, header anchors, and the dedicated DotLab coding IDE.
* **10% Electric Lime High-Signal Accents:** Electric Lime (`#9DFF00`) used deliberately for primary calls-to-action, active navigation pills, and verified credential highlights.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        70% Neutral Surfaces                            │
│                  Canvas: #F5F6F3   │   Cards: #FFFFFF                  │
├────────────────────────────────────────┬───────────────────────────────┤
│       20% Dark Structural Surfaces     │      10% Electric Lime        │
│   Obsidian: #111111 │ Forest: #17251B  │    Primary CTA: #9DFF00       │
└────────────────────────────────────────┴───────────────────────────────┘
```

---

## 2. Complete Token Specification

### 2.1 Brand Palette

| Token Name | Hex Code | Purpose / Usage Context | Contrast Ratio vs Background |
|---|---|---|---|
| `brand-lime-primary` | `#9DFF00` | Primary buttons, active pill backgrounds, verified badges | 14.2:1 against Black `#111111` |
| `brand-lime-hover` | `#8CE600` | Hover state for primary Electric Lime buttons | 12.8:1 against Black `#111111` |
| `brand-black` | `#111111` | Deep structural surfaces, text on Electric Lime buttons | 14.2:1 against `#9DFF00` |
| `brand-graphite` | `#242424` | Secondary dark containers, modal headers, borders in dark mode | 9.8:1 against text |
| `brand-forest` | `#17251B` | Sidebar navigation canvas, subtle dark tint containers | 12.4:1 against text |
| `brand-white` | `#FFFFFF` | Primary card surfaces, elevated containers, input backgrounds | Base surface |
| `brand-soft-bg` | `#F5F6F3` | Main dashboard canvas background | Base surface |
| `brand-border` | `#E5E7E2` | 1px clean container borders, divider rules | Subtle structural rule |
| `brand-text-primary` | `#0F1412` | Main headlines, body copy, high-contrast labels | 16.5:1 on `#FFFFFF` |
| `brand-text-secondary`| `#68716A` | Subtitles, metadata, timestamps, input placeholders | 5.2:1 on `#FFFFFF` (AA Pass) |

### 2.2 Semantic & State Colors

| Semantic Role | Hex Code | Light Surface Tint | Usage Context |
|---|---|---|---|
| **Success** | `#16834A` | `#ECFDF5` (`emerald-50`) | Passed test cases, active streaks, offer extended |
| **Warning** | `#D99520` | `#FFFBEB` (`amber-50`) | Section time <5m, at-risk readiness, marked for review |
| **Error / Alert** | `#D64545` | `#FEF2F2` (`rose-50`) | Failed test cases, proctoring violations, form errors |
| **Information** | `#3678C8` | `#EFF6FF` (`blue-50`) | Department badges, system advisories, companion sync |

---

## 3. Typography & Hierarchy

DotCoder 2.0 employs two specialized typefaces:
* **Display & Body:** `Inter` (variable font with optical sizing enabled for maximum legibility).
* **Code, Numerals & Timers:** `JetBrains Mono` (monospaced with tabular numeral figures enabled).

```css
/* Typography Scale */
--text-display:    32px / 1.15;  font-weight: 800; letter-spacing: -0.025em;
--text-h1:         26px / 1.2;   font-weight: 700; letter-spacing: -0.02em;
--text-h2:         20px / 1.25;  font-weight: 700; letter-spacing: -0.015em;
--text-h3:         16px / 1.35;  font-weight: 600; letter-spacing: -0.01em;
--text-body:       13px / 1.5;   font-weight: 400; letter-spacing: -0.005em;
--text-body-bold:  13px / 1.5;   font-weight: 600; letter-spacing: -0.005em;
--text-caption:    11px / 1.4;   font-weight: 500; letter-spacing: 0.01em;
--text-mono-code:  12.5px / 1.6; font-family: 'JetBrains Mono', monospace;
```

---

## 4. Spacing Scale, Elevation & Radius

### 4.1 Spacing Scale (4px Base Grid)
* `space-1`: `4px` (micro badges, pill padding)
* `space-2`: `8px` (button inline gap, input margins)
* `space-3`: `12px` (card internal padding, metric rows)
* `space-4`: `16px` (table cell padding, standard gutters)
* `space-5`: `20px` (standard card padding)
* `space-6`: `24px` (dashboard section separation)
* `space-8`: `32px` (hero separation, major view containers)

### 4.2 Border Radius Scale
* `rounded-sm`: `6px` (mini code badges, table pills)
* `rounded-md`: `10px` (inputs, buttons, select menus)
* `rounded-lg`: `14px` (cards, modal containers, command palette)
* `rounded-xl`: `20px` (featured visual cards, hero containers)
* `rounded-full`: `9999px` (status indicators, avatar rings)

### 4.3 Elevation & Shadows (Subtle, Non-Diffused)
* `shadow-xs`: `0 1px 2px 0 rgba(0, 0, 0, 0.04)`
* `shadow-sm`: `0 1px 3px 0 rgba(0, 0, 0, 0.06), 0 1px 2px -1px rgba(0, 0, 0, 0.04)`
* `shadow-card`: `0 2px 8px -2px rgba(15, 20, 18, 0.06), 0 1px 2px 0 rgba(15, 20, 18, 0.04)`
* `shadow-drawer`: `-4px 0 24px -4px rgba(15, 20, 18, 0.16)`

---

## 5. Component Patterns & Rules

### 5.1 Buttons

#### Primary Action Button (Electric Lime)
* Background: `#9DFF00`
* Text: `#111111` (Black), `font-weight: 700`, `text-xs` or `text-sm`
* Border: None
* Hover: `#8CE600` (`hover:bg-[#8CE600]`)
* Active: `active:scale-[0.98]`
* Usage: "Run", "Submit Assessment", "Apply Now", "Add Student"

#### Secondary Action Button (Dark Obsidian)
* Background: `#0F1412`
* Text: `#FFFFFF` (White), `font-weight: 600`
* Border: `1px solid #1E2722`
* Hover: `#161D19`
* Usage: "Take Module Assessment", "Download PDF", "Export CSV"

#### Ghost / Tertiary Button
* Background: Transparent (`bg-transparent`)
* Text: `#68716A`, `hover:text-[#0F1412]`, `hover:bg-slate-100`
* Usage: "Cancel", "Clear Filters", Table Row Actions

### 5.2 Cards & Data Containers
* Background: Pure White (`#FFFFFF`) on Soft Background (`#F5F6F3`)
* Border: `1px solid #E5E7E2`
* Radius: `rounded-2xl` (`16px`)
* Padding: `p-5` or `p-6`

### 5.3 Data Tables
* Header: Background `#F9FAF8`, text `#68716A`, uppercase `font-mono text-[11px]`, border-bottom `1px solid #E5E7E2`
* Row: Height `48px`, hover background `#F5F7F4`, transition `150ms ease`
* Cell: Padding `px-4 py-3`, text `#0F1412`, font size `text-xs`

### 5.4 Specialized DotLab IDE Workspace
DotLab retains its dedicated dark developer environment:
* Background Canvas: `#0B0F17` (Deep Obsidian)
* Editor Background: `vs-dark` (`#0F1424` / `#0E131F`)
* Test Dock: Background `#0E131F`, top border `1px solid #1E293B`
* Status Pills:
  * Passed: `#9DFF00` with `20% opacity background` and `#9DFF00/40` border
  * Failed: `#D64545` with `20% opacity background` and `#D64545/40` border

---

## 6. Responsive Breakpoint Standards

* `sm` (640px): Stack 4-column metric cards into 2-column grid.
* `md` (768px): Hide desktop sidebar; display touch navigation hamburger.
* `lg` (1024px): Full 3-pane DotLab IDE layout; full student management table.
* `xl` (1280px): Maximum content canvas constraint (`max-w-7xl` or `max-w-[1200px]`).
